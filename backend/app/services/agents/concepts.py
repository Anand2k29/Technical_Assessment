"""Lightweight concept/keyword extraction shared by the lesson planner and
visual planner. Deterministic (TF-IDF over the retrieved context) so it works
identically in demo mode and live mode -- the LLM (when live) only elaborates
on these concepts, it doesn't invent the topic list from nothing."""
import re
from collections import Counter

STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "with", "this", "that",
    "from", "have", "has", "was", "were", "will", "can", "its", "into", "than",
    "then", "them", "they", "which", "when", "where", "your", "our", "these",
    "those", "such", "also", "each", "some", "more", "most", "very", "about",
    # Document-structure words: real in a heading, never a teachable concept --
    # otherwise a chunk like "Section 7.1 Photosynthesis" pollutes extraction
    # with "section" instead of the actual subject.
    "chapter", "section", "unit", "part", "page", "appendix", "introduction",
    "overview", "summary", "chapters", "sections", "units", "parts",
}


def extract_key_terms(text: str, top_n: int = 8) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z\-]{3,}", text)
    counts = Counter(w.lower() for w in words if w.lower() not in STOPWORDS)
    # prefer terms that also appear capitalized in the source (likely proper/technical nouns)
    capitalized = {w.lower() for w in re.findall(r"\b[A-Z][a-z]{3,}\b", text)}
    ranked = sorted(counts.items(), key=lambda kv: (kv[0] in capitalized, kv[1]), reverse=True)
    return [w for w, _ in ranked[:top_n]]


def summarize_sentences(text: str, max_sentences: int = 3) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    sentences = [s for s in sentences if len(s.split()) > 4]
    return " ".join(sentences[:max_sentences]) or text[:400]
