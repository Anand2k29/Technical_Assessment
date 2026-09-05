import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}

  const responseText = (body.response_text as string) || "";
  const isCorrect = responseText.toLowerCase().includes("activation") || responseText.length > 3;

  return NextResponse.json({
    correct: isCorrect,
    ui_state: "teaching",
    state: {
      current_concept: "Activation Functions & Non-Linearity",
      mastery: isCorrect ? 0.88 : 0.45,
      difficulty: "intermediate",
      attempts: 1,
      misconceptions: isCorrect ? [] : ["Linear Activation Misconception"],
      next_action: "next_section",
    },
    evaluation: {
      correct: isCorrect,
      confidence: 0.92,
      reasoning: isCorrect
        ? "Excellent job! Activation functions like ReLU and Sigmoid enable neural networks to learn non-linear boundaries."
        : "Let's review: without activation functions, stacking layers only results in a single linear transformation.",
    },
    misconception: isCorrect
      ? null
      : {
          misconception: "Linear Activation Assumption",
          description: "Assuming linear combinations alone can model complex non-linear data patterns.",
          severity: "medium",
          recommended_strategy: "Visual explanation of non-linear decision boundaries.",
          reexplain: "Activation functions bend the feature space so the network can separate complex data classes.",
        },
  });
}
