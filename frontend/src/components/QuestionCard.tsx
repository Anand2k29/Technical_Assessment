"use client";

import { useState } from "react";
import type { CheckpointQuestion } from "@/lib/api";
import { LANGUAGE_TO_BCP47, isSpeechRecognitionSupported, listenOnce } from "@/lib/speech";
import { t } from "@/lib/i18n";

export default function QuestionCard({
  question, language, onSubmit, submitting,
}: { question: CheckpointQuestion; language: string; onSubmit: (text: string) => void; submitting: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [listening, setListening] = useState(false);
  const isMcq = question.type === "mcq";

  const submit = () => {
    const value = isMcq ? selected : freeText.trim();
    if (!value) return;
    onSubmit(value);
    setSelected(null);
    setFreeText("");
  };

  const startListening = () => {
    setListening(true);
    listenOnce(
      LANGUAGE_TO_BCP47[language] || "en-US",
      (transcript) => { setFreeText(transcript); setListening(false); },
      () => setListening(false)
    );
  };

  return (
    <div className="rounded-[2rem] border border-slate-300 bg-white p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider">
          ⚡ {t("question", language)}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{question.type}</span>
      </div>

      <p className="text-base font-extrabold text-slate-900 leading-relaxed">{question.text}</p>

      {isMcq ? (
        <div className="grid gap-2.5 pt-1">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              disabled={submitting}
              className={`text-left px-5 py-3 rounded-2xl border text-xs font-black transition-all ${
                selected === opt
                  ? "bg-[#09090b] border-slate-900 text-white shadow-md ring-2 ring-yellow-400"
                  : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2 items-start">
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            disabled={submitting}
            rows={3}
            placeholder="Type your explanation answer here…"
            className="input text-xs font-medium focus:ring-2 focus:ring-yellow-400"
          />
          {isSpeechRecognitionSupported() && (
            <button
              onClick={startListening}
              disabled={submitting || listening}
              title={t("speak_answer", language)}
              className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border font-bold transition-all ${
                listening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md"
                  : "bg-yellow-400 text-slate-950 border-yellow-500 hover:bg-yellow-300 shadow-sm"
              }`}
            >
              🎤
            </button>
          )}
        </div>
      )}
      {listening && <p className="text-xs font-extrabold text-yellow-600 animate-pulse">● {t("listening", language)}</p>}

      <button
        onClick={submit}
        disabled={submitting || (isMcq ? !selected : !freeText.trim())}
        className="w-full btn-black-pill py-3.5 text-center text-xs font-black shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>{submitting ? t("checking", language) : t("submit", language)}</span>
        <span className="text-yellow-400">→</span>
      </button>
    </div>
  );
}

