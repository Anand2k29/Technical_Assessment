"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, DocumentOut } from "@/lib/api";
import { getUserId } from "@/lib/session";

type Source = { kind: "sample"; id: string; title: string } | { kind: "document"; id: string; title: string } | { kind: "topic"; title: string } | null;

const DURATIONS = [
  { minutes: 5, label: "5 min • Quick Essentials" },
  { minutes: 20, label: "20 min • Concepts + Practice" },
  { minutes: 60, label: "60 min • Comprehensive Deep Dive" },
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
    <div className="w-full max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-yellow-400 px-3 py-1 rounded-full">
          Lesson Creator Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">What should AUTOPSY teach you?</h1>
        <p className="text-xs font-bold text-slate-600 mt-1">Pick a sample lesson, upload custom study material, or type any subject</p>
      </div>

      <div className="space-y-6">
        
        {/* Sample Lessons */}
        <Section title="1. Select a Sample Subject">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => setSource({ kind: "sample", id: s.id, title: s.title })}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  source?.kind === "sample" && source.id === s.id
                    ? "bg-[#09090b] text-white border-slate-900 shadow-md ring-2 ring-yellow-400"
                    : "bg-white text-slate-900 border-slate-300 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm">{s.title}</span>
                  {source?.kind === "sample" && source.id === s.id && (
                    <span className="text-yellow-400 text-xs font-black">✓ Selected</span>
                  )}
                </div>
                <div className={`text-xs font-medium leading-relaxed ${source?.kind === "sample" && source.id === s.id ? "text-slate-300" : "text-slate-500"}`}>
                  {s.description}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Upload Custom Material */}
        <Section title="2. Upload Custom Learning Material">
          <label className="block border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-[2rem] p-8 text-center cursor-pointer transition-all bg-white hover:bg-slate-50 shadow-sm">
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-sm">
              📁
            </div>
            <span className="text-sm font-black text-slate-900 block">
              {uploading ? "Processing & Indexing Vector Chunks…" : "Click or Drag PDF, DOCX, PPTX, or TXT Files Here"}
            </span>
            <span className="text-xs text-slate-500 font-bold block mt-1">Grounded RAG extracts knowledge directly from your syllabus</span>
          </label>

          {documents.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-3">
              {documents.map((d) => (
                <button
                  key={d.id}
                  disabled={d.status !== "ready"}
                  onClick={() => setSource({ kind: "document", id: d.id, title: d.title })}
                  className={`px-4 py-2.5 rounded-full text-xs font-black border transition-all ${
                    source?.kind === "document" && source.id === d.id
                      ? "bg-[#09090b] border-slate-900 text-white shadow-sm ring-2 ring-yellow-400"
                      : "bg-white border-slate-300 text-slate-800 hover:border-slate-400"
                  } ${d.status !== "ready" ? "opacity-50" : ""}`}
                >
                  📄 {d.title} {d.status !== "ready" && `(${d.status})`}
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* Custom Topic Input */}
        <Section title="3. Or Type a Custom Subject">
          <input
            className="input font-semibold"
            value={topicText}
            onChange={(e) => { setTopicText(e.target.value); setSource(e.target.value ? { kind: "topic", title: e.target.value } : null); }}
            placeholder="e.g. Backpropagation in Neural Networks, Photosynthesis, Quantum Superposition"
          />
        </Section>

        {/* Duration Selector */}
        <Section title="4. Session Duration">
          <div className="flex flex-wrap gap-2.5">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setDuration(d.minutes)}
                className={`px-5 py-3 rounded-full text-xs font-black border transition-all ${
                  duration === d.minutes
                    ? "bg-[#09090b] border-slate-900 text-white shadow-sm ring-2 ring-yellow-400"
                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Section>

      </div>

      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

      <button
        onClick={startPlanning}
        disabled={!source || planning}
        className="w-full btn-black-pill py-4 text-center text-sm font-black shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>{planning ? "AUTOPSY is analyzing & planning your lesson…" : "Teach Me This Subject"}</span>
        <span className="text-yellow-400">→</span>
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-300/80 p-6 shadow-sm space-y-3">
      <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">{title}</h2>
      {children}
    </div>
  );
}

