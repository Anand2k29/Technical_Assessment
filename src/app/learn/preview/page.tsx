"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, LessonPlan } from "@/lib/api";

function loadCachedPlan(lessonId: string | null): LessonPlan | null {
  if (typeof window === "undefined" || !lessonId) return null;
  const cached = sessionStorage.getItem(`plan_${lessonId}`);
  return cached ? JSON.parse(cached) : null;
}

function PreviewInner() {
  const router = useRouter();
  const lessonId = useSearchParams().get("lessonId");
  // The lesson plan was just created by /learn/new; we already have it client-side
  // via sessionStorage to avoid a redundant fetch. This component only ever mounts
  // client-side (inside a Suspense boundary below useSearchParams), so reading it
  // in a lazy initializer is safe -- no SSR/hydration mismatch to worry about.
  const [plan] = useState<LessonPlan | null>(() => loadCachedPlan(lessonId));
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  if (!plan) {
    return (
      <div className="p-10 text-center text-slate-500">
        This lesson plan preview isn&apos;t available in this session.{" "}
        <a href="/learn/new" className="text-indigo-600 font-semibold hover:underline">Create a new lesson →</a>
      </div>
    );
  }

  const start = async () => {
    if (!lessonId) return;
    setStarting(true);
    try {
      await api.startTeaching(lessonId);
      router.push(`/learn/teach?lessonId=${lessonId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't start the lesson.");
      setStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 w-full">
      <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 mb-3">
        AI LESSON PLANNER {plan.grounded && "· GROUNDED IN YOUR MATERIAL"}
      </span>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">{plan.topic}</h1>
      <p className="text-sm text-slate-500 mb-6">
        {plan.duration_minutes} minutes · {plan.difficulty} · taught in {plan.language} {!plan.llm_live && "· Demo Mode reasoning"}
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Objectives</h2>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {plan.objectives.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Lesson Sections ({plan.sections.length})</h2>
        <ol className="space-y-3">
          {plan.sections.map((s, i) => (
            <li key={s.id} className="flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <div>
                <div className="text-sm font-medium text-slate-900">{s.title}</div>
                <div className="text-xs text-slate-500">{s.visual_spec.type.replace("_", " ")} visual · checkpoint question included</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <button onClick={start} disabled={starting} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40">
        {starting ? "Starting…" : "Start Teaching"}
      </button>
    </div>
  );
}

export default function PreviewPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}><PreviewInner /></Suspense>;
}
