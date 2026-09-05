import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json({
    user_id: userId,
    name: "Learner",
    email: "learner@example.com",
    level: "intermediate",
    language: "English",
    teaching_style: "balanced",
    goal: "Master Neural Networks & AI",
    prior_knowledge: "Basic algebra and Python",
    streak_days: 3,
  });
}
