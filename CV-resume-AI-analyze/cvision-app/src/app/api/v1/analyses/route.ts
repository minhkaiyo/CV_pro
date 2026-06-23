import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export const maxDuration = 60;

// ── Response schema (used for prompt guidance; we parse JSON manually) ────────

const analysisSchema = z.object({
  total_score: z.number(),
  layout_score: z.number(),
  content_score: z.number(),
  ats_score: z.number(),
  keyword_score: z.number(),
  skills_score: z.number(),
  achievement_score: z.number(),
  matched_keywords: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  ats_platform_scores: z.object({
    workday: z.number(),
    taleo: z.number(),
    icims: z.number(),
    greenhouse: z.number(),
    lever: z.number(),
    successfactors: z.number(),
  }),
  suggestions: z.array(z.object({
    category: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    problem: z.string(),
    recommendation: z.string(),
    evidence: z.string(),
  })),
  hr_review: z.object({
    first_impression: z.string(),
    strengths: z.array(z.string()),
    concerns: z.array(z.string()),
    priority_actions: z.array(z.string()),
  }),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const role = formData.get("role") as string;
    const jd = (formData.get("jd") as string) ?? "";
    const cvText = formData.get("cvText") as string;

    if (!cvText || cvText.length < 50) {
      return NextResponse.json(
        { error: "cvText is required (min 50 chars). Extract text on client before calling this route." },
        { status: 400 }
      );
    }
    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!openaiKey && !geminiKey) {
      return NextResponse.json({ error: "Chưa cấu hình API Key (GEMINI_API_KEY hoặc OPENAI_API_KEY) trong biến môi trường." }, { status: 503 });
    }

    const prompt = `Bạn là chuyên gia tuyển dụng và hệ thống phân tích ATS chuyên nghiệp.
Phân tích CV dưới đây cho vị trí: ${role}
${jd ? `\nJob Description:\n${jd.substring(0, 3000)}\n` : ""}

NỘI DUNG CV:
${cvText.substring(0, 15000)}

Trả về JSON hợp lệ theo schema sau (không có markdown, không giải thích thêm):
{
  "total_score": <0-100>,
  "layout_score": <0-100>,
  "content_score": <0-100>,
  "ats_score": <0-100>,
  "keyword_score": <0-100>,
  "skills_score": <0-100>,
  "achievement_score": <0-100>,
  "matched_keywords": ["..."],
  "missing_keywords": ["..."],
  "ats_platform_scores": { "workday": 0, "taleo": 0, "icims": 0, "greenhouse": 0, "lever": 0, "successfactors": 0 },
  "suggestions": [{ "category": "keyword|content|ats|achievement|skill|layout", "priority": "high|medium|low", "problem": "...", "recommendation": "...", "evidence": "..." }],
  "hr_review": { "first_impression": "...", "strengths": ["..."], "concerns": ["..."], "priority_actions": ["..."] },
  "summary": "...",
  "strengths": ["..."],
  "weaknesses": ["..."]
}
Trả lời hoàn toàn bằng Tiếng Việt. Điểm số phải thực tế (không phải 100 trừ khi thực sự xuất sắc).`;

    let raw = "{}";

    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });
      raw = response.text || "{}";
    } else if (openaiKey) {
      const client = new OpenAI({ apiKey: openaiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });
      raw = completion.choices[0]?.message?.content ?? "{}";
    }

    const parsed = JSON.parse(raw);
    const validated = analysisSchema.parse(parsed);

    return NextResponse.json({
      success: true,
      analysis_id: `ai_${Date.now()}`,
      result: validated,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
