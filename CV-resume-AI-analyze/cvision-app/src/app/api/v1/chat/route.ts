import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Thiếu tin nhắn" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: "Chưa cấu hình GEMINI_API_KEY." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    // Convert history to Gemini format if needed
    const contents = history.map((msg: { role: string; text: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "Bạn là CVision AI, một chuyên gia nhân sự và cố vấn nghề nghiệp xuất sắc. Bạn giúp người dùng tối ưu CV, trả lời câu hỏi phỏng vấn, định hướng nghề nghiệp, và sửa lỗi CV. Hãy trả lời ngắn gọn, súc tích, chuyên nghiệp, sử dụng ngôn ngữ tự nhiên và thân thiện.",
        temperature: 0.7,
      }
    });

    return NextResponse.json({
      success: true,
      text: response.text || "Xin lỗi, tôi không thể trả lời lúc này."
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Chat API Error:", err);
    return NextResponse.json({ error: "Lỗi phản hồi từ AI: " + errorMsg }, { status: 500 });
  }
}
