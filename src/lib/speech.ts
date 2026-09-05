"use client";

// Thin wrapper around the browser-native Web Speech API. This is the P1
// "Voice & AI Avatar" provider used in DEMO/free mode: real speech, no key,
// no paid API -- swappable later for ElevenLabs/Whisper by giving those
// providers the same speak()/listen() surface.

"use client";

// Web Speech API Provider with Advanced Voice Modulation & Sentence Pacing.
// Selects natural voices (Google US English, Samantha, Microsoft Natural, Daniel),
// modulates pitch/rate for engaging teaching cadence, and splits scripts into
// sentence chunks with micro-pauses.

function selectBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLang = lang.toLowerCase();
  const langVoices = voices.filter((v) => v.lang.toLowerCase().includes(targetLang.slice(0, 2)));

  // Priority search for natural, neural, or premium teaching voices
  const priorityNames = [
    "google us english",
    "samantha",
    "microsoft jenny online",
    "microsoft guy online",
    "microsoft aria online",
    "karen",
    "daniel",
    "apple voice",
    "natural",
    "enhanced",
  ];

  for (const name of priorityNames) {
    const match = langVoices.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }

  // Fallback to first matching language voice or first available voice
  return langVoices[0] || voices[0];
}

// Global reference for active speech queue cancelation
let activeSpeechCancel: (() => void) | null = null;

export function speakText(
  text: string,
  opts: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onWord?: (charIndex: number) => void;
    onEnd?: () => void;
  } = {}
): { cancel: () => void } | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return null;

  // Cancel any active utterance queue
  stopSpeaking();

  const lang = opts.lang || "en-US";
  const baseRate = opts.rate || 0.94; // Calibrated teaching cadence (slightly slower than default 1.0)
  const basePitch = opts.pitch || 1.04; // Slightly warmer, articulate teaching pitch

  // Split text into sentence chunks by punctuation (. ! ? ; :) to avoid monotonous robotic monologues
  const sentences = text
    .match(/[^.!?:]+[.!?:]+/g) || [text];

  let currentSentenceIndex = 0;
  let charOffsetAccumulator = 0;
  let isCancelled = false;

  const cancelSpeech = () => {
    isCancelled = true;
    window.speechSynthesis.cancel();
  };
  activeSpeechCancel = cancelSpeech;

  const speakNextSentence = () => {
    if (isCancelled || currentSentenceIndex >= sentences.length) {
      if (!isCancelled) opts.onEnd?.();
      return;
    }

    const sentenceText = sentences[currentSentenceIndex];
    const utter = new SpeechSynthesisUtterance(sentenceText.trim());
    utter.lang = lang;

    // Attach selected natural voice
    const bestVoice = selectBestVoice(lang);
    if (bestVoice) utter.voice = bestVoice;

    // Dynamic Pitch & Rate Modulation per Sentence Type
    if (sentenceText.endsWith("?")) {
      utter.pitch = Math.min(basePitch + 0.08, 1.2); // Question inflection lift
      utter.rate = baseRate * 0.96;
    } else if (sentenceText.endsWith("!")) {
      utter.pitch = Math.min(basePitch + 0.05, 1.15); // Enthusiastic emphasis
      utter.rate = baseRate * 1.02;
    } else {
      utter.pitch = basePitch;
      utter.rate = baseRate;
    }

    const currentOffset = charOffsetAccumulator;

    utter.onboundary = (e) => {
      if (!isCancelled && opts.onWord) {
        opts.onWord(currentOffset + e.charIndex);
      }
    };

    utter.onend = () => {
      if (isCancelled) return;
      charOffsetAccumulator += sentenceText.length;
      currentSentenceIndex++;

      // Natural breath pause between sentences (180ms for periods, 300ms for questions)
      const pauseDuration = sentenceText.endsWith("?") ? 280 : 180;
      setTimeout(speakNextSentence, pauseDuration);
    };

    utter.onerror = () => {
      if (isCancelled) return;
      charOffsetAccumulator += sentenceText.length;
      currentSentenceIndex++;
      speakNextSentence();
    };

    window.speechSynthesis.speak(utter);
  };

  // Ensure voices are loaded (some browsers populate voices asynchronously)
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      if (!isCancelled) speakNextSentence();
    };
  }

  speakNextSentence();
  return { cancel: cancelSpeech };
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    if (activeSpeechCancel) {
      activeSpeechCancel();
      activeSpeechCancel = null;
    }
    window.speechSynthesis.cancel();
  }
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

