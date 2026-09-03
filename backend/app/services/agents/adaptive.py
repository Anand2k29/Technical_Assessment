"""Adaptive engine: owns the mastery score math and difficulty banding.
Thresholds match the product spec exactly (0-30 beginner, 30-60 guided
practice, 60-80 intermediate, 80-95 advanced, 95+ mastered)."""

BANDS = [
    (0.30, "beginner"),
    (0.60, "guided_practice"),
    (0.80, "intermediate"),
    (0.95, "advanced"),
    (1.01, "mastered"),
]

SEVERITY_PENALTY = {"low": 0.04, "medium": 0.08, "high": 0.14, None: 0.06}


def difficulty_for_mastery(mastery: float) -> str:
    for ceiling, label in BANDS:
        if mastery < ceiling:
            return label
    return "mastered"


def update_mastery(mastery: float, attempts: int, correct: bool, confidence: float, misconception_severity: str | None) -> float:
    if correct:
        gain = 0.12 + 0.10 * confidence
        gain *= max(0.3, 1 - mastery)  # diminishing returns as mastery approaches 1
        new_mastery = mastery + gain
    else:
        new_mastery = mastery - SEVERITY_PENALTY.get(misconception_severity, 0.06)
    return round(max(0.0, min(1.0, new_mastery)), 3)
