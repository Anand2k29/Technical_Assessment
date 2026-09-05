import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json({
    user_id: userId,
    concept_mastery: [
      { concept: "Perceptrons & Inputs", mastery: 0.92, attempts: 3 },
      { concept: "Activation Functions", mastery: 0.85, attempts: 2 },
      { concept: "Loss Functions & MSE", mastery: 0.78, attempts: 2 },
      { concept: "Backpropagation Chain Rule", mastery: 0.45, attempts: 4 },
      { concept: "Gradient Descent", mastery: 0.55, attempts: 3 },
    ],
    misconceptions: [
      {
        label: "Linear Activation Myth",
        description: "Assuming linear functions allow deep representation learning",
        severity: "medium",
        resolved: true,
      },
    ],
  });
}
