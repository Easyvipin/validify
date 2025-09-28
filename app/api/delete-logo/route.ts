import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary"; // your cloudinary config

export async function POST(req: Request) {
  const { publicId } = await req.json();

  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
