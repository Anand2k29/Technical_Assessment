"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, CheckpointQuestion, LessonSectionOut, TeachingState } from "@/lib/api";
import { getUserId } from "@/lib/session";
import AvatarPlayer from "@/components/AvatarPlayer";
import VisualPanel from "@/components/VisualPanel";
import QuestionCard from "@/components/QuestionCard";
import MasteryBar from "@/components/MasteryBar";

type UiState = "TEACHING" | "RE_EXPLAINING" | "COMPLETED";

function TeachInner() {
  const router = useRouter();
  const lessonId = useSearchParams().get("lessonId");
  const userId = getUserId();

  const [uiState, setUiState] = useState<UiState>("TEACHING");
  const [section, setSection] = useState<Partial<LessonSectionOut> | null>(null);
  const [question, setQuestion] = useState<CheckpointQuestion | null>(null);
  const [state, setState] = useState<TeachingState | null>(null);
  const [narration, setNarration] = useState("");
  const [banner, setBanner] = useState<{ kind: "correct" | "misconception"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    if (!userId) return;
    api.getProfile(userId).then((p) => setLanguage(p.language)).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!lessonId || !userId) return;
    api.currentTeaching(lessonId).then((res) => {
      if (res.ui_state === "COMPLETED" || !res.section) {
        router.push(`/learn/assessment?lessonId=${lessonId}`);
        return;
      }
      setSection(res.section);
      setQuestion(res.question ?? null);
      setState(res.state);
      setNarration(res.section.script);
    }).catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load this lesson."));
  }, [lessonId, userId, router]);

  const submitAnswer = async (responseText: string) => {
    if (!lessonId || !userId || !question) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const result = await api.answer(lessonId, { user_id: userId, question_id: question.id, response_text: responseText });
      setState(result.state);

      if (!result.correct) {
        setUiState("RE_EXPLAINING");
        setBanner({ kind: "misconception", text: result.misconception ? `Detected: ${result.misconception.misconception.replace(/_/g, " ")}` : "Let's try that again." });
        setNarration(result.reexplain || "Let's look at this again.");
        setQuestion(result.retry_question || question);
      } else if (result.ui_state === "COMPLETED") {
        setUiState("COMPLETED");
      } else {
        setUiState("TEACHING");
        setBanner({ kind: "correct", text: "Correct — nice work." });
        if (result.next_section) {
          setSection(result.next_section);
          setNarration(result.next_section.script);
        }
        setQuestion(result.next_question || null);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't submit your answer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  if (uiState === "COMPLETED") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Lesson complete</h1>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">Let&apos;s check what stuck with a short assessment, and get your personalized report.</p>
        <button
          onClick={() => router.push(`/learn/assessment?lessonId=${lessonId}`)}
          className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          Start Assessment
        </button>
      </div>
    );
  }

  if (!section || !state) return <div className="p-10 text-center text-slate-400">Your AI teacher is preparing the room…</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 w-full flex-1 flex flex-col">
      <TeachingStateBar state={state} title={section.title || ""} />

      {banner && (
        <div className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${banner.kind === "correct" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {banner.kind === "correct" ? "✓ " : "⚠ "}{banner.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[420px]">
        <AvatarPlayer text={narration} language={language} uiState={uiState === "RE_EXPLAINING" ? "RE_EXPLAINING" : "TEACHING"} />
        {section.visual_spec && <VisualPanel visual={section.visual_spec} />}
      </div>

      {section.source_refs && section.source_refs.length > 0 && section.source_refs[0].document && (
        <p className="text-xs text-slate-400 mt-3">
          Based on your material — {section.source_refs[0].document}{section.source_refs[0].chapter ? `, ${section.source_refs[0].chapter}` : ""}
        </p>
      )}

      {question && (
        <div className="mt-6 max-w-2xl">
          <QuestionCard question={question} language={language} onSubmit={submitAnswer} submitting={submitting} />
        </div>
      )}
    </div>
  );
}

function TeachingStateBar({ state, title }: { state: TeachingState; title: string }) {
  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-2xl border border-slate-200 px-5 py-3">
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide">Now teaching</div>
        <div className="font-semibold text-slate-900">{title}</div>
      </div>
      <div className="w-48"><MasteryBar label={state.difficulty.replace("_", " ")} mastery={state.mastery} /></div>
    </div>
  );
}

export default function TeachPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}><TeachInner /></Suspense>;
}
