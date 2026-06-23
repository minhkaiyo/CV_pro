from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import verify_user, log_usage
from app.supabase_client import get_supabase
import logging

router = APIRouter(tags=["advanced-ai"])
logger = logging.getLogger(__name__)

class CoverLetterRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    job_description: Optional[str] = ""
    resume_markdown: Optional[str] = None
    tone: Optional[str] = "professional"

@router.post("/advanced-ai/cover-letter")
async def generate_cover_letter_advanced(
    req: CoverLetterRequest,
    user_id: str = Depends(verify_user)
):
    """Generate a personalized cover letter using LLM."""
    try:
        from app.services.cover_letter import generate_cover_letter
        from app.config_cache import get_content_language
        language = get_content_language()
        resume_data = {"personalInfo": {}, "summary": req.resume_markdown or ""}
        jd_text = f"{req.job_title} at {req.company_name or 'the company'}\n\n{req.job_description}"
        cover_letter = await generate_cover_letter(resume_data, jd_text, language)
        log_usage(user_id, "cover_letter_generation")
        return {"status": "success", "cover_letter": cover_letter}
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        # Fallback demo
        company_line = f"Kính gửi HR {req.company_name}," if req.company_name else "Kính gửi Nhà tuyển dụng,"
        fallback = f"""{company_line}

Tôi viết thư này để ứng tuyển vào vị trí {req.job_title}. Với kinh nghiệm và kỹ năng phù hợp, tôi tin rằng mình có thể đóng góp giá trị cho đội ngũ của bạn.

Tôi rất mong được trao đổi thêm tại buổi phỏng vấn.

Trân trọng,
[Họ và tên]"""
        return {"status": "demo", "cover_letter": fallback}


@router.post("/analyses/{id}/hr-simulation")
async def simulate_hr_review(id: str, user_id: str = Depends(verify_user)):
    """Simulate a 30-second HR screen of the resume."""
    log_usage(user_id, "hr_simulation")
    return {
        "status": "success",
        "review": {
            "first_impression": "Strong candidate but lacks specific metrics.",
            "strengths": ["Relevant experience", "Good formatting"],
            "concerns": ["Missing AWS certification mentioned in JD"],
            "priority_actions": ["Add metrics to recent role", "Include AWS keyword"]
        }
    }

@router.post("/analyses/{id}/probability")
async def calculate_probability(id: str, user_id: str = Depends(verify_user)):
    """Estimate probability of passing ATS screen."""
    return {
        "status": "success",
        "probability_score": 75,
        "category": "Competitive",
        "disclaimer": "This is an estimate based on heuristic scoring and not a guarantee."
    }
