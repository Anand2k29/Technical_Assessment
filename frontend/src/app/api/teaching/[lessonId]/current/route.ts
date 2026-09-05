import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  return NextResponse.json({
    lesson_id: lessonId,
    ui_state: "teaching",
    state: {
      current_concept: "Perceptron & Artificial Neurons",
      mastery: 0.65,
      difficulty: "intermediate",
      attempts: 1,
      misconceptions: [],
      next_action: "present_section",
    },
    section: {
      id: "sec_1",
      order_index: 1,
      title: "What is a Neural Network?",
      concept: "Perceptron & Artificial Neurons",
      script: "Welcome! A neural network is inspired by biological neurons in the human brain. It takes weighted inputs, computes a sum, and applies an activation function.",
      examples: ["Image recognition: converting pixel values to category predictions."],
      visual_spec: {
        type: "diagram",
        subject: "Neural Network Architecture",
        title: "Inputs → Weights → Activation → Output",
      },
      source_refs: [{ document: "Neural Networks Guide", chapter: "Chapter 1", page: 4 }],
      checkpoint_question: {
        id: "q1",
        text: "What component introduces non-linearity into a neuron's computation?",
        type: "multiple_choice",
        options: ["Activation Function", "Linear Bias", "Input Vector", "Learning Rate"],
      },
    },
    question: {
      id: "q1",
      text: "What component introduces non-linearity into a neuron's computation?",
      type: "multiple_choice",
      options: ["Activation Function", "Linear Bias", "Input Vector", "Learning Rate"],
    },
  });
}
