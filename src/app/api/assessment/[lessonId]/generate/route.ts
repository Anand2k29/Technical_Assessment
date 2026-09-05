import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  return NextResponse.json({
    assessment_id: `ass_${Date.now()}`,
    lesson_id: lessonId,
    questions: [
      {
        id: "aq1",
        text: "Explain how backpropagation uses the chain rule to calculate partial derivatives of loss.",
        type: "open_ended",
        options: [],
      },
      {
        id: "aq2",
        text: "Which activation function is most prone to the vanishing gradient problem in deep networks?",
        type: "multiple_choice",
        options: ["Sigmoid", "ReLU", "Leaky ReLU", "GELU"],
      },
    ],
  });
}
