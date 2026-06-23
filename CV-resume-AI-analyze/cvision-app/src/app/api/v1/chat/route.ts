// chat/route.ts — CVision AI Chat API (dùng fetch thuần, không phụ thuộc SDK)
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

const SYSTEM_INSTRUCTION =
  "Bạn là CVision AI, một chuyên gia nhân sự và cố vấn nghề nghiệp xuất sắc. " +
  "Bạn giúp người dùng tối ưu CV, trả lời câu hỏi phỏng vấn, định hướng nghề nghiệp, và sửa lỗi CV. " +
  "Hãy trả lời ngắn gọn, súc tích, chuyên nghiệp, sử dụng ngôn ngữ tự nhiên và thân thiện.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json({ error: "Thiếu tin nhắn" }, { status: 400 });
    }

    const { message, history = [] } = body;

    const geminiKey = process.env.CVISION_GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: "Chưa cấu hình API key cho AI." }, { status: 400 });
    }

    // Build contents array theo Gemini REST API format
    const contents = [
      ...(history as Array<{ role: string; text: string }>).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const MODEL = "gemini-3.1-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${geminiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = data?.error?.message || `Gemini API error ${geminiRes.status}`;
      console.error("Gemini API error:", data);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi không thể trả lời lúc này.";

    return NextResponse.json({ success: true, text });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Chat route crash:", err);
    return NextResponse.json({ error: "Lỗi server: " + errorMsg }, { status: 500 });
  }
}
