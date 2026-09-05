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

  if (error) return <div className="p-10 text-center text-rose-600 font-extrabold">{error}</div>;
  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-700 font-black min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-yellow-400 rounded-full animate-spin mb-4" />
        <span className="text-base">Building your diagnostic assessment…</span>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-300 pb-5">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-yellow-400 px-3 py-1 rounded-full">
            Diagnostic Verification
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">Final Knowledge Assessment</h1>
          <p className="text-xs font-bold text-slate-600 mt-1">Diagnostic check to verify long-term concept retention</p>
        </div>
        <span className="bg-[#09090b] text-white text-xs font-black px-4 py-2 rounded-full border border-slate-800 shadow-sm">
          <span className="text-yellow-400">{answeredCount}</span> / {questions.length} Answered
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-[2rem] border border-slate-300/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Question {i + 1}
              </span>
              <span className="text-xs font-black text-slate-500 capitalize bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{q.type}</span>
            </div>

            <p className="text-base font-extrabold text-slate-900 leading-relaxed">{q.text}</p>

            {q.type === "mcq" ? (
              <div className="grid gap-3 pt-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={`text-left px-5 py-3.5 rounded-2xl border text-xs font-black transition-all ${
                      answers[q.id] === opt
                        ? "bg-[#09090b] border-slate-900 text-white shadow-md ring-2 ring-yellow-400"
                        : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400 hover:bg-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="input text-xs font-semibold"
                rows={3}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Type your explanation answer here…"
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || answeredCount === 0}
        className="w-full btn-black-pill py-4 text-center text-sm font-black shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>{submitting ? "Grading your responses…" : "Submit Assessment"}</span>
        <span className="text-yellow-400">→</span>
      </button>
    </div>
  );
}

export default function AssessmentPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-500 font-bold">Loading assessment studio…</div>}><AssessmentInner /></Suspense>;
}

