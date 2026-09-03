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
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">{t("question", language)}</div>
      <p className="text-base font-medium text-slate-900 mb-4">{question.text}</p>

      {isMcq ? (
        <div className="grid gap-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              disabled={submitting}
              className={`text-left px-4 py-2.5 rounded-xl border text-sm transition ${
                selected === opt ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white hover:border-indigo-300"
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
            placeholder="Type your answer…"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {isSpeechRecognitionSupported() && (
            <button
              onClick={startListening}
              disabled={submitting || listening}
              title={t("speak_answer", language)}
              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border ${listening ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-white border-slate-200 hover:border-indigo-300"}`}
            >
              🎤
            </button>
          )}
        </div>
      )}
      {listening && <p className="text-xs text-indigo-500 mt-1">{t("listening", language)}</p>}

      <button
        onClick={submit}
        disabled={submitting || (isMcq ? !selected : !freeText.trim())}
        className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? t("checking", language) : t("submit", language)}
      </button>
    </div>
  );
}
