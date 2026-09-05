const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: options.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(0, "Can't reach the AUTOPSY server. Is the backend running on :8000?");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Something went wrong.");
  }
  return res.json();
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) });
const get = <T>(path: string) => request<T>(path);

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
  status: () => get<{ app: string; demo_mode: boolean; llm_live: boolean; model: string | null; note: string }>("/api/system/status"),
  onboard: (body: { email: string; name: string; level: string; language: string; teaching_style: string; goal: string; prior_knowledge: string }) =>
    post<Profile>("/api/onboarding", body),
  getProfile: (userId: string) => get<Profile>(`/api/profile/${userId}`),
  dashboard: (userId: string) => get<Dashboard>(`/api/dashboard/${userId}`),
  samples: () => get<{ id: string; title: string; description: string }[]>("/api/documents/samples"),
  listDocuments: (userId: string) => get<DocumentOut[]>(`/api/documents?user_id=${userId}`),
  upload: (userId: string, file: File) => {
    const form = new FormData();
    form.append("user_id", userId);
    form.append("file", file);
    return post<DocumentOut>("/api/documents/upload", form);
  },
  planLesson: (body: { user_id: string; topic?: string; document_id?: string; sample_topic_id?: string; duration_minutes: number }) =>
    post<LessonPlan>("/api/lessons/plan", body),
  startTeaching: (lessonId: string) => post<{ lesson_id: string; ui_state: string; state: TeachingState; section: LessonSectionOut; question: CheckpointQuestion | null }>(`/api/teaching/${lessonId}/start`),
  currentTeaching: (lessonId: string) => get<{ lesson_id: string; ui_state: string; state: TeachingState; section?: LessonSectionOut; question?: CheckpointQuestion | null }>(`/api/teaching/${lessonId}/current`),
  answer: (lessonId: string, body: { user_id: string; question_id: string; response_text: string }) =>
    post<AnswerResult>(`/api/teaching/${lessonId}/answer`, body),
  generateAssessment: (lessonId: string, userId: string) =>
    post<{ assessment_id: string; lesson_id: string; questions: CheckpointQuestion[] }>(`/api/assessment/${lessonId}/generate?user_id=${userId}`),
  submitAssessment: (assessmentId: string, body: { user_id: string; responses: { question_id: string; response_text: string }[] }) =>
    post<AssessmentReport>(`/api/assessment/${assessmentId}/submit`, body),
  getAssessmentResult: (assessmentId: string) => get<AssessmentReport>(`/api/assessment/${assessmentId}/result`),
  progress: (userId: string) => get<{ concept_mastery: { concept: string; mastery: number; attempts: number }[]; misconceptions: { label: string; description: string; severity: string; resolved: boolean }[] }>(`/api/progress/${userId}`),
  translate: (text: string, targetLanguage: string) => post<{ text: string; mode: string }>("/api/translate", { text, target_language: targetLanguage }),
};
