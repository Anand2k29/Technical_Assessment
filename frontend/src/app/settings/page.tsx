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
    <div className="max-w-lg mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1">Level</span>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setForm({ ...form, level: l })} className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${form.level === l ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600"}`}>{l}</button>
            ))}
          </div>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1">Language</span>
          <div className="flex gap-2">
            {LANGUAGES.map((l) => (
              <button key={l} onClick={() => setForm({ ...form, language: l })} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${form.language === l ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600"}`}>{l}</button>
            ))}
          </div>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1">Learning goal</span>
          <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={save} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
          {saved ? "Saved ✓" : "Save Changes"}
        </button>

        <button
          onClick={() => { clearUserId(); router.push("/"); }}
          className="w-full py-2 text-xs text-slate-400 hover:text-slate-600"
        >
          Sign out of this browser
        </button>
      </div>
    </div>
  );
}
