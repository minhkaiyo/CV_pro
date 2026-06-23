"""CV Analysis endpoints — parse, score (deterministic + LLM), persist."""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from typing import Optional
import logging

from app.services.parser import parse_document, parse_resume_to_json
from app.services.improver import extract_job_keywords
from app.supabase_client import get_supabase
from app.auth import verify_user, check_usage_limit, log_usage
from app.llm import complete_json

router = APIRouter(tags=["analyses"])
logger = logging.getLogger(__name__)


# ── Deterministic ATS scorer ─────────────────────────────────────────────────

def _keyword_overlap(resume_text: str, jd: str) -> tuple[list[str], list[str]]:
    """Return (matched, missing) keyword lists from JD vs resume text."""
    import re
    # Extract 2+ letter alphanum tokens from JD as candidate keywords
    jd_tokens = set(
        w.lower() for w in re.findall(r"[A-Za-z][A-Za-z0-9.+#_-]{1,30}", jd or "")
        if w.lower() not in {
            "the", "and", "for", "with", "you", "are", "that", "this",
            "will", "have", "from", "they", "been", "your", "our", "we",
            "can", "all", "not", "but", "its", "has", "who", "what"
        }
    )
    resume_lower = resume_text.lower()
    matched = sorted(kw for kw in jd_tokens if kw in resume_lower)
    missing = sorted(kw for kw in jd_tokens if kw not in resume_lower)
    # Cap lists to keep payload reasonable
    return matched[:30], missing[:20]


def calculate_ats_score(parsed_data: dict, resume_text: str, jd: str) -> dict:
    """Deterministic ATS scoring based on resume structure and JD keyword overlap."""
    matched, missing = _keyword_overlap(resume_text, jd)

    # Section completeness check
    sections_present = sum([
        bool(parsed_data.get("workExperience")),
        bool(parsed_data.get("education")),
        bool(parsed_data.get("additional", {}).get("technicalSkills") if isinstance(parsed_data.get("additional"), dict) else False),
        bool(parsed_data.get("personalInfo", {}).get("email") if isinstance(parsed_data.get("personalInfo"), dict) else False),
        bool(parsed_data.get("personalInfo", {}).get("phone") if isinstance(parsed_data.get("personalInfo"), dict) else False),
    ])
    layout_score = min(60 + sections_present * 8, 100)

    # Keyword score based on ratio matched/total JD keywords
    total_jd_kw = len(matched) + len(missing)
    keyword_score = int((len(matched) / max(total_jd_kw, 1)) * 100) if total_jd_kw else 60

    # Experience quantification (look for numbers in work bullets)
    import re
    work_text = " ".join(
        str(b) for exp in (parsed_data.get("workExperience") or [])
        for b in (exp.get("description") or [])
    )
    has_metrics = bool(re.search(r"\d+\s*(%|x|times|hours?|people|team|million|k\b)", work_text, re.I))
    achievement_score = 75 if has_metrics else 50

    # Content score — basic heuristic
    content_score = min(50 + sections_present * 7 + (10 if has_metrics else 0), 100)

    # ATS platform scores — slight variance around ats_score
    ats_base = min(40 + keyword_score // 2, 95)
    platform_scores = {
        "workday": min(ats_base + 5, 100),
        "taleo": max(ats_base - 5, 0),
        "icims": ats_base,
        "greenhouse": min(ats_base + 3, 100),
        "lever": min(ats_base + 2, 100),
        "successfactors": max(ats_base - 8, 0),
    }

    # Skills score based on skills list length
    skills = []
    if isinstance(parsed_data.get("additional"), dict):
        skills = parsed_data["additional"].get("technicalSkills", [])
    skills_score = min(40 + len(skills) * 5, 100)

    total = int(
        layout_score * 0.15 +
        content_score * 0.25 +
        ats_base * 0.30 +
        keyword_score * 0.15 +
        skills_score * 0.10 +
        achievement_score * 0.05
    )

    return {
        "total_score": total,
        "layout_score": layout_score,
        "content_score": content_score,
        "ats_score": ats_base,
        "keyword_score": keyword_score,
        "skills_score": skills_score,
        "achievement_score": achievement_score,
        "ats_platform_scores": platform_scores,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": [],          # filled by LLM below
        "hr_review": None,
        "summary": "",
        "strengths": [],
        "weaknesses": [],
    }


async def _enrich_with_llm(score_result: dict, resume_text: str, role: str, jd: str) -> dict:
    """Call LLM to add suggestions, HR review, summary. Non-blocking — falls back silently."""
    try:
        schema = {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "strengths": {"type": "array", "items": {"type": "string"}},
                "weaknesses": {"type": "array", "items": {"type": "string"}},
                "suggestions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string"},
                            "priority": {"type": "string"},
                            "problem": {"type": "string"},
                            "recommendation": {"type": "string"},
                            "evidence": {"type": "string"}
                        }
                    }
                },
                "hr_review": {
                    "type": "object",
                    "properties": {
                        "first_impression": {"type": "string"},
                        "strengths": {"type": "array", "items": {"type": "string"}},
                        "concerns": {"type": "array", "items": {"type": "string"}},
                        "priority_actions": {"type": "array", "items": {"type": "string"}}
                    }
                }
            }
        }

        prompt = f"""Bạn là chuyên gia tuyển dụng và hệ thống ATS. Phân tích CV dưới đây cho vị trí: {role}
{"JD: " + jd[:2000] if jd else ""}

CV (rút gọn):
{resume_text[:6000]}

Điểm số đã tính: total={score_result['total_score']}, ats={score_result['ats_score']}, keywords={score_result['keyword_score']}
Từ khóa khớp: {', '.join(score_result['matched_keywords'][:10])}
Từ khóa thiếu: {', '.join(score_result['missing_keywords'][:10])}

Trả về JSON với: summary (1-2 câu), strengths (3 điểm), weaknesses (3 điểm),
suggestions (3-5 gợi ý với category/priority/problem/recommendation/evidence),
hr_review (first_impression, strengths, concerns, priority_actions).
Tất cả bằng tiếng Việt."""

        result = await complete_json(prompt, schema, schema_type="enrichment")
        if result:
            score_result.update({
                "summary": result.get("summary", ""),
                "strengths": result.get("strengths", []),
                "weaknesses": result.get("weaknesses", []),
                "suggestions": result.get("suggestions", []),
                "hr_review": result.get("hr_review"),
            })
    except Exception as e:
        logger.warning(f"LLM enrichment failed (non-blocking): {e}")
    return score_result


