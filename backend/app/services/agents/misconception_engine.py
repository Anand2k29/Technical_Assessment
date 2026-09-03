"""Misconception Engine: the "why is the student wrong" layer. Prefers a
curated misconception_map on the question (sample content) when present --
real, specific pedagogy without needing an LLM -- and otherwise falls back to
a generic but still strategy-driven diagnosis, rotating re-teaching
strategies across repeated attempts rather than repeating the same
explanation."""
from app.services.providers.llm import LLMProvider

SCHEMA_HINT = (
    '{"misconception": "short_snake_case_label", "description": "...", "severity": "low|medium|high", '
    '"recommended_strategy": "simplify|analogy|step_by_step|real_world_example|counterexample", "reexplain": "..."}'
)
STRATEGY_ROTATION = ["simplify", "analogy", "step_by_step", "real_world_example"]


def _fallback(question: dict, response_text: str, attempt_count: int, evaluation: dict) -> dict:
    mapping = question.get("misconception_map", {})
    if response_text.strip() in mapping:
        info = mapping[response_text.strip()]
        return {
            "misconception": info["label"], "description": info["description"], "severity": info["severity"],
            "recommended_strategy": info["strategy"], "reexplain": info["reexplain"], "confidence": 0.95,
        }

    concept = question.get("concept", "this idea")
    strategy = STRATEGY_ROTATION[min(attempt_count, len(STRATEGY_ROTATION) - 1)]
    overlap = evaluation.get("confidence", 0.3)
    severity = "high" if overlap < 0.2 else ("medium" if overlap < 0.5 else "low")
    templates = {
        "simplify": f"Let's simplify. At its core, {concept} is just one idea: think about the smallest version of the problem first.",
        "analogy": f"Let's try a different angle. Imagine {concept} as something from everyday life, and map each part onto that.",
        "step_by_step": f"Let's go step by step through {concept} instead of all at once, checking in after each step.",
        "real_world_example": f"Let's ground {concept} in a concrete real-world example before returning to the general idea.",
    }
    return {
        "misconception": "conceptual_gap", "description": f"Response doesn't yet match the expected understanding of {concept}.",
        "severity": severity, "recommended_strategy": strategy, "reexplain": templates[strategy], "confidence": round(1 - overlap, 2),
    }


def detect_misconception(llm: LLMProvider, question: dict, response_text: str, evaluation: dict,
                          attempt_count: int, history: list[str] | None = None) -> dict:
    fallback = _fallback(question, response_text, attempt_count, evaluation)
    if not llm.is_live():
        return fallback

    system = "You are AUTOPSY's Misconception Engine. Diagnose WHY the student answered incorrectly, not just that they did."
    prompt = (
        f"Question: {question['text']}\nExpected answer: {question.get('correct_answer')}\n"
        f"Student's response: {response_text}\nAttempt number: {attempt_count + 1}\n"
        f"Prior misconceptions this session: {history or []}\n\n"
        f"Identify the specific likely misconception and the best re-teaching strategy."
    )
    result = llm.structured_output(system, prompt, SCHEMA_HINT, max_tokens=400)
    if not result or "misconception" not in result:
        return fallback
    result.setdefault("confidence", 0.7)
    return result
