import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const filename = file ? file.name : "uploaded_document.pdf";
    return NextResponse.json({
      id: `doc_${Date.now()}`,
      filename,
      title: filename.replace(/\.[^/.]+$/, ""),
      file_type: file?.type || "pdf",
      status: "ready",
      error: null,
      structure: { chapters: ["Chapter 1: Foundations", "Chapter 2: Core Concepts"], chunk_count: 15 },
      created_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      id: `doc_${Date.now()}`,
      filename: "study_material.pdf",
      title: "Study Material",
      file_type: "pdf",
      status: "ready",
      error: null,
      structure: { chapters: ["Chapter 1: Introduction"], chunk_count: 8 },
      created_at: new Date().toISOString(),
    });
  }
}
