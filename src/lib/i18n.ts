// UI chrome strings (buttons/labels), localized without needing an LLM call --
// separate from lesson *content* translation, which goes through /api/translate.
const DICT: Record<string, Record<string, string>> = {
  English: {
    teaching: "Teaching", question: "Question", re_explaining: "Re-explaining", completed: "Completed",
    play: "Play", pause: "Pause", replay: "Replay", mute: "Mute", unmute: "Unmute",
    submit: "Submit Answer", speak_answer: "Speak your answer", listening: "Listening…",
    based_on_material: "Based on your material", checking: "Checking your answer…",
    correct: "Correct!", not_quite: "Not quite — let's look again", continue_: "Continue",
    start_assessment: "Start Assessment", finish: "Finish Lesson",
  },
  Hindi: {
    teaching: "पढ़ाई हो रही है", question: "प्रश्न", re_explaining: "फिर से समझा रहे हैं", completed: "पूर्ण",
    play: "चलाएँ", pause: "रोकें", replay: "फिर से चलाएँ", mute: "म्यूट", unmute: "अनम्यूट",
    submit: "उत्तर भेजें", speak_answer: "अपना उत्तर बोलें", listening: "सुन रहे हैं…",
    based_on_material: "आपकी सामग्री पर आधारित", checking: "जांच रहे हैं…",
    correct: "बिल्कुल सही!", not_quite: "बिल्कुल नहीं — चलिए फिर से देखते हैं", continue_: "आगे बढ़ें",
    start_assessment: "मूल्यांकन शुरू करें", finish: "पाठ पूरा करें",
  },
  Hinglish: {
    teaching: "Teaching चल rahi hai", question: "Question", re_explaining: "Phir se samjha rahe hain", completed: "Complete",
    play: "Play", pause: "Pause", replay: "Replay", mute: "Mute", unmute: "Unmute",
    submit: "Answer Submit karein", speak_answer: "Apna answer boliye", listening: "Sun rahe hain…",
    based_on_material: "Aapki material par based", checking: "Check kar rahe hain…",
    correct: "Bilkul sahi!", not_quite: "Bilkul nahi — chaliye phir se dekhte hain", continue_: "Aage badhein",
    start_assessment: "Assessment shuru karein", finish: "Lesson khatam karein",
  },
};

export function t(key: string, language: string): string {
  return DICT[language]?.[key] ?? DICT.English[key] ?? key;
}
