import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profile = {
      user_id: `user_${Date.now()}`,
      name: body.name || "Learner",
      email: body.email || "learner@example.com",
      level: body.level || "beginner",
      language: body.language || "English",
      teaching_style: body.teaching_style || "balanced",
      goal: body.goal || "Master my subject",
      prior_knowledge: body.prior_knowledge || "",
      streak_days: 1,
    };
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}
