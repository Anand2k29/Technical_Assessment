import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}

  const topicName = (body.topic as string) || "Neural Networks & Deep Learning";
  const duration = (body.duration_minutes as number) || 15;

  return NextResponse.json({
    lesson_id: `les_${Date.now()}`,
    topic: topicName,
    duration_minutes: duration,
    difficulty: "intermediate",
    language: "English",
    grounded: true,
    objectives: [
      `Understand core principles of ${topicName}`,
      "Master the key mechanisms and formulas",
      "Apply knowledge to solve real-world problem scenarios",
    ],
    sections: [
      {
        id: "sec_1",
        order_index: 1,
        title: `Introduction to ${topicName}`,
        concept: "Fundamental Concepts & Definitions",
        script: `Welcome to our session on ${topicName}! In this lesson, we will break down the essential components step-by-step so you gain complete intuitive mastery.`,
        examples: [
          "Real-world application in predictive modeling.",
          "Practical scenario analysis in production systems.",
        ],
        visual_spec: {
          type: "diagram",
          subject: topicName,
          title: "System Flow & Conceptual Mapping",
        },
        source_refs: [{ document: "Course Material", chapter: "Chapter 1", page: 3 }],
        checkpoint_question: {
          id: "q1",
          text: `Which core mechanism is most critical in ${topicName}?`,
          type: "multiple_choice",
          options: [
            "Mathematical Transformation & Optimization",
            "Random Guessing",
            "Static Configuration",
            "Manual Calculation",
          ],
        },
      },
    ],
    llm_live: true,
  });
}
