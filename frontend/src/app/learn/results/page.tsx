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

  if (error) return <div className="p-10 text-center text-rose-600 font-extrabold">{error}</div>;
  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-700 font-black min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-yellow-400 rounded-full animate-spin mb-4" />
        <span className="text-base">Preparing your diagnostic report…</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 space-y-8">
      
      {/* Score Header Card */}
      <div className="bg-[#09090b] text-white rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl text-center space-y-3 relative overflow-hidden">
        <div className="text-6xl sm:text-7xl font-black text-yellow-400 tracking-tight">{report.score}%</div>
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">Diagnostic Assessment Mastery Score</div>
      </div>

      {/* Strong & Weak Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ReportCard title="Mastered Concepts" items={report.strong_areas} tone="emerald" empty="Keep going — no concepts fully locked in yet." />
        <ReportCard title="Needs Revision" items={report.weak_areas} tone="rose" empty="No weak spots detected 🎉" />
      </div>

      {/* Misconceptions Log */}
      {report.misconceptions.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-300/80 p-6 shadow-sm space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">Misconceptions Flagged</h2>
          <div className="flex flex-wrap gap-2">
            {report.misconceptions.map((m) => (
              <span key={m} className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                ⚠️ {m.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Topic */}
      <div className="bg-white rounded-[2rem] border border-slate-300/80 p-6 shadow-sm space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">Recommended Next Step</h2>
        <p className="text-base font-extrabold text-slate-900">{report.recommended_next_topic}</p>
        {report.recommended_revision.length > 0 && (
          <p className="text-xs text-slate-600 font-semibold">Topics to revisit: {report.recommended_revision.join(", ")}</p>
        )}
      </div>

      <Link href="/dashboard" className="block text-center btn-black-pill py-4 text-sm font-black shadow-xl">
        <span>Back to Dashboard</span>
        <span className="text-yellow-400 ml-2">→</span>
      </Link>
    </div>
  );
}

function ReportCard({ title, items, tone, empty }: { title: string; items: string[]; tone: "emerald" | "rose"; empty: string }) {
  const badgeStyle = tone === "emerald" ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-rose-50 text-rose-900 border-rose-300";
  return (
    <div className="bg-white rounded-[2rem] border border-slate-300/80 p-6 shadow-sm space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500 font-semibold italic">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((c) => (
            <span key={c} className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border ${badgeStyle}`}>
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-10 text-center text-slate-500 font-bold">Loading report studio…</div>}><ResultsInner /></Suspense>;
}

