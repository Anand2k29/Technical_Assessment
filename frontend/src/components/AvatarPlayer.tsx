"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGE_TO_BCP47, speakText, stopSpeaking } from "@/lib/speech";
import { t } from "@/lib/i18n";

export default function AvatarPlayer({
  text, language, uiState,
}: { text: string; language: string; uiState: "TEACHING" | "QUESTION" | "RE_EXPLAINING" | "EVALUATING" | "COMPLETED" }) {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(0.95);
  const [visibleChars, setVisibleChars] = useState(0);
  const lastText = useRef<string>("");

  const lang = LANGUAGE_TO_BCP47[language] || "en-US";

  const play = (from = 0) => {
    if (muted || !text) return;
    stopSpeaking();
    setVisibleChars(from);
    setSpeaking(true);
    speakText(text.slice(from), {
      lang,
      rate,
      pitch: 1.04,
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
    <div className="node-card-black rounded-[2.5rem] overflow-hidden flex flex-col h-full relative border border-slate-800 shadow-2xl bg-[#09090b]">
      {/* Top Controls Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="pin-yellow text-[10px] px-3 py-1 uppercase tracking-wider font-black shadow-sm">
            ● {stateLabel}
          </span>
          <span className="text-[11px] font-bold text-slate-400">Natural Voice Mode</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRate((r) => (r >= 1.25 ? 0.75 : r + 0.2))}
            className="text-xs font-black px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
          >
            {rate.toFixed(2)}× Pace
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="text-xs font-black px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
          >
            {muted ? `🔇 ${t("unmute", language)}` : `🔊 ${t("mute", language)}`}
          </button>
        </div>
      </div>

      {/* Avatar Graphic Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 relative bg-gradient-to-b from-slate-950 to-[#09090b]">
        <TeacherAvatar speaking={speaking} uiState={uiState} />

        {/* Yellow Equalizer Soundwave Bars when Speaking */}
        {speaking && (
          <div className="flex items-center gap-1.5 mt-5 h-6">
            <div className="w-1.5 bg-yellow-400 rounded-full animate-soundwave-1 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <div className="w-1.5 bg-yellow-300 rounded-full animate-soundwave-2 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <div className="w-1.5 bg-yellow-500 rounded-full animate-soundwave-3 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <div className="w-1.5 bg-yellow-400 rounded-full animate-soundwave-4 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          </div>
        )}
      </div>

      {/* Play / Pause Buttons */}
      <div className="flex items-center justify-center gap-3 py-3 bg-slate-950/95 border-t border-slate-800/80">
        <button
          onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : play(visibleChars))}
          className="btn-black bg-yellow-400 text-slate-950 hover:bg-yellow-300 px-7 py-2.5 text-xs font-black shadow-lg active:scale-95 transition rounded-full"
        >
          {speaking ? `⏸️ ${t("pause", language)}` : `▶️ ${t("play", language)}`}
        </button>
        <button
          onClick={() => play(0)}
          className="px-5 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-black active:scale-95 transition"
        >
          🔄 {t("replay", language)}
        </button>
      </div>

      {/* Subtitles Transcript Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80">
        <p className="text-xs leading-relaxed text-slate-300 bg-[#121215] rounded-2xl border border-slate-800 px-4 py-3 min-h-[3.5rem] max-h-28 overflow-y-auto font-sans">
          <span className="text-white font-extrabold">{text.slice(0, visibleChars)}</span>
          <span className="text-slate-500 font-normal">{text.slice(visibleChars)}</span>
        </p>
      </div>
    </div>
  );
}

function TeacherAvatar({ speaking, uiState }: { speaking: boolean; uiState: string }) {
  const moodColor = uiState === "RE_EXPLAINING" ? "#f59e0b" : uiState === "QUESTION" ? "#facc15" : "#eab308";

  return (
    <div className="relative group">
      <svg viewBox="0 0 200 200" width="150" height="150" role="img" aria-label="AI teacher avatar" className="relative z-10 drop-shadow-2xl">
        <circle cx="100" cy="100" r="92" fill="#171717" stroke="#333333" strokeWidth="2" />
        
        {/* Yellow Outer Halo */}
        <circle cx="100" cy="100" r="84" fill="none" stroke={moodColor} strokeWidth="3" opacity="0.5" strokeDasharray="4 4" className="animate-[spin_25s_linear_infinite]" />

        {/* Character Head */}
        <circle cx="100" cy="88" r="46" fill="#fde68a" />
        
        {/* Hair */}
        <path d="M54 80 Q100 28 146 80 Q146 42 100 35 Q54 42 54 80Z" fill="#121212" />

        {/* Glasses */}
        <circle cx="80" cy="88" r="10" fill="none" stroke="#121212" strokeWidth="3" />
        <circle cx="120" cy="88" r="10" fill="none" stroke="#121212" strokeWidth="3" />
        <line x1="90" y1="88" x2="110" y2="88" stroke="#121212" strokeWidth="3" />

        {/* Eyes */}
        <circle cx="80" cy="88" r="3" fill="#121212" />
        <circle cx="120" cy="88" r="3" fill="#121212" />

        {/* Mouth */}
        <rect
          x="82"
          y="112"
          width="36"
          height={speaking ? 12 : 4}
          rx="5"
          fill="#991b1b"
          className={speaking ? "transition-all duration-150" : ""}
        />

        {/* Shirt / Shoulder */}
        <path d="M44 185 Q100 148 156 185 L156 200 L44 200Z" fill={moodColor} />
      </svg>
    </div>
  );
}
