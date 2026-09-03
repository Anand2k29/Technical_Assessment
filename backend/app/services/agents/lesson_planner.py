"""Lesson Planner agent: turns (topic, retrieved knowledge, learner profile,
time budget) into a structured lesson object. Section count & depth scale with
duration_minutes exactly as described in the product spec (5m essentials-only,
20m concepts+examples+interaction, 60m deep, 1440m+ multi-day plan)."""
from app.services.agents.concepts import extract_key_terms, summarize_sentences
from app.services.agents.visual_planner import plan_visual
from app.services.providers.llm import LLMProvider
from app.services.rag.retriever import GroundedContext

SCHEMA_HINT = """{
  "objectives": ["..."],
  "concepts": ["..."],
  "lesson_sections": [{"title": "...", "script": "...", "examples": ["..."]}]
}"""


def _duration_bucket(minutes: int) -> str:
    if minutes >= 1440:
        return "multi_day"
    if minutes <= 7:
        return "essentials"
    if minutes <= 25:
        return "standard"
    return "deep"


def _section_count(bucket: str, available: int) -> int:
    return max(1, min({"essentials": 1, "standard": 4, "deep": 7}.get(bucket, 4), available))


def _chunk_for_concept(context: GroundedContext | None, concept: str) -> tuple[str, list[dict]]:
    if not context:
        return "", []
    for c in context.chunks:
        if concept in c.text.lower():
            return c.text, [{"document": c.metadata.get("document_title"), "chapter": c.metadata.get("chapter"), "page": c.metadata.get("page")}]
    if context.chunks:
        c = context.chunks[0]
        return c.text, [{"document": c.metadata.get("document_title"), "chapter": c.metadata.get("chapter"), "page": c.metadata.get("page")}]
    return "", []


def _fallback_plan(topic: str, profile: dict, context: GroundedContext | None, duration_minutes: int) -> dict:
    bucket = _duration_bucket(duration_minutes)
    # Raw chunk text only -- as_prompt_context() prefixes every chunk with its
    # "[Source: <chapter>]" citation, which would otherwise repeat the chapter
    # title into the pool and get extracted as a fake "concept".
    pool_text = " ".join(c.text for c in context.chunks) if context and context.chunks else topic
    concepts = extract_key_terms(pool_text, top_n=8) or [topic.lower()]
    n = _section_count(bucket, len(concepts))
    chosen = concepts[:n] if len(concepts) >= n else (concepts + [topic.lower()] * n)[:n]

    sections = []
    for concept in chosen:
        source_text, refs = _chunk_for_concept(context, concept)
        script = summarize_sentences(source_text) if source_text else (
            f"{concept.capitalize()} is a key idea in {topic}. Let's break it down with a simple, "
            f"real-world way of thinking about it before we look at an example."
        )
        sections.append({
            "title": concept.capitalize(),
            "concept": concept,
            "script": script,
            "examples": [f"Think of {concept} like a everyday situation you already know — we'll connect the dots with an example."],
            "visual_spec": plan_visual(concept, topic),
            "source_refs": refs,
        })

    return {
        "topic": topic,
        "duration_minutes": duration_minutes,
        "difficulty": profile.get("level", "beginner"),
        "language": profile.get("language", "English"),
        "objectives": [f"Understand {c}" for c in chosen],
        "concepts": chosen,
        "lesson_sections": sections,
        "grounded": bool(context and context.chunks),
    }


def plan_from_sample(sample: dict, profile: dict, duration_minutes: int) -> dict:
    """Build a lesson plan straight from curated sample content (see
    app/data/sample_content.py) using its explicit concept list, instead of
    re-deriving concepts via generic keyword extraction -- this keeps the
    concept names aligned with the sample's misconception-mapped questions."""
    bucket = _duration_bucket(duration_minutes)
    all_concepts = sample["concepts"]
    n = _section_count(bucket, len(all_concepts))
    chosen = all_concepts[:n]

    sections = []
    for c in chosen:
        chapter = next((ch for ch in sample["chapters"] if c["name"] in ch["text"].lower()), sample["chapters"][0])
        sections.append({
            "title": c["name"].capitalize(), "concept": c["name"], "script": c["description"] + " " + chapter["text"][:280],
            "examples": [f"Think of {c['name']} like a everyday situation you already know — we'll connect the dots with an example."],
            "visual_spec": plan_visual(c["name"], sample["topic"], chapter["text"]),
            "source_refs": [{"document": sample["title"], "chapter": chapter["chapter"], "page": None}],
        })

    return {
        "topic": sample["topic"], "duration_minutes": duration_minutes, "difficulty": profile.get("level", "beginner"),
        "language": profile.get("language", "English"), "objectives": [f"Understand {c['name']}" for c in chosen],
        "concepts": [c["name"] for c in chosen], "lesson_sections": sections, "grounded": True,
    }


def plan_lesson(llm: LLMProvider, topic: str, profile: dict, context: GroundedContext | None, duration_minutes: int) -> dict:
    fallback = _fallback_plan(topic, profile, context, duration_minutes)
    if not llm.is_live():
        return fallback

    system = (
        "You are AUTOPSY's Lesson Planner agent. You design structured, grounded lesson plans "
        "for a personalized AI teacher. Only use facts present in the provided context when it is given; "
        "never invent facts about the source material."
    )
    prompt = (
        f"Topic: {topic}\nLearner level: {profile.get('level')}\nGoal: {profile.get('goal')}\n"
        f"Time budget: {duration_minutes} minutes\nTeaching style: {profile.get('teaching_style')}\n\n"
        f"Retrieved context (may be empty if teaching from general knowledge):\n{context.as_prompt_context() if context else '(none)'}\n\n"
        f"Design {_section_count(_duration_bucket(duration_minutes), 8)} lesson sections scaled to the time budget."
    )
    result = llm.structured_output(system, prompt, SCHEMA_HINT, max_tokens=2000)
    if not result or "lesson_sections" not in result:
        return fallback

    for i, sec in enumerate(result.get("lesson_sections", [])):
        sec.setdefault("concept", (result.get("concepts") or [topic])[min(i, len(result.get("concepts", [topic])) - 1)])
        sec.setdefault("visual_spec", plan_visual(sec.get("concept", topic), topic))
        sec.setdefault("source_refs", fallback["lesson_sections"][min(i, len(fallback["lesson_sections"]) - 1)]["source_refs"] if fallback["lesson_sections"] else [])

    result.setdefault("topic", topic)
    result.setdefault("duration_minutes", duration_minutes)
    result.setdefault("difficulty", profile.get("level", "beginner"))
    result.setdefault("language", profile.get("language", "English"))
    result["grounded"] = bool(context and context.chunks)
    return result
