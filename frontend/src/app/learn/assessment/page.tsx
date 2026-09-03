"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, CheckpointQuestion } from "@/lib/api";
import { getUserId } from "@/lib/session";

function AssessmentInner() {
  const router = useRouter();
  const lessonId = useSearchParams().get("lessonId");
  const userId = getUserId();

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<CheckpointQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId || !userId) return;
    api.generateAssessment(lessonId, userId)
      .then((res) => { setAssessmentId(res.assessment_id); setQuestions(res.questions); })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't generate the assessment."));
  }, [lessonId, userId]);

  const submit = async () => {
    if (!assessmentId || !userId) return;
    setSubmitting(true);
    try {
      const responses = questions.map((q) => ({ question_id: q.id, response_text: answers[q.id] || "" }));
      await api.submitAssessment(assessmentId, { user_id: userId, responses });
      router.push(`/learn/results?assessmentId=${assessmentId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't submit your assessment.");
      setSubmitting(false);
    }
  };

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (questions.length === 0) return <div className="p-10 text-center text-slate-400">Building your assessment…</div>;

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Final Assessment</h1>
      <p className="text-sm text-slate-500 mb-8">{answeredCount}/{questions.length} answered</p>

      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs font-semibold text-indigo-500 mb-2">Q{i + 1}</div>
            <p className="text-sm font-medium text-slate-900 mb-3">{q.text}</p>
            {q.type === "mcq" ? (
              <div className="grid gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={`text-left px-3 py-2 rounded-lg border text-sm ${answers[q.id] === opt ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 hover:border-indigo-300"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="input"
                rows={3}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Type your answer…"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={submitting || answeredCount === 0}
        className="w-full mt-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
      >
        {submitting ? "Grading…" : "Submit Assessment"}
      </button>
    </div>
  );
}

export default function AssessmentPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}><AssessmentInner /></Suspense>;
}
