from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.data.sample_content import SAMPLE_TOPICS
from app.db.session import get_db
from app.schemas import LessonPlanRequest
from app.services.agents.lesson_planner import plan_lesson, plan_from_sample
from app.services.agents.question_generator import generate_question
from app.services.db_helpers import get_or_create_concept
from app.services.providers.llm import get_llm_provider
from app.services.rag.retriever import retrieve, GroundedContext, RetrievedChunk

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


def _sample_context(sample: dict) -> GroundedContext:
    chunks = [
        RetrievedChunk(chunk_id=f"sample-{i}", text=c["text"], score=1.0,
                        metadata={"document_title": sample["title"], "chapter": c["chapter"], "section": c.get("section")})
        for i, c in enumerate(sample["chapters"])
    ]
    return GroundedContext(chunks=chunks)


@router.post("/plan")
def create_lesson_plan(req: LessonPlanRequest, db: Session = Depends(get_db)):
    user = db.get(models.User, req.user_id)
    if not user or not user.profile:
        raise HTTPException(404, "Unknown user_id / profile not set up")
    profile = {
        "level": req.level or user.profile.level,
        "language": req.language or user.profile.language,
        "teaching_style": req.teaching_style or user.profile.teaching_style,
        "goal": user.profile.goal,
    }

    document_id, sample = None, None
    if req.sample_topic_id:
        sample = SAMPLE_TOPICS.get(req.sample_topic_id)
        if not sample:
            raise HTTPException(404, "Unknown sample_topic_id")
        topic, context = sample["topic"], _sample_context(sample)
    elif req.document_id:
        document = db.get(models.Document, req.document_id)
        if not document or document.user_id != req.user_id:
            raise HTTPException(404, "Document not found")
        if document.status != "ready":
            raise HTTPException(409, f"Document is not ready yet (status={document.status})")
        document_id = document.id
        topic = req.topic or document.title
        context = retrieve(req.user_id, topic, top_k=6, document_id=document_id)
    elif req.topic:
        topic, context = req.topic, retrieve(req.user_id, req.topic, top_k=6)
        if not context.chunks:
            context = None  # teach from general knowledge, ungrounded
    else:
        raise HTTPException(400, "Provide one of: topic, document_id, sample_topic_id")

    llm = get_llm_provider()
    plan = plan_from_sample(sample, profile, req.duration_minutes) if sample else plan_lesson(llm, topic, profile, context, req.duration_minutes)

    topic_row = models.Topic(name=topic, document_id=document_id)
    db.add(topic_row)
    db.flush()

    lesson = models.Lesson(
        user_id=req.user_id, topic_id=topic_row.id, document_id=document_id, title=topic,
        duration_minutes=req.duration_minutes, difficulty=plan["difficulty"], language=profile["language"],
        teaching_style=profile["teaching_style"], objectives=plan.get("objectives", []), grounded=plan.get("grounded", False),
    )
    db.add(lesson)
    db.flush()

    sample_questions_by_concept = {}
    if sample:
        for q in sample["questions"]:
            sample_questions_by_concept.setdefault(q["concept"], []).append(q)

    sections_out = []
    for idx, sec in enumerate(plan["lesson_sections"]):
        concept_name = sec.get("concept", topic)
        concept = get_or_create_concept(db, topic_row.id, concept_name)
        section = models.LessonSection(
            lesson_id=lesson.id, order_index=idx, concept_id=concept.id, title=sec["title"],
            script=sec["script"], examples=sec.get("examples", []), visual_spec=sec.get("visual_spec", {}),
            source_refs=sec.get("source_refs", []),
        )
        db.add(section)
        db.flush()

        pool = sample_questions_by_concept.get(concept.name)
        if pool:
            qdata = pool[0]
        else:
            others = [s.get("concept", topic) for s in plan["lesson_sections"] if s.get("concept") != concept_name]
            qdata = generate_question(llm, concept.name, topic, sec["script"], others, difficulty=plan["difficulty"], qtype="mcq")

        question = models.Question(
            lesson_id=lesson.id, concept_id=concept.id, text=qdata["text"], type=qdata.get("type", "mcq"),
            options=qdata.get("options", []), correct_answer=qdata["correct_answer"], difficulty=qdata.get("difficulty", plan["difficulty"]),
            misconception_map=qdata.get("misconception_map", {}),
        )
        db.add(question)
        db.flush()

        sections_out.append({
            "id": section.id, "order_index": idx, "title": section.title, "concept": concept.name,
            "script": section.script, "examples": section.examples, "visual_spec": section.visual_spec,
            "source_refs": section.source_refs,
            "checkpoint_question": {"id": question.id, "text": question.text, "type": question.type, "options": question.options},
        })

    db.commit()

    return {
        "lesson_id": lesson.id, "topic": topic, "duration_minutes": lesson.duration_minutes,
        "difficulty": lesson.difficulty, "language": lesson.language, "grounded": lesson.grounded,
        "objectives": lesson.objectives, "sections": sections_out, "llm_live": llm.is_live(),
    }


@router.get("/{lesson_id}")
def get_lesson(lesson_id: str, db: Session = Depends(get_db)):
    lesson = db.get(models.Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    sections = db.query(models.LessonSection).filter(models.LessonSection.lesson_id == lesson_id).order_by(models.LessonSection.order_index).all()
    return {
        "lesson_id": lesson.id, "title": lesson.title, "status": lesson.status, "difficulty": lesson.difficulty,
        "language": lesson.language, "objectives": lesson.objectives, "grounded": lesson.grounded,
        "current_section_index": lesson.current_section_index, "teaching_state": lesson.teaching_state,
        "sections": [{"id": s.id, "title": s.title, "order_index": s.order_index} for s in sections],
    }
