"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Dashboard } from "@/lib/api";
import { getUserId } from "@/lib/session";
import MasteryBar from "@/components/MasteryBar";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      router.push("/onboarding");
      return;
    }
    api.dashboard(userId).then(setData).catch((e) => setError(e.message));
  }, [router]);

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-10 text-center text-slate-400">Loading your dashboard…</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {data.profile.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">Level: {data.profile.level} · Language: {data.profile.language}</p>
        </div>
        <div className="flex gap-3">
          <StreakBadge days={data.streak_days} />
          <Link href="/learn/new" className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
            + Start Learning
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {data.continue_learning && (
            <Card title="Continue Learning">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{data.continue_learning.title}</span>
                <Link href={`/learn/teach?lessonId=${data.continue_learning.lesson_id}`} className="text-sm font-semibold text-indigo-600 hover:underline">
                  Resume →
                </Link>
              </div>
            </Card>
          )}

          <Card title="Learning Progress">
            <div className="flex items-center gap-6 mb-4">
              <RingStat value={data.progress.overall_mastery} label="Overall mastery" />
              <div className="text-sm text-slate-600">
                <div><span className="font-semibold text-slate-900">{data.progress.concepts_mastered}</span> concepts mastered</div>
                <div><span className="font-semibold text-slate-900">{data.progress.weak_concepts.length}</span> concepts need review</div>
              </div>
            </div>
            {data.progress.weak_concepts.length > 0 && (
              <div className="space-y-2">
                {data.progress.weak_concepts.map((c) => <MasteryBar key={c.concept} label={c.concept} mastery={c.mastery} />)}
              </div>
            )}
          </Card>

          <Card title="Recent Lessons">
            {data.recent_lessons.length === 0 ? (
              <EmptyState text="No lessons yet — start your first one." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recent_lessons.map((l) => (
                  <li key={l.id} className="py-2.5 flex items-center justify-between">
                    <span className="text-sm text-slate-700">{l.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(l.status)}`}>{l.status.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Recommended Next">
            <p className="text-sm text-slate-700">{data.recommended_next}</p>
            <Link href="/learn/new" className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:underline">Start this →</Link>
          </Card>

          <Card title="Recent Assessments">
            {data.recent_assessments.length === 0 ? (
              <EmptyState text="Complete a lesson to see your first report." />
            ) : (
              <ul className="space-y-2">
                {data.recent_assessments.map((a, i) => (
                  <li key={i} className="text-sm flex justify-between">
                    <span className="text-slate-600">{new Date(a.created_at).toLocaleDateString()}</span>
                    <span className="font-semibold text-slate-900">{a.score}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Upload Material">
            <p className="text-sm text-slate-500 mb-3">Give AUTOPSY your notes, a chapter, or slides — it will teach directly from them.</p>
            <Link href="/learn/new" className="block text-center py-2 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600">
              Upload a document
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-slate-400 italic">{text}</p>;
}

function StreakBadge({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold">
      🔥 {days} day{days === 1 ? "" : "s"}
    </div>
  );
}

function RingStat({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const circumference = 2 * Math.PI * 34;
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="40" cy="40" r="34" fill="none" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value)}
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1e293b">{pct}%</text>
      </svg>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );
}

function statusColor(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "teaching") return "bg-indigo-50 text-indigo-700";
  if (status === "ready_for_assessment") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}
