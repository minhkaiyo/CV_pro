import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

type ChatHistoryMessage = {
  role: "user" | "model";
  text: string;
};

type ChatRequestBody = {
  message: string;
  history?: ChatHistoryMessage[];
};

const SYSTEM_INSTRUCTION =
  "Ban la CVision AI, mot chuyen gia nhan su va co van nghe nghiep xuat sac. " +
  "Ban giup nguoi dung toi uu CV, tra loi cau hoi phong van, dinh huong nghe nghiep, va sua loi CV. " +
  "Hay tra loi ngan gon, suc tich, chuyen nghiep, su dung ngon ngu tu nhien va than thien.";

function normalizeHistory(history: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter((item): item is ChatHistoryMessage => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const candidate = item as Partial<ChatHistoryMessage>;
    return (
      (candidate.role === "user" || candidate.role === "model") &&
      typeof candidate.text === "string" &&
      candidate.text.trim().length > 0
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as ChatRequestBody | null;
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Thieu tin nhan" }, { status: 400 });
    }

    const geminiKey = process.env.CVISION_GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: "Chua cau hinh API key cho AI." }, { status: 400 });
    }

    const contents = [
      ...normalizeHistory(body?.history).map((item) => ({
        role: item.role,
        parts: [{ text: item.text.trim() }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const model = "gemini-3.1-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

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
      typeof data?.candidates?.[0]?.content?.parts?.[0]?.text === "string"
        ? data.candidates[0].content.parts[0].text
        : "Xin loi, toi khong the tra loi luc nay.";

    return NextResponse.json({ success: true, text });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Chat route crash:", err);
    return NextResponse.json({ error: `Loi server: ${errorMsg}` }, { status: 500 });
  }
}
