"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, DocumentOut } from "@/lib/api";
import { getUserId } from "@/lib/session";

type Source = { kind: "sample"; id: string; title: string } | { kind: "document"; id: string; title: string } | { kind: "topic"; title: string } | null;

const DURATIONS = [
  { minutes: 5, label: "5 min · essentials only" },
  { minutes: 20, label: "20 min · concepts + practice" },
  { minutes: 60, label: "60 min · deep dive" },
];

export default function NewLesson() {
  const router = useRouter();
  const userId = typeof window !== "undefined" ? getUserId() : null;

  const [samples, setSamples] = useState<{ id: string; title: string; description: string }[]>([]);
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [source, setSource] = useState<Source>(null);
  const [topicText, setTopicText] = useState("");
  const [duration, setDuration] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { router.push("/onboarding"); return; }
    api.samples().then(setSamples).catch(() => {});
    api.listDocuments(userId).then(setDocuments).catch(() => {});
  }, [userId, router]);

  const onUpload = async (file: File) => {
    if (!userId) return;
    setUploading(true);
    setError(null);
    try {
      const doc = await api.upload(userId, file);
      setDocuments((prev) => [doc, ...prev]);
      if (doc.status === "ready") setSource({ kind: "document", id: doc.id, title: doc.title });
      else setError(doc.error || "Upload received but couldn't be processed. Try a different file.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const startPlanning = async () => {
    if (!userId || !source) return;
    setPlanning(true);
    setError(null);
    try {
      const body =
        source.kind === "sample" ? { user_id: userId, sample_topic_id: source.id, duration_minutes: duration } :
        source.kind === "document" ? { user_id: userId, document_id: source.id, duration_minutes: duration } :
        { user_id: userId, topic: source.title, duration_minutes: duration };
      const plan = await api.planLesson(body);
      sessionStorage.setItem(`plan_${plan.lesson_id}`, JSON.stringify(plan));
      router.push(`/learn/preview?lessonId=${plan.lesson_id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't plan this lesson. Please try again.");
      setPlanning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">What should AUTOPSY teach you?</h1>
      <p className="text-sm text-slate-500 mb-8">Upload material, pick a sample lesson, or just tell it a topic.</p>

      <div className="grid gap-4 mb-8">
        <Section title="Try a sample lesson">
          <div className="flex gap-3 flex-wrap">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => setSource({ kind: "sample", id: s.id, title: s.title })}
                className={`px-4 py-3 rounded-xl border text-left ${source?.kind === "sample" && source.id === s.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}
              >
                <div className="font-semibold text-sm text-slate-900">{s.title}</div>
                <div className="text-xs text-slate-500">{s.description}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Upload learning material">
          <label className="block border-2 border-dashed border-slate-300 rounded-xl px-6 py-8 text-center cursor-pointer hover:border-indigo-400">
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            <span className="text-sm text-slate-500">{uploading ? "Uploading & processing…" : "PDF, DOC, DOCX, PPT, PPTX or TXT — click to choose a file"}</span>
          </label>
          {documents.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {documents.map((d) => (
                <button
                  key={d.id}
                  disabled={d.status !== "ready"}
                  onClick={() => setSource({ kind: "document", id: d.id, title: d.title })}
                  className={`px-3 py-1.5 rounded-full text-xs border ${source?.kind === "document" && source.id === d.id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white"} ${d.status !== "ready" ? "opacity-50" : "hover:border-indigo-300"}`}
                >
                  {d.title} {d.status !== "ready" && `(${d.status})`}
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section title="Or just type a topic">
          <input
            className="input"
            value={topicText}
            onChange={(e) => { setTopicText(e.target.value); setSource(e.target.value ? { kind: "topic", title: e.target.value } : null); }}
            placeholder="e.g. Photosynthesis, Recursion in programming, The French Revolution"
          />
        </Section>

        <Section title="How much time do you have?">
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setDuration(d.minutes)}
                className={`px-3 py-2 rounded-xl border text-sm ${duration === d.minutes ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={startPlanning}
        disabled={!source || planning}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
      >
        {planning ? "AUTOPSY is analyzing & planning your lesson…" : "Teach Me"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}
