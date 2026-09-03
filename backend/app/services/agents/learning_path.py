"""Learning Path agent: breaks a broad topic into an ordered curriculum and
re-orders it based on demonstrated mastery (go backward on weak prerequisites,
skip ahead when mastery is already high)."""
from app.services.providers.llm import LLMProvider

SCHEMA_HINT = '{"steps": ["..."]}'

CURATED_PATHS = {
    "machine learning": ["Python Fundamentals", "Mathematics for ML", "Data Processing", "Supervised Learning",
                          "Unsupervised Learning", "Model Evaluation", "Neural Networks", "Advanced ML"],
    "web development": ["HTML & CSS", "JavaScript Fundamentals", "DOM & Browser APIs", "A Frontend Framework",
                         "Backend & APIs", "Databases", "Authentication & Security", "Deployment"],
    "physics": ["Kinematics", "Forces & Newton's Laws", "Energy & Work", "Electricity & Circuits",
                "Waves", "Thermodynamics", "Modern Physics"],
}


def _fallback_steps(topic: str) -> list[str]:
    for key, steps in CURATED_PATHS.items():
        if key in topic.lower():
            return steps
    return [f"{topic}: Fundamentals", f"{topic}: Core Concepts", f"{topic}: Applications", f"{topic}: Advanced Topics"]


def build_learning_path(llm: LLMProvider, topic: str) -> list[dict]:
    steps = _fallback_steps(topic)
    if llm.is_live():
        system = "You are AUTOPSY's Learning Path agent. Break a broad topic into an ordered, prerequisite-aware curriculum."
        result = llm.structured_output(system, f"Topic: {topic}\nProduce 5-8 ordered steps.", SCHEMA_HINT, max_tokens=400)
        if result and result.get("steps"):
            steps = result["steps"]
    return [{"name": s, "status": "not_started", "mastery": 0.0} for s in steps]


def adapt_path(steps: list[dict], concept_mastery: dict[str, float]) -> list[dict]:
    for step in steps:
        mastery = concept_mastery.get(step["name"].lower())
        if mastery is None:
            continue
        step["mastery"] = mastery
        step["status"] = "mastered" if mastery >= 0.8 else ("in_progress" if mastery > 0 else "not_started")
    return steps
