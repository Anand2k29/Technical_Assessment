"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearUserId, getUserId } from "@/lib/session";

const LEVELS = ["beginner", "intermediate", "advanced"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", level: "beginner", language: "English", teaching_style: "balanced", goal: "", prior_knowledge: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { router.push("/onboarding"); return; }
    api.getProfile(userId).then((p) => setForm({ name: p.name, email: p.email, level: p.level, language: p.language, teaching_style: p.teaching_style, goal: p.goal, prior_knowledge: p.prior_knowledge }));
  }, [router]);

  const save = async () => {
    setError(null);
    try {
      await api.onboard(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save your settings.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account & Learning Settings</h1>
        <p className="text-xs font-bold text-slate-500 mt-1">Configure your preferred difficulty level, language, and goals</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-purple-100/80 p-8 shadow-sm space-y-6">
        <label className="block space-y-2">
          <span className="block text-xs font-black uppercase tracking-wider text-slate-500">Knowledge Level</span>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setForm({ ...form, level: l })}
                className={`px-4 py-2 rounded-full text-xs font-black capitalize border transition-all ${
                  form.level === l ? "bg-slate-900 border-slate-900 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-2">
          <span className="block text-xs font-black uppercase tracking-wider text-slate-500">Spoken Language</span>
          <div className="flex gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setForm({ ...form, language: l })}
                className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                  form.language === l ? "bg-slate-900 border-slate-900 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-2">
          <span className="block text-xs font-black uppercase tracking-wider text-slate-500">Learning Goal</span>
          <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Master AI Fundamentals" />
        </label>

        {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

        <button onClick={save} className="w-full btn-black-pill py-3 text-center text-xs font-black shadow-md">
          {saved ? "Saved Changes ✓" : "Save Settings"}
        </button>

        <button
          onClick={() => { clearUserId(); router.push("/"); }}
          className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition text-center"
        >
          Sign Out of This Session
        </button>
      </div>
    </div>
  );
}