# ── POST /analyses ────────────────────────────────────────────────────────────

@router.post("/analyses", dependencies=[Depends(check_usage_limit)])
async def analyze_resume(
    cv: UploadFile = File(...),
    role: str = Form(...),
    jd: Optional[str] = Form(""),
    user_id: str = Depends(verify_user)
):
    """Parse CV, score deterministically, enrich with LLM, persist to Supabase."""
    try:
        # 1. Parse file to markdown + structured JSON
        content = await cv.read()
        markdown_text = await parse_document(content, cv.filename or "resume.pdf")

        parsed_json: dict = {}
        try:
            parsed_json = await parse_resume_to_json(markdown_text)
        except Exception as e:
            logger.warning(f"Structured parse failed, continuing with markdown only: {e}")

        # 2. Deterministic ATS scoring
        score_result = calculate_ats_score(parsed_json, markdown_text, jd or "")

        # 3. LLM enrichment (non-blocking fallback)
        score_result = await _enrich_with_llm(score_result, markdown_text, role, jd or "")

        # 4. Persist to Supabase
        supabase = get_supabase()

        job_res = supabase.table("jobs").insert({
            "user_id": user_id,
            "job_title": role,
            "job_description": jd or "",
        }).execute()
        job_id = job_res.data[0]["id"] if job_res.data else None

        resume_res = supabase.table("resumes").insert({
            "user_id": user_id,
            "name": cv.filename or "resume",
            "source_file_type": "pdf" if (cv.filename or "").endswith(".pdf") else "docx",
            "extracted_text": markdown_text,
            "parsed_data": parsed_json,
            "processing_status": "ready",
        }).execute()
        resume_id = resume_res.data[0]["id"] if resume_res.data else None

        analysis_res = supabase.table("analyses").insert({
            "user_id": user_id,
            "resume_id": resume_id,
            "job_id": job_id,
            "total_score": score_result["total_score"],
            "layout_score": score_result["layout_score"],
            "content_score": score_result["content_score"],
            "ats_score": score_result["ats_score"],
            "keyword_score": score_result["keyword_score"],
            "skills_score": score_result["skills_score"],
            "achievement_score": score_result["achievement_score"],
            "ats_platform_scores": score_result["ats_platform_scores"],
            "matched_keywords": score_result["matched_keywords"],
            "missing_keywords": score_result["missing_keywords"],
            "suggestions": score_result["suggestions"],
            "hr_review": score_result.get("hr_review"),
            "summary": score_result.get("summary", ""),
        }).execute()
        analysis_id = analysis_res.data[0]["id"] if analysis_res.data else None

        log_usage(user_id, "analysis", {"resume_id": resume_id, "job_id": job_id})

        return {
            "status": "success",
            "analysis_id": analysis_id,
            "resume_id": resume_id,
            "job_id": job_id,
            "result": score_result,
        }

    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


# ── GET /analyses ─────────────────────────────────────────────────────────────

@router.get("/analyses")
async def list_analyses(user_id: str = Depends(verify_user)):
    """List all analyses for the current user, newest first."""
    supabase = get_supabase()
    res = (
        supabase.table("analyses")
        .select("id, total_score, ats_score, keyword_score, created_at, resume_id, job_id")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    # Enrich with resume name and job title
    items = []
    for row in (res.data or []):
        item = dict(row)
        # Fetch resume name
        if row.get("resume_id"):
            r = supabase.table("resumes").select("name").eq("id", row["resume_id"]).maybe_single().execute()
            item["file_name"] = r.data["name"] if r.data else ""
        # Fetch job title
        if row.get("job_id"):
            j = supabase.table("jobs").select("job_title").eq("id", row["job_id"]).maybe_single().execute()
            item["role"] = j.data["job_title"] if j.data else ""
        items.append(item)
    return {"analyses": items}


@router.get("/analyses/{id}")
async def get_analysis(id: str, user_id: str = Depends(verify_user)):
    """Get full analysis detail by ID."""
    supabase = get_supabase()
    res = (
        supabase.table("analyses")
        .select("*")
        .eq("id", id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return res.data


@router.delete("/analyses/{id}")
async def delete_analysis(id: str, user_id: str = Depends(verify_user)):
    """Delete an analysis owned by the current user."""
    supabase = get_supabase()
    supabase.table("analyses").delete().eq("id", id).eq("user_id", user_id).execute()
    return {"status": "deleted"}
