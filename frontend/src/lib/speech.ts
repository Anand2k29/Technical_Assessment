"use client";

// Thin wrapper around the browser-native Web Speech API. This is the P1
// "Voice & AI Avatar" provider used in DEMO/free mode: real speech, no key,
// no paid API -- swappable later for ElevenLabs/Whisper by giving those
// providers the same speak()/listen() surface.

export function speakText(
  text: string,
  opts: { lang?: string; rate?: number; onWord?: (charIndex: number) => void; onEnd?: () => void } = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = opts.lang || "en-US";
  utter.rate = opts.rate || 1;
  if (opts.onWord) utter.onboundary = (e) => opts.onWord?.(e.charIndex);
  if (opts.onEnd) utter.onend = () => opts.onEnd?.();
  window.speechSynthesis.speak(utter);
  return utter;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function listenOnce(
  lang: string,
  onResult: (text: string) => void,
  onError?: (msg: string) => void
): { stop: () => void } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Recognition) {
    onError?.("Voice input isn't supported in this browser. Try Chrome or Edge, or type your answer instead.");
    return null;
  }
  const recognition = new Recognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event: SpeechRecognitionEventLike) => {
    onResult(event.results[0][0].transcript);
  };
  recognition.onerror = (event: { error: string }) => onError?.(event.error);
  recognition.start();
  return { stop: () => recognition.stop() };
}

interface SpeechRecognitionEventLike {
  results: { 0: { transcript: string } }[];
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onerror: (event: { error: string }) => void;
  start: () => void;
  stop: () => void;
}

export const LANGUAGE_TO_BCP47: Record<string, string> = {
  English: "en-US", Hindi: "hi-IN", Hinglish: "hi-IN",
};
