import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json({
    profile: {
      user_id: userId,
      name: "Learner",
      email: "learner@example.com",
      level: "intermediate",
      language: "English",
      teaching_style: "balanced",
      goal: "Master Neural Networks & AI",
      prior_knowledge: "Basic algebra and Python",
      streak_days: 3,
    },
    progress: {
      overall_mastery: 0.72,
      concepts_mastered: 4,
      weak_concepts: [
        { concept: "Backpropagation", mastery: 0.35 },
        { concept: "Activation Functions", mastery: 0.48 },
      ],
    },
    recent_assessments: [
      {
        score: 85,
        weak_areas: ["Gradient Descent Optimization"],
        recommended_next_topic: "Convolutional Neural Networks",
        created_at: new Date().toISOString(),
      },
    ],
    recent_lessons: [
      {
        id: "les_1",
        title: "Introduction to Neural Networks",
        status: "completed",
        difficulty: "beginner",
      },
      {
        id: "les_2",
        title: "Backpropagation & Loss Functions",
        status: "teaching",
        difficulty: "intermediate",
      },
    ],
    continue_learning: {
      lesson_id: "les_2",
      title: "Backpropagation & Loss Functions",
    },
    recommended_next: "Master Gradient Descent Optimization",
    streak_days: 3,
  });
}
