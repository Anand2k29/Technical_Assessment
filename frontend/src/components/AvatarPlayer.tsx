"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGE_TO_BCP47, speakText, stopSpeaking } from "@/lib/speech";
import { t } from "@/lib/i18n";

// The AI Teacher video experience, provider-abstracted: today it's a
// CSS/SVG avatar synced to the browser's native TTS with live subtitles
// (VideoProvider = "browser-native"); a paid AvatarProvider (HeyGen/D-ID)
// can be dropped in later behind the same {text, lang, uiState} contract
// without touching the Teaching Room that renders this component.
export default function AvatarPlayer({
  text, language, uiState,
}: { text: string; language: string; uiState: "TEACHING" | "QUESTION" | "RE_EXPLAINING" | "EVALUATING" | "COMPLETED" }) {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [visibleChars, setVisibleChars] = useState(0);
  const lastText = useRef<string>("");

  const lang = LANGUAGE_TO_BCP47[language] || "en-US";

  const play = (from = 0) => {
    if (muted || !text) return;
    stopSpeaking();
    setVisibleChars(from);
    setSpeaking(true);
    speakText(text.slice(from), {
      lang, rate,
      onWord: (idx) => setVisibleChars(from + idx),
      onEnd: () => setSpeaking(false),
    });
  };

  useEffect(() => {
    if (text && text !== lastText.current) {
      lastText.current = text;
      play(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, muted]);

  useEffect(() => stopSpeaking, []);

  const stateLabel = t(uiState.toLowerCase(), language);

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-indigo-50 to-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white/70">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
          <span className={`w-2 h-2 rounded-full ${speaking ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          {stateLabel}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setRate((r) => (r >= 1.5 ? 0.75 : r + 0.25))} className="text-xs text-slate-500 hover:text-slate-800" title="Speed">
            {rate}×
          </button>
          <button onClick={() => setMuted((m) => !m)} className="text-xs text-slate-500 hover:text-slate-800">
            {muted ? t("unmute", language) : t("mute", language)}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-6">
        <TeacherAvatar speaking={speaking} uiState={uiState} />
      </div>

      <div className="flex items-center justify-center gap-3 pb-3">
        <button
          onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : play(visibleChars))}
          className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
        >
          {speaking ? t("pause", language) : t("play", language)}
        </button>
        <button onClick={() => play(0)} className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
          {t("replay", language)}
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-sm leading-relaxed text-slate-700 bg-white rounded-xl border border-slate-100 px-4 py-3 min-h-[3.5rem]">
          <span className="text-slate-900">{text.slice(0, visibleChars)}</span>
          <span className="text-slate-400">{text.slice(visibleChars)}</span>
        </p>
      </div>
    </div>
  );
}

function TeacherAvatar({ speaking, uiState }: { speaking: boolean; uiState: string }) {
  const mood = uiState === "RE_EXPLAINING" ? "#f59e0b" : uiState === "QUESTION" ? "#6366f1" : "#4f46e5";
  return (
    <svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label="AI teacher avatar">
      <circle cx="100" cy="100" r="92" fill="#eef2ff" />
      <circle cx="100" cy="88" r="52" fill="#ffe4c4" />
      <path d="M50 80 Q100 30 150 80 Q150 40 100 35 Q50 40 50 80Z" fill={mood} />
      <circle cx="80" cy="90" r="6" fill="#1e293b" />
      <circle cx="120" cy="90" r="6" fill="#1e293b" />
      <rect x="75" y="112" width="50" height={speaking ? 16 : 6} rx="8" fill="#7f1d1d" className={speaking ? "animate-[pulse_0.35s_ease-in-out_infinite]" : ""} />
      <path d="M40 190 Q100 150 160 190 L160 200 L40 200Z" fill={mood} />
    </svg>
  );
}
