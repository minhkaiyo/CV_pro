import { NextRequest, NextResponse } from "next/server";
import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";

// pdf-parse may export as default or named depending on bundler/version
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
  (pdfParseModule as { default?: unknown }).default as ((buffer: Buffer) => Promise<{ text: string }>) ?? 
  (pdfParseModule as unknown as (buffer: Buffer) => Promise<{ text: string }>);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (ext === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else if (ext === 'docx' || ext === 'doc') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (ext === 'pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return NextResponse.json({ error: "Tính năng trích xuất văn bản từ ảnh yêu cầu GEMINI_API_KEY trong biến môi trường." }, { status: 400 });
      }
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const base64Image = buffer.toString("base64");
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          "Vui lòng trích xuất toàn bộ văn bản có trong ảnh này (đây là CV). Giữ nguyên định dạng và bố cục tốt nhất có thể. Không bịa đặt thêm nội dung.",
          {
            inlineData: {
              data: base64Image,
              mimeType: file.type || 'image/png',
            }
          }
        ]
      });
      extractedText = response.text || "";
    } else {
      return NextResponse.json({ error: `Định dạng .${ext} không được hỗ trợ. Hỗ trợ: txt, docx, pdf, png, jpg, webp` }, { status: 415 });
    }

    // Cleanup & Format Text
    extractedText = String(extractedText || '')
        .replace(/\0/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{4,}/g, '\n\n')
        .replace(/[ \t]{3,}/g, '  ')
        .trim();

    if (!extractedText || extractedText.length < 5) {
      return NextResponse.json({ error: "File rỗng hoặc không thể đọc được nội dung chữ." }, { status: 422 });
    }

    // Truncate to save LLM tokens (approx 50000 chars)
    if (extractedText.length > 50000) {
      extractedText = extractedText.slice(0, 50000);
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
      fileName: file.name,
      ext
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Parse File API Error:", err);
    return NextResponse.json({ error: "Lỗi trích xuất: " + message }, { status: 500 });
  }
}
