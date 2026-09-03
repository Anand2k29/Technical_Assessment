from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.db.session import get_db
from app.schemas import AnswerRequest
from app.services.agents import teaching_agent
from app.services.agents.misconception_engine import detect_misconception
from app.services.agents.response_evaluator import evaluate_response
from app.services.db_helpers import get_or_create_mastery
from app.services.providers.llm import get_llm_provider

router = APIRouter(prefix="/api/teaching", tags=["teaching"])


def _section_payload(section: models.LessonSection) -> dict:
    return {
        "id": section.id, "order_index": section.order_index, "title": section.title, "script": section.script,
        "examples": section.examples, "visual_spec": section.visual_spec, "source_refs": section.source_refs,
    }


def _sections(db: Session, lesson_id: str) -> list[models.LessonSection]:
    return db.query(models.LessonSection).filter(models.LessonSection.lesson_id == lesson_id).order_by(models.LessonSection.order_index).all()


def _current_question(db: Session, section: models.LessonSection) -> models.Question:
    return (
        db.query(models.Question)
        .filter(models.Question.lesson_id == section.lesson_id, models.Question.concept_id == section.concept_id, models.Question.is_assessment == False)  # noqa: E712
        .first()
    )


@router.post("/{lesson_id}/start")
def start_teaching(lesson_id: str, db: Session = Depends(get_db)):
    lesson = db.get(models.Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    sections = _sections(db, lesson_id)
    if not sections:
        raise HTTPException(409, "Lesson has no sections")

    lesson.status = "teaching"
    lesson.current_section_index = 0
    first = sections[0]
    state = teaching_agent.TeachingState(current_concept=db.get(models.Concept, first.concept_id).name if first.concept_id else first.title)
    lesson.teaching_state = state.to_dict()
    db.commit()

    question = _current_question(db, first)
    return {
        "lesson_id": lesson.id, "ui_state": "TEACHING", "state": lesson.teaching_state,
        "section": _section_payload(first),
        "question": {"id": question.id, "text": question.text, "type": question.type, "options": question.options} if question else None,
    }


@router.get("/{lesson_id}/current")
def current_state(lesson_id: str, db: Session = Depends(get_db)):
    lesson = db.get(models.Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    sections = _sections(db, lesson_id)
    if lesson.current_section_index >= len(sections):
        return {"lesson_id": lesson.id, "ui_state": "COMPLETED", "state": lesson.teaching_state}
    section = sections[lesson.current_section_index]
    question = _current_question(db, section)
    return {
        "lesson_id": lesson.id, "ui_state": "TEACHING", "state": lesson.teaching_state,
        "section": _section_payload(section),
        "question": {"id": question.id, "text": question.text, "type": question.type, "options": question.options} if question else None,
    }


@router.post("/{lesson_id}/answer")
def submit_answer(lesson_id: str, req: AnswerRequest, db: Session = Depends(get_db)):
    lesson = db.get(models.Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    question = db.get(models.Question, req.question_id)
    if not question or question.lesson_id != lesson_id:
        raise HTTPException(404, "Question not found for this lesson")

    llm = get_llm_provider()
    q_dict = {
        "text": question.text, "type": question.type, "correct_answer": question.correct_answer,
        "options": question.options, "concept": db.get(models.Concept, question.concept_id).name if question.concept_id else lesson.title,
        "misconception_map": question.misconception_map,
    }
    evaluation = evaluate_response(llm, q_dict, req.response_text)

    state = lesson.teaching_state or {}
    attempts_this_question = state.get("attempts", 0)
    misconception = None
    if not evaluation["correct"]:
        misconception = detect_misconception(llm, q_dict, req.response_text, evaluation, attempts_this_question, history=state.get("misconceptions", []))

    new_state = teaching_agent.advance(state, evaluation, misconception)
    lesson.teaching_state = new_state

    response = models.StudentResponse(
        user_id=req.user_id, lesson_id=lesson_id, question_id=question.id, response_text=req.response_text,
        is_correct=evaluation["correct"], confidence=evaluation.get("confidence", 0.0), feedback=evaluation,
    )
    db.add(response)

    if question.concept_id:
        mastery_row = get_or_create_mastery(db, req.user_id, question.concept_id)
        mastery_row.mastery = new_state["mastery"]
        mastery_row.attempts += 1
        mastery_row.confidence = evaluation.get("confidence", mastery_row.confidence)
        mastery_row.prerequisite_status = "met" if new_state["mastery"] >= 0.5 else "weak"
        from datetime import datetime, timezone
        mastery_row.last_reviewed = datetime.now(timezone.utc)

        if misconception:
            m_row = models.Misconception(
                user_id=req.user_id, concept_id=question.concept_id, label=misconception["misconception"],
                description=misconception.get("description", ""), severity=misconception.get("severity", "medium"),
            )
            db.add(m_row)
            db.flush()
            response.misconception_id = m_row.id

    db.add(models.LearningEvent(
        user_id=req.user_id, event_type="question_answered",
        payload={"lesson_id": lesson_id, "question_id": question.id, "correct": evaluation["correct"], "next_action": new_state["next_action"]},
    ))

    result: dict = {"correct": evaluation["correct"], "evaluation": evaluation, "misconception": misconception, "state": new_state}

    if not evaluation["correct"]:
        result["ui_state"] = "RE_EXPLAINING"
        result["reexplain"] = misconception.get("reexplain") if misconception else "Let's look at this again."
        result["retry_question"] = {"id": question.id, "text": question.text, "type": question.type, "options": question.options}
        lesson.teaching_state = {**new_state, "attempts": attempts_this_question + 1}
    else:
        sections = _sections(db, lesson_id)
        lesson.current_section_index += 1
        if lesson.current_section_index >= len(sections):
            lesson.status = "ready_for_assessment"
            result["ui_state"] = "COMPLETED"
        else:
            next_section = sections[lesson.current_section_index]
            next_q = _current_question(db, next_section)
            fresh_state = teaching_agent.TeachingState(
                current_concept=db.get(models.Concept, next_section.concept_id).name if next_section.concept_id else next_section.title,
                mastery=new_state["mastery"], difficulty=new_state["difficulty"], misconceptions=new_state["misconceptions"],
            ).to_dict()
            lesson.teaching_state = fresh_state
            result["state"] = fresh_state
            result["ui_state"] = "TEACHING"
            result["next_section"] = _section_payload(next_section)
            result["next_question"] = {"id": next_q.id, "text": next_q.text, "type": next_q.type, "options": next_q.options} if next_q else None

    db.commit()
    return result
