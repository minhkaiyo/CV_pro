import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 });
    }

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json({ error: "Thiếu cấu hình Cloudinary API" }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `cvision_uploads`;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId = `${folder}/${timestamp}_${safeName}`;

    // Tạo signature
    const signStr = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha256').update(signStr).digest('hex');

    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([buffer], { type: file.type }), safeName);
    uploadFormData.append("api_key", API_KEY);
    uploadFormData.append("timestamp", timestamp.toString());
    uploadFormData.append("signature", signature);
    uploadFormData.append("folder", folder);
    uploadFormData.append("public_id", publicId);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
      method: "POST",
      body: uploadFormData
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error?.message || "Lỗi upload lên Cloud");
    }

    return NextResponse.json({
      success: true,
      url: uploadData.secure_url,
      fileName: file.name
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Upload API Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
