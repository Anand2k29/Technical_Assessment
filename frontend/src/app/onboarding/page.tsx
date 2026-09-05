"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { setUserId } from "@/lib/session";

const LEVELS = ["beginner", "intermediate", "advanced"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];
const STYLES = [
  { id: "balanced", label: "Balanced" },
  { id: "simple", label: "Simple & Slow" },
  { id: "analogy", label: "Analogy-Heavy" },
  { id: "example-heavy", label: "Example-Heavy" },
  { id: "socratic", label: "Socratic (Questions Often)" },
];

export default function Onboarding() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", level: "beginner", language: "English",
    teaching_style: "balanced", goal: "", prior_knowledge: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await api.onboard(form);
      setUserId(profile.user_id);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't set up your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 w-full bg-dashboard-canvas">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] border border-purple-100 shadow-2xl p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xl mx-auto shadow-md">
            A.
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set up your AI Teacher</h1>
          <p className="text-xs text-slate-500 font-bold">Tell AUTOPSY how you learn best — change anytime in Settings.</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Your Name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jyotasana" />
            </Field>
            <Field label="Email Address">
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </Field>
          </div>

          <Field label="Current Knowledge Level">
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <Chip key={l} active={form.level === l} onClick={() => setForm({ ...form, level: l })}>{l}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Preferred Language">
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <Chip key={l} active={form.language === l} onClick={() => setForm({ ...form, language: l })}>{l}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Teaching Style Preference">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Chip key={s.id} active={form.teaching_style === s.id} onClick={() => setForm({ ...form, teaching_style: s.id })}>{s.label}</Chip>
              ))}
            </div>
          </Field>

          <Field label="What is your learning goal?">
            <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Master Neural Networks before my exam" />
          </Field>

          <Field label="Prior Knowledge (Optional)">
            <input className="input" value={form.prior_knowledge} onChange={(e) => setForm({ ...form, prior_knowledge: e.target.value })} placeholder="e.g. Basic linear algebra and Python" />
          </Field>
        </div>

        {error && <p className="text-xs font-bold text-rose-600 text-center">{error}</p>}

        <button
          onClick={submit}
          disabled={loading || !form.name || !form.email}
          className="w-full btn-black-pill py-3.5 text-center text-sm font-extrabold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up your workspace…" : "Continue to Dashboard →"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-black border capitalize transition-all ${
        active
          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
