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

  if (error) return <div className="p-10 text-center text-rose-600 font-extrabold">{error}</div>;

  if (uiState === "COMPLETED") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-[70vh]">
        <div className="w-16 h-16 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center text-3xl font-black mb-4 shadow-lg">
          🎓
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Lesson Completed!</h1>
        <p className="text-sm font-semibold text-slate-600 mb-8 max-w-sm">Let&apos;s check what stuck with a short diagnostic assessment and get your mastery report.</p>
        <button
          onClick={() => router.push(`/learn/assessment?lessonId=${lessonId}`)}
          className="btn-black-pill text-sm px-8 py-3.5 shadow-xl flex items-center gap-2"
        >
          <span>Start Assessment</span>
          <span className="text-yellow-400">→</span>
        </button>
      </div>
    );
  }

  if (!section || !state) return <div className="p-12 text-center text-slate-600 font-extrabold text-base">Your AI teacher is preparing the studio room…</div>;

  return (
    <div className="w-full px-6 lg:px-12 py-6 flex-1 flex flex-col min-h-[calc(100vh-6rem)] space-y-4">
      <TeachingStateBar state={state} title={section.title || ""} />

      {banner && (
        <div className={`px-5 py-3 rounded-2xl text-xs font-black border shadow-sm ${
          banner.kind === "correct"
            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
            : "bg-amber-50 text-amber-900 border-amber-300"
        }`}>
          {banner.kind === "correct" ? "✓ " : "⚠️ "}{banner.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[460px]">
        <AvatarPlayer text={narration} language={language} uiState={uiState === "RE_EXPLAINING" ? "RE_EXPLAINING" : "TEACHING"} />
        {section.visual_spec && <VisualPanel visual={section.visual_spec} concept={section.title} />}
      </div>

      {section.source_refs && section.source_refs.length > 0 && section.source_refs[0].document && (
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-300/80 w-fit text-xs font-extrabold text-slate-600 shadow-sm">
          <span className="text-slate-900">📄 Grounded Source:</span>
          <span>{section.source_refs[0].document}{section.source_refs[0].chapter ? `, ${section.source_refs[0].chapter}` : ""}</span>
        </div>
      )}

      {question && (
        <div className="mt-4 max-w-2xl">
          <QuestionCard question={question} language={language} onSubmit={submitAnswer} submitting={submitting} />
        </div>
      )}
    </div>
  );
}

function TeachingStateBar({ state, title }: { state: TeachingState; title: string }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-[2rem] border border-slate-300/80 px-6 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-yellow-400 px-3 py-1 rounded-full">
          Now Teaching
        </span>
        <div className="font-extrabold text-slate-900 text-base">{title}</div>
      </div>
      <div className="w-52">
        <MasteryBar label={state.difficulty.replace("_", " ")} mastery={state.mastery} />
      </div>
    </div>
  );
}

export default function TeachPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-500 font-bold">Loading teaching studio…</div>}><TeachInner /></Suspense>;
}

