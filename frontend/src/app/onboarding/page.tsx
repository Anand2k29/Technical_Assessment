"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { setUserId } from "@/lib/session";

const LEVELS = ["beginner", "intermediate", "advanced"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];
const STYLES = [
  { id: "balanced", label: "Balanced" },
  { id: "simple", label: "Simple & slow" },
  { id: "analogy", label: "Analogy-heavy" },
  { id: "example-heavy", label: "Example-heavy" },
  { id: "socratic", label: "Ask me questions often" },
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
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Let&apos;s set up your AI teacher</h1>
        <p className="text-sm text-slate-500 mb-6">Tell AUTOPSY a bit about how you learn — you can change this anytime in Settings.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Your name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jyotasana" />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </Field>
          </div>

          <Field label="Current level">
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <Chip key={l} active={form.level === l} onClick={() => setForm({ ...form, level: l })}>{l}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Preferred language">
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <Chip key={l} active={form.language === l} onClick={() => setForm({ ...form, language: l })}>{l}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Teaching style">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Chip key={s.id} active={form.teaching_style === s.id} onClick={() => setForm({ ...form, teaching_style: s.id })}>{s.label}</Chip>
              ))}
            </div>
          </Field>

          <Field label="What's your learning goal?">
            <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Understand Chapter 4 before my exam" />
          </Field>

          <Field label="Existing knowledge (optional)">
            <input className="input" value={form.prior_knowledge} onChange={(e) => setForm({ ...form, prior_knowledge: e.target.value })} placeholder="e.g. I know basic algebra" />
          </Field>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          onClick={submit}
          disabled={loading || !form.name || !form.email}
          className="w-full mt-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
        >
          {loading ? "Setting up…" : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${active ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
    >
      {children}
    </button>
  );
}
