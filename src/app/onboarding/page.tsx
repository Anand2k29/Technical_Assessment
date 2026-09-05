"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { setUserId } from "@/lib/session";

/* ─── Step configuration ─── */
const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const LANGUAGES = ["English", "Hindi", "Hinglish"] as const;
const STYLES = [
  { id: "balanced", label: "Balanced" },
  { id: "simple", label: "Simple & Slow" },
  { id: "analogy", label: "Analogy-Heavy" },
  { id: "example-heavy", label: "Example-Heavy" },
  { id: "socratic", label: "Socratic (Questions)" },
] as const;

const STEP_META = [
  { icon: "👋", title: "Who are you?", subtitle: "Let's start with the basics" },
  { icon: "🎯", title: "Your level & language", subtitle: "So we can meet you where you are" },
  { icon: "🧠", title: "How should we teach?", subtitle: "Pick the style that feels right" },
  { icon: "🚀", title: "Your learning goal", subtitle: "What are you working towards?" },
] as const;

const TOTAL_STEPS = STEP_META.length;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    level: "beginner",
    language: "English",
    teaching_style: "balanced",
    goal: "",
    prior_knowledge: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Change step with animation trigger */
  const goTo = useCallback((next: number) => {
    setStep(next);
    setAnimKey((k) => k + 1);
  }, []);

  const next = () => goTo(Math.min(step + 1, TOTAL_STEPS - 1));
  const back = () => goTo(Math.max(step - 1, 0));

  /* Submit */
  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await api.onboard(form);
      setUserId(profile?.user_id || `usr_${Date.now()}`);
      router.push("/dashboard");
    } catch {
      // Prototype fallback: ensure user is never blocked
      const fallbackId = `usr_${Date.now()}`;
      setUserId(fallbackId);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* Can proceed from current step? */
  const canProceed = (() => {
    if (step === 0) return form.name.trim().length > 0 && form.email.trim().length > 0;
    return true;
  })();

  const isLast = step === TOTAL_STEPS - 1;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const meta = STEP_META[step];

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Animated background */}
      <div className="onboard-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          {/* Progress bar */}
          <div className="progress-track mb-6">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEP_META.map((_, i) => (
              <button
                key={i}
                onClick={() => i < step && goTo(i)}
                className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Step header */}
          <div className="text-center mb-6" key={`header-${animKey}`}>
            <div className="step-icon mx-auto">{meta.icon}</div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{meta.title}</h1>
            <p className="text-sm text-slate-500">{meta.subtitle}</p>
          </div>

          {/* Step content */}
          <div key={`content-${animKey}`} className="step-enter">
            {step === 0 && <StepIdentity form={form} setForm={setForm} />}
            {step === 1 && <StepLevel form={form} setForm={setForm} />}
            {step === 2 && <StepStyle form={form} setForm={setForm} />}
            {step === 3 && <StepGoal form={form} setForm={setForm} />}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={back} className="btn-secondary" type="button">
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? submit : next}
              disabled={!canProceed || loading}
              className="btn-primary"
              type="button"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Setting up…
                </span>
              ) : isLast ? (
                "🚀 Launch my AI Teacher"
              ) : (
                "Continue →"
              )}
            </button>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Step {step + 1} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Subtle brand */}
        <p className="text-center text-xs text-slate-400 mt-6 opacity-70">
          AUTO<span className="font-semibold text-indigo-400">PSY</span> · AI Teacher that adapts to you
        </p>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

type FormState = {
  name: string;
  email: string;
  level: string;
  language: string;
  teaching_style: string;
  goal: string;
  prior_knowledge: string;
};
type StepProps = { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> };

function StepIdentity({ form, setForm }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Your Name</span>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jyotasana"
            autoFocus
          />
        </label>
        <label className="block">
          <span className="field-label">Email Address</span>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
      </div>
    </div>
  );
}

function StepLevel({ form, setForm }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <span className="field-label">Current Knowledge Level</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`chip ${form.level === l ? "active" : ""}`}
              onClick={() => setForm({ ...form, level: l })}
            >
              {l === "beginner" && "🌱 "}{l === "intermediate" && "📚 "}{l === "advanced" && "🔬 "}{l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="field-label">Preferred Language</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              className={`chip ${form.language === l ? "active" : ""}`}
              onClick={() => setForm({ ...form, language: l })}
            >
              {l === "English" && "🇬🇧 "}{l === "Hindi" && "🇮🇳 "}{l === "Hinglish" && "🤙 "}{l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepStyle({ form, setForm }: StepProps) {
  return (
    <div>
      <span className="field-label">Teaching Style Preference</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${form.teaching_style === s.id ? "active" : ""}`}
            onClick={() => setForm({ ...form, teaching_style: s.id })}
          >
            {s.id === "balanced" && "⚖️ "}
            {s.id === "simple" && "🐢 "}
            {s.id === "analogy" && "🪞 "}
            {s.id === "example-heavy" && "📝 "}
            {s.id === "socratic" && "❓ "}
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Don&apos;t worry — you can change this anytime in Settings.
      </p>
    </div>
  );
}

function StepGoal({ form, setForm }: StepProps) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="field-label">What is your learning goal?</span>
        <input
          className="input"
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
          placeholder="e.g. Master Neural Networks before my exam"
          autoFocus
        />
      </label>
      <label className="block">
        <span className="field-label">Prior Knowledge (optional)</span>
        <input
          className="input"
          value={form.prior_knowledge}
          onChange={(e) => setForm({ ...form, prior_knowledge: e.target.value })}
          placeholder="e.g. I know basic algebra and Python"
        />
      </label>
    </div>
  );
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60 30" />
    </svg>
  );
}
