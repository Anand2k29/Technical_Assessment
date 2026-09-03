"""Assessment agent: builds the end-of-lesson assessment and scores it into a
learning report (strong/weak areas, misconceptions, revision + next-topic
recommendation)."""
from app.services.agents.question_generator import generate_question
from app.services.providers.llm import LLMProvider


def build_assessment(llm: LLMProvider, topic: str, concepts: list[str], concept_context: dict[str, str], difficulty: str) -> list[dict]:
    """concept_context maps each concept name to ITS OWN section text -- using one
    shared blob for every concept would leak another concept's sentence into this
    one's correct_answer/distractors (summarize_sentences always grabs the same
    leading sentence regardless of which concept is being asked about)."""
    questions = []
    for i, concept in enumerate(concepts):
        qtype = "mcq" if i % 2 == 0 else "conceptual"
        q = generate_question(llm, concept, topic, concept_context.get(concept, ""), concepts, difficulty=difficulty, qtype=qtype)
        q["concept"] = concept
        q["is_assessment"] = True
        questions.append(q)
    return questions


def score_assessment(results: list[dict], misconceptions_seen: list[str], topic: str) -> dict:
    """results: [{concept, correct}]"""
    if not results:
        return {"score": 0.0, "strong_areas": [], "weak_areas": [], "misconceptions": misconceptions_seen,
                "recommended_revision": [], "recommended_next_topic": topic}

    by_concept: dict[str, list[bool]] = {}
    for r in results:
        by_concept.setdefault(r["concept"], []).append(r["correct"])

    strong, weak = [], []
    for concept, outcomes in by_concept.items():
        rate = sum(outcomes) / len(outcomes)
        (strong if rate >= 0.7 else weak).append(concept)

    score = round(100 * sum(r["correct"] for r in results) / len(results), 1)
    next_topic = f"Deeper applications of {topic}" if not weak else f"Revisit: {weak[0]}"

    return {
        "score": score, "strong_areas": strong, "weak_areas": weak, "misconceptions": misconceptions_seen,
        "recommended_revision": weak, "recommended_next_topic": next_topic,
    }
