"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getUserId } from "@/lib/session";
import MasteryBar from "@/components/MasteryBar";

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.progress>> | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { router.push("/onboarding"); return; }
    api.progress(userId).then(setData).catch(() => {});
  }, [router]);

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 font-extrabold min-h-screen">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-purple-600 rounded-full animate-spin mb-4" />
        <span>Loading your progress report…</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Learning Progress & Mastery</h1>
        <p className="text-xs font-bold text-slate-500 mt-1">Real-time dynamic concept tracking & misconception diagnosis history</p>
      </div>

      {/* Concept Mastery Card */}
      <div className="bg-white rounded-[2.5rem] border border-purple-100/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xs uppercase font-black tracking-wider text-slate-400">Concept Mastery State</h2>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-3 py-1 rounded-full">
            {data.concept_mastery.length} Concepts Tracked
          </span>
        </div>

        {data.concept_mastery.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-2xl">
            No concepts tracked yet — complete a lesson session to build your knowledge state.
          </p>
        ) : (
          <div className="space-y-4">
            {data.concept_mastery.map((c) => (
              <MasteryBar key={c.concept} label={c.concept} mastery={c.mastery} />
            ))}
          </div>
        )}
      </div>

      {/* Misconception Diagnostic History Card */}
      <div className="bg-white rounded-[2.5rem] border border-purple-100/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xs uppercase font-black tracking-wider text-slate-400">Misconception History & Traps</h2>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full">
            {data.misconceptions.length} Flagged
          </span>
        </div>

        {data.misconceptions.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-2xl">
            No misconceptions flagged yet 🎉 Great understanding!
          </p>
        ) : (
          <div className="space-y-3">
            {data.misconceptions.map((m, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm capitalize">{m.label.replace(/_/g, " ")}</span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{m.description}</p>
                </div>
                <span className={`shrink-0 text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                  m.severity === "high"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : m.severity === "medium"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-200 text-slate-700"
                }`}>
                  {m.severity} severity
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
