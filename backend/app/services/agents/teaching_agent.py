"""Teaching Agent: owns the explicit teaching state and decides the next
teaching action. Deliberately NOT another LLM call -- this is a small,
inspectable state machine so the adaptive loop is reliable and demoable
regardless of LLM availability, exactly like the product spec's example
teaching-state object."""
from dataclasses import dataclass, field

from app.services.agents.adaptive import difficulty_for_mastery, update_mastery


@dataclass
class TeachingState:
    current_concept: str
    mastery: float = 0.0
    difficulty: str = "beginner"
    attempts: int = 0
    misconceptions: list[str] = field(default_factory=list)
    next_action: str = "explain"

    def to_dict(self) -> dict:
        return {
            "current_concept": self.current_concept, "mastery": self.mastery, "difficulty": self.difficulty,
            "attempts": self.attempts, "misconceptions": self.misconceptions, "next_action": self.next_action,
        }


def advance(state: dict, evaluation: dict, misconception: dict | None) -> dict:
    """Given the current teaching state + this turn's evaluation/misconception,
    return the updated state (mutated copy) with a concrete next_action."""
    state = dict(state)
    correct = evaluation.get("correct", False)
    state["attempts"] = state.get("attempts", 0) + 1
    severity = misconception.get("severity") if misconception else None

    state["mastery"] = update_mastery(
        mastery=state.get("mastery", 0.0), attempts=state["attempts"],
        correct=correct, confidence=evaluation.get("confidence", 0.5), misconception_severity=severity,
    )
    new_band = difficulty_for_mastery(state["mastery"])
    leveled_up = new_band != state.get("difficulty")
    state["difficulty"] = new_band

    if not correct and misconception:
        label = misconception.get("misconception")
        if label and label not in state.get("misconceptions", []):
            state.setdefault("misconceptions", []).append(label)
        strategy = misconception.get("recommended_strategy", "simplify")
        state["next_action"] = f"re_explain_with_{strategy}"
    elif correct and leveled_up and new_band not in ("beginner",):
        state["next_action"] = "increase_difficulty"
    elif correct and new_band == "mastered":
        state["next_action"] = "advance_to_next_concept"
    elif correct:
        state["next_action"] = "continue"
    return state
