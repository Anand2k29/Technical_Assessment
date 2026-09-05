import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "s1",
      title: "Neural Networks & Deep Learning",
      description: "Comprehensive guide to feedforward nets, backpropagation, and loss functions.",
    },
    {
      id: "s2",
      title: "Quantum Computing Principles",
      description: "Introduction to qubits, superposition, entanglement, and quantum gates.",
    },
    {
      id: "s3",
      title: "Cellular Respiration & ATP Synthesis",
      description: "Detailed breakdown of glycolysis, the Krebs cycle, and electron transport.",
    },
  ]);
}
