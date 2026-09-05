const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: options.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Catch fetch/network error
  }

  if (fallback !== undefined) {
    return fallback;
  }
  throw new ApiError(404, "Unable to process request. Please try again.");
}

const post = <T>(path: string, body?: unknown, fallback?: T) =>
  request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }, fallback);
const get = <T>(path: string, fallback?: T) => request<T>(path, undefined, fallback);

// ---- Types ----
export interface Profile {
  user_id: string; name: string; email: string; level: string; language: string;
  teaching_style: string; goal: string; prior_knowledge: string; streak_days: number;
}
export interface DocumentOut {
  id: string; filename: string; title: string; file_type: string; status: string;
  error: string | null; structure: { chapters?: string[]; chunk_count?: number }; created_at: string;
}
export interface VisualSpec {
  type: "equation" | "diagram" | "timeline" | "code" | "concept_card";
  subject: string; title: string; [key: string]: unknown;
}
export interface CheckpointQuestion { id: string; text: string; type: string; options: string[]; }
export interface LessonSectionOut {
  id: string; order_index: number; title: string; concept: string; script: string;
  examples: string[]; visual_spec: VisualSpec; source_refs: { document?: string; chapter?: string; page?: number }[];
  checkpoint_question: CheckpointQuestion;
}
export interface LessonPlan {
  lesson_id: string; topic: string; duration_minutes: number; difficulty: string; language: string;
  grounded: boolean; objectives: string[]; sections: LessonSectionOut[]; llm_live: boolean;
}
export interface TeachingState {
  current_concept: string; mastery: number; difficulty: string; attempts: number;
  misconceptions: string[]; next_action: string;
}
export interface StartTeachingOut {
  lesson_id: string; ui_state: string; state: TeachingState; section: LessonSectionOut; question: CheckpointQuestion | null;
}
export interface CurrentTeachingOut {
  lesson_id: string; ui_state: string; state: TeachingState; section?: LessonSectionOut; question?: CheckpointQuestion | null;
}
export interface AnswerResult {
  correct: boolean; ui_state: string; state: TeachingState;
  evaluation: { correct: boolean; confidence: number; reasoning: string };
  misconception: { misconception: string; description: string; severity: string; recommended_strategy: string; reexplain: string } | null;
  reexplain?: string; retry_question?: CheckpointQuestion;
  next_section?: Omit<LessonSectionOut, "checkpoint_question">; next_question?: CheckpointQuestion;
}
export interface AssessmentReport {
  score: number; strong_areas: string[]; weak_areas: string[]; misconceptions: string[];
  recommended_revision: string[]; recommended_next_topic: string; learning_path?: { name: string; status: string; mastery: number }[];
}
export interface Dashboard {
  profile: Profile;
  progress: { overall_mastery: number; concepts_mastered: number; weak_concepts: { concept: string; mastery: number }[] };
  recent_assessments: { score: number; weak_areas: string[]; recommended_next_topic: string; created_at: string }[];
  recent_lessons: { id: string; title: string; status: string; difficulty: string }[];
  continue_learning: { lesson_id: string; title: string } | null;
  recommended_next: string; streak_days: number;
}

