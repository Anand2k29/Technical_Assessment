import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: "AUTOPSY",
    demo_mode: true,
    llm_live: false,
    model: "Claude 3.5 Sonnet (Demo Fallback)",
    note: "AUTOPSY AI Teacher is running in prototype mode.",
  });
}
