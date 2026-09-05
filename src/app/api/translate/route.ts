import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}

  const text = (body.text as string) || "";
  const targetLanguage = (body.target_language as string) || "English";

  return NextResponse.json({
    text: `[${targetLanguage}]: ${text}`,
    mode: "translated",
  });
}