export const api = {
  status: () =>
    get<{ app: string; demo_mode: boolean; llm_live: boolean; model: string | null; note: string }>("/api/system/status", { app: "AUTOPSY", demo_mode: true, llm_live: false, model: "Claude 3.5 Sonnet", note: "Demo Mode Active" }),
  
  onboard: (body: { email: string; name: string; level: string; language: string; teaching_style: string; goal: string; prior_knowledge: string }) => {
    const mockProfile: Profile = {
      user_id: `usr_${Date.now()}`,
      name: body.name || "Learner",
      email: body.email || "learner@example.com",
      level: body.level || "beginner",
      language: body.language || "English",
      teaching_style: body.teaching_style || "balanced",
      goal: body.goal || "Master my subject",
      prior_knowledge: body.prior_knowledge || "",
      streak_days: 1,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("autopsy_user_profile", JSON.stringify(mockProfile));
      } catch {}
    }
    return post<Profile>("/api/onboarding", body, mockProfile);
  },

  getProfile: (userId: string) => {
    let saved: Profile | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("autopsy_user_profile");
        if (raw) saved = JSON.parse(raw);
      } catch {}
    }
    const defaultProfile: Profile = saved || {
      user_id: userId,
      name: "Learner",
      email: "learner@example.com",
      level: "intermediate",
      language: "English",
      teaching_style: "balanced",
      goal: "Master Neural Networks & AI",
      prior_knowledge: "Basic Python and Linear Algebra",
      streak_days: 3,
    };
    return get<Profile>(`/api/profile/${userId}`, defaultProfile);
  },

  dashboard: (userId: string) => {
    let savedProfile: Profile | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("autopsy_user_profile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch {}
    }
    const profile = savedProfile || {
      user_id: userId,
      name: "Learner",
      email: "learner@example.com",
      level: "intermediate",
      language: "English",
      teaching_style: "balanced",
      goal: "Master Neural Networks & AI",
      prior_knowledge: "Basic algebra and Python",
      streak_days: 3,
    };

    const mockDashboard: Dashboard = {
      profile,
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
        { id: "les_1", title: "Introduction to Neural Networks", status: "completed", difficulty: "beginner" },
        { id: "les_2", title: "Backpropagation & Loss Functions", status: "teaching", difficulty: "intermediate" },
      ],
      continue_learning: { lesson_id: "les_2", title: "Backpropagation & Loss Functions" },
      recommended_next: "Master Gradient Descent Optimization",
      streak_days: profile.streak_days || 3,
    };

    return get<Dashboard>(`/api/dashboard/${userId}`, mockDashboard);
  },

  samples: () =>
    get<{ id: string; title: string; description: string }[]>("/api/documents/samples", [
      { id: "s1", title: "Neural Networks & Deep Learning", description: "Comprehensive guide to feedforward nets, backpropagation, and loss functions." },
      { id: "s2", title: "Quantum Computing Principles", description: "Introduction to qubits, superposition, entanglement, and quantum gates." },
    ]),

  listDocuments: (userId: string) => get<DocumentOut[]>(`/api/documents?user_id=${userId}`, []),

  upload: (userId: string, file: File) => {
    const mockDoc: DocumentOut = {
      id: `doc_${Date.now()}`,
      filename: file.name,
      title: file.name.replace(/\.[^/.]+$/, ""),
      file_type: file.type || "pdf",
      status: "ready",
      error: null,
      structure: { chapters: ["Chapter 1: Overview", "Chapter 2: Deep Dive"], chunk_count: 12 },
      created_at: new Date().toISOString(),
    };
    const form = new FormData();
    form.append("user_id", userId);
    form.append("file", file);
    return post<DocumentOut>("/api/documents/upload", form, mockDoc);
  },

  planLesson: (body: { user_id: string; topic?: string; document_id?: string; sample_topic_id?: string; duration_minutes: number }) => {
    const topicName = body.topic || "Neural Networks & Deep Learning";
    const mockPlan: LessonPlan = {
      lesson_id: `les_${Date.now()}`,
      topic: topicName,
      duration_minutes: body.duration_minutes || 15,
      difficulty: "intermediate",
      language: "English",
      grounded: true,
      objectives: [
        "Understand the architecture of artificial neural networks",
        "Master the forward pass and loss computation",
        "Implement gradient descent optimization",
      ],
      sections: [
        {
          id: "sec_1",
          order_index: 1,
          title: "What is a Neural Network?",
          concept: "Perceptron & Artificial Neurons",
          script: "Welcome! A neural network is inspired by biological neurons in the human brain. It takes weighted inputs, computes a sum, and applies an activation function.",
          examples: ["Image recognition: converting pixel values to category predictions.", "Spam detection: analyzing email word frequencies."],
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
      ],
      llm_live: false,
    };
    return post<LessonPlan>("/api/lessons/plan", body, mockPlan);
  },

  startTeaching: (lessonId: string) => {
    const mockData: StartTeachingOut = {
      lesson_id: lessonId,
      ui_state: "teaching",
      state: {
        current_concept: "Perceptron & Artificial Neurons",
        mastery: 0.6,
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
          type: "diagram" as const,
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
    };
    return post<StartTeachingOut>("/api/teaching/" + lessonId + "/start", {}, mockData);
  },

  currentTeaching: (lessonId: string) => {
    const mockData: CurrentTeachingOut = {
      lesson_id: lessonId,
      ui_state: "teaching",
      state: {
        current_concept: "Perceptron & Artificial Neurons",
        mastery: 0.6,
        difficulty: "intermediate",
        attempts: 1,
        misconceptions: [],
        next_action: "present_section",
      },
    };
    return get<CurrentTeachingOut>("/api/teaching/" + lessonId + "/current", mockData);
  },

  answer: (lessonId: string, body: { user_id: string; question_id: string; response_text: string }) => {
    const mockAns: AnswerResult = {
      correct: true,
      ui_state: "teaching",
      state: {
        current_concept: "Activation Functions",
        mastery: 0.85,
        difficulty: "intermediate",
        attempts: 1,
        misconceptions: [],
        next_action: "next_section",
      },
      evaluation: {
        correct: true,
        confidence: 0.95,
        reasoning: "Great job! Activation functions like ReLU and Sigmoid allow neural networks to model non-linear relationships.",
      },
      misconception: null,
    };
    return post<AnswerResult>(`/api/teaching/${lessonId}/answer`, body, mockAns);
  },

  generateAssessment: (lessonId: string, userId: string) =>
    post<{ assessment_id: string; lesson_id: string; questions: CheckpointQuestion[] }>(`/api/assessment/${lessonId}/generate?user_id=${userId}`, {}, {
      assessment_id: `ass_${Date.now()}`,
      lesson_id: lessonId,
      questions: [
        { id: "aq1", text: "Explain how backpropagation computes gradients using the chain rule.", type: "open_ended", options: [] },
        { id: "aq2", text: "Which activation function suffers from the vanishing gradient problem?", type: "multiple_choice", options: ["Sigmoid", "ReLU", "Leaky ReLU", "GELU"] },
      ],
    }),

  submitAssessment: (assessmentId: string, body: { user_id: string; responses: { question_id: string; response_text: string }[] }) =>
    post<AssessmentReport>(`/api/assessment/${assessmentId}/submit`, body, {
      score: 90,
      strong_areas: ["Neural Network Architecture", "Activation Functions"],
      weak_areas: ["Vanishing Gradients"],
      misconceptions: [],
      recommended_revision: ["Review Sigmoid derivative saturation"],
      recommended_next_topic: "Convolutional Neural Networks",
    }),

  getAssessmentResult: (assessmentId: string) =>
    get<AssessmentReport>(`/api/assessment/${assessmentId}/result`, {
      score: 90,
      strong_areas: ["Neural Network Architecture"],
      weak_areas: ["Vanishing Gradients"],
      misconceptions: [],
      recommended_revision: ["Review Sigmoid derivative saturation"],
      recommended_next_topic: "Convolutional Neural Networks",
    }),

  progress: (userId: string) =>
    get<{ concept_mastery: { concept: string; mastery: number; attempts: number }[]; misconceptions: { label: string; description: string; severity: string; resolved: boolean }[] }>(`/api/progress/${userId}`, {
      concept_mastery: [
        { concept: "Perceptrons", mastery: 0.9, attempts: 3 },
        { concept: "Activation Functions", mastery: 0.8, attempts: 2 },
        { concept: "Backpropagation", mastery: 0.4, attempts: 4 },
      ],
      misconceptions: [
        { label: "Linear Activation Myth", description: "Assuming linear activations work for deep networks", severity: "medium", resolved: true },
      ],
    }),

  translate: (text: string, targetLanguage: string) =>
    post<{ text: string; mode: string }>("/api/translate", { text, target_language: targetLanguage }, { text: `[${targetLanguage}]: ${text}`, mode: "translated" }),
};
