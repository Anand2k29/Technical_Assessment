"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError, AssessmentReport } from "@/lib/api";

function ResultsInner() {
  const assessmentId = useSearchParams().get("assessmentId");
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) return;
    api.getAssessmentResult(assessmentId)
      .then(setReport)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load your report."));
  }, [assessmentId]);

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!report) return <div className="p-10 text-center text-slate-400">Preparing your learning report…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="text-center mb-8">
        <div className="text-5xl font-bold text-indigo-600 mb-1">{report.score}%</div>
        <p className="text-sm text-slate-500">Your assessment score</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ReportCard title="Strong Areas" items={report.strong_areas} tone="emerald" empty="Keep going — none locked in yet." />
        <ReportCard title="Weak Areas" items={report.weak_areas} tone="rose" empty="No weak spots detected 🎉" />
      </div>

      {report.misconceptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Misconceptions Detected This Session</h2>
          <div className="flex flex-wrap gap-2">
            {report.misconceptions.map((m) => (
              <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{m.replace(/_/g, " ")}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommended Next</h2>
        <p className="text-sm text-slate-800 font-medium">{report.recommended_next_topic}</p>
        {report.recommended_revision.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">Revisit: {report.recommended_revision.join(", ")}</p>
        )}
      </div>

      {report.learning_path && report.learning_path.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Learning Path</h2>
          <ol className="space-y-2">
            {report.learning_path.map((step, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{step.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${step.status === "mastered" ? "bg-emerald-50 text-emerald-700" : step.status === "in_progress" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                  {step.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Link href="/dashboard" className="block text-center w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
        Back to Dashboard
      </Link>
    </div>
  );
}

function ReportCard({ title, items, tone, empty }: { title: string; items: string[]; tone: "emerald" | "rose"; empty: string }) {
  const color = tone === "emerald" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((c) => <span key={c} className={`text-xs px-2 py-1 rounded-full border ${color}`}>{c}</span>)}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}><ResultsInner /></Suspense>;
}
