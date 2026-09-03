"""Question Generator: produces checkpoint / assessment questions calibrated
to a concept and difficulty. Fallback builds real MCQ distractors out of other
lesson concepts rather than nonsense options, so demo mode still exercises
genuine evaluation logic."""
import random

from app.services.agents.concepts import summarize_sentences
from app.services.providers.llm import LLMProvider

SCHEMA_HINT = '{"text": "...", "type": "mcq|conceptual|short_answer|application", "options": ["..."], "correct_answer": "..."}'


def _fallback_mcq(concept: str, context_text: str, other_concepts: list[str]) -> dict:
    correct = summarize_sentences(context_text, 1) if context_text else f"It is the core idea behind {concept} in this lesson."
    distractor_pool = [f"It is unrelated to {c}, but is often confused with it." for c in other_concepts if c != concept]
    distractors = (distractor_pool or [f"It has no effect on the outcome being discussed.", f"It only applies in unrelated contexts."])[:3]
    while len(distractors) < 3:
        distractors.append(f"It contradicts the definition of {concept}.")
    options = [correct] + distractors[:3]
    random.shuffle(options)
    return {"text": f"Which statement best describes {concept}?", "type": "mcq", "options": options, "correct_answer": correct}


def _fallback_conceptual(concept: str, topic: str, difficulty: str) -> dict:
    if difficulty in ("advanced",):
        text = f"In your own words, explain how {concept} applies to a new situation within {topic}, and why."
    else:
        text = f"In your own words, what is {concept} and why does it matter in {topic}?"
    return {"text": text, "type": "conceptual", "options": [], "correct_answer": concept}


def generate_question(llm: LLMProvider, concept: str, topic: str, context_text: str, other_concepts: list[str],
                       difficulty: str = "beginner", qtype: str = "mcq") -> dict:
    fallback = _fallback_mcq(concept, context_text, other_concepts) if qtype == "mcq" else _fallback_conceptual(concept, topic, difficulty)
    if not llm.is_live():
        return fallback

    system = "You are AUTOPSY's Question Generator agent. Write one calibrated checkpoint question. Ground it in the given context if present."
    prompt = (
        f"Concept: {concept}\nTopic: {topic}\nDifficulty: {difficulty}\nQuestion type: {qtype}\n"
        f"Context:\n{context_text or '(none, use general knowledge)'}\n\n"
        f"If type is mcq, include exactly 4 options with one correct_answer matching one option verbatim."
    )
    result = llm.structured_output(system, prompt, SCHEMA_HINT, max_tokens=400)
    if not result or "text" not in result or "correct_answer" not in result:
        return fallback
    result.setdefault("options", [])
    result.setdefault("type", qtype)
    return result
