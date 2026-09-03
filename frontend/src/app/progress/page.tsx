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

  if (!data) return <div className="p-10 text-center text-slate-400">Loading your progress…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 w-full space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Your Learning Progress</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Concept Mastery</h2>
        {data.concept_mastery.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No concepts tracked yet — start a lesson to build your knowledge state.</p>
        ) : (
          <div className="space-y-3">
            {data.concept_mastery.map((c) => <MasteryBar key={c.concept} label={c.concept} mastery={c.mastery} />)}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Misconception History</h2>
        {data.misconceptions.length === 0 ? (
          <p className="text-sm text-slate-400 italic">None detected yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.misconceptions.map((m, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <span className="font-medium text-slate-800 capitalize">{m.label.replace(/_/g, " ")}</span>
                  <p className="text-xs text-slate-500">{m.description}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${m.severity === "high" ? "bg-rose-50 text-rose-700" : m.severity === "medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                  {m.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
