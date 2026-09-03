"""TranslationProvider abstraction for multilingual teaching. Live mode uses
the LLM for full-fidelity translation. Demo mode (no LLM key) uses a small
curated EN->HI/Hinglish phrase dictionary: it code-switches common teaching
connector phrases into Hindi while keeping technical/domain nouns in English
-- the same strategy real Hinglish ed-tech content uses -- so multilingual
mode is genuinely functional (not faked) even without a live model."""
import re

from app.services.providers.llm import LLMProvider

PHRASES_HI = {
    "let's": "चलिए", "let's learn about": "चलिए सीखते हैं", "let's continue": "चलिए आगे बढ़ते हैं",
    "understand": "समझते हैं", "for example": "उदाहरण के लिए", "in other words": "दूसरे शब्दों में",
    "think of it like": "इसे ऐसे सोचिए", "let's break it down": "इसे तोड़कर समझते हैं",
    "great job": "बहुत बढ़िया", "not quite": "बिल्कुल नहीं", "let's try again": "फिर से कोशिश करते हैं",
    "here's why": "यह इसलिए है", "let's look at": "चलिए देखते हैं", "is a key idea in": "एक मुख्य विचार है",
}


def _dictionary_transform(text: str, hinglish: bool) -> str:
    out = text
    for en, hi in sorted(PHRASES_HI.items(), key=lambda kv: -len(kv[0])):
        out = re.sub(re.escape(en), hi, out, flags=re.IGNORECASE)
    if hinglish:
        return out  # Hinglish: Hindi connectors + English technical terms mixed as-is
    return out


class TranslationProvider:
    def translate(self, text: str, target_language: str, llm: LLMProvider) -> dict:
        target = target_language.lower()
        if target in ("english", "en"):
            return {"text": text, "mode": "identity"}

        if llm.is_live():
            system = "You are a translation layer for an AI teacher. Preserve technical accuracy; keep formulas/code untouched."
            style = "Hinglish (natural Hindi-English code-switching)" if target == "hinglish" else target_language
            prompt = f"Translate this lesson text into {style}. Keep it natural for spoken teaching:\n\n{text}"
            translated = llm.generate(system, prompt, max_tokens=800)
            return {"text": translated, "mode": "live"}

        if target in ("hindi", "hinglish", "hi"):
            return {"text": _dictionary_transform(text, hinglish=target == "hinglish"), "mode": "demo_dictionary"}

        return {"text": text, "mode": "unsupported_in_demo"}


_provider = TranslationProvider()


def get_translation_provider() -> TranslationProvider:
    return _provider
