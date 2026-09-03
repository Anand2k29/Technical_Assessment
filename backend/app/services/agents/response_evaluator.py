"""Response Evaluator: judges a student's answer. Never just 'Incorrect' --
returns enough signal (confidence, matched/missing ideas) for the
Misconception Engine and Adaptive Teacher to act on."""
import re

from app.services.providers.llm import LLMProvider

SCHEMA_HINT = '{"correct": true, "confidence": 0.0, "reasoning": "..."}'
STOPWORDS = {"the", "a", "an", "is", "are", "it", "to", "of", "and", "in", "on", "for", "with"}


def _keywords(text: str) -> set[str]:
    return {w.lower() for w in re.findall(r"[a-zA-Z]{3,}", text)} - STOPWORDS


def _evaluate_mcq(question: dict, response_text: str) -> dict:
    correct = response_text.strip().lower() == question["correct_answer"].strip().lower()
    return {"correct": correct, "confidence": 1.0 if correct else 0.9, "reasoning": "Exact option match."}


def _evaluate_open(question: dict, response_text: str) -> dict:
    response_words = _keywords(response_text)
    reference = _keywords(question.get("correct_answer", "") + " " + question.get("concept", ""))
    if not reference:
        correct = len(response_words) >= 3
        overlap = 1.0 if correct else 0.0
    else:
        overlap = len(response_words & reference) / max(len(reference), 1)
        correct = overlap >= 0.34 and len(response_words) >= 2
    return {"correct": correct, "confidence": round(min(overlap + 0.2, 1.0), 2),
            "reasoning": f"Keyword overlap with expected concept: {overlap:.0%}."}


def evaluate_response(llm: LLMProvider, question: dict, response_text: str) -> dict:
    fallback = _evaluate_mcq(question, response_text) if question.get("type") == "mcq" else _evaluate_open(question, response_text)
    if not llm.is_live():
        return fallback

    system = "You are AUTOPSY's Response Evaluator agent. Judge correctness fairly and explain your reasoning briefly."
    prompt = (
        f"Question: {question['text']}\nExpected answer / key idea: {question.get('correct_answer')}\n"
        f"Student's response: {response_text}\n\nIs the response correct? How confident are you (0-1)?"
    )
    result = llm.structured_output(system, prompt, SCHEMA_HINT, max_tokens=300)
    if not result or "correct" not in result:
        return fallback
    result.setdefault("confidence", 0.7)
    result.setdefault("reasoning", "")
    return result
