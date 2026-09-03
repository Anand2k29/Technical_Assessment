from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.db.session import get_db
from app.schemas import AssessmentSubmitRequest
from app.services.agents.assessment_agent import build_assessment, score_assessment
from app.services.agents.learning_path import build_learning_path, adapt_path
from app.services.agents.response_evaluator import evaluate_response
from app.services.db_helpers import get_or_create_mastery
from app.services.providers.llm import get_llm_provider

router = APIRouter(prefix="/api/assessment", tags=["assessment"])


@router.post("/{lesson_id}/generate")
def generate_assessment(lesson_id: str, user_id: str, db: Session = Depends(get_db)):
    lesson = db.get(models.Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    sections = db.query(models.LessonSection).filter(models.LessonSection.lesson_id == lesson_id).order_by(models.LessonSection.order_index).all()
    if not sections:
        raise HTTPException(409, "Lesson has no sections")

    concepts = [db.get(models.Concept, s.concept_id).name if s.concept_id else s.title for s in sections]
    concept_context = {(db.get(models.Concept, s.concept_id).name if s.concept_id else s.title): s.script for s in sections}
    llm = get_llm_provider()
    questions_data = build_assessment(llm, lesson.title, concepts, concept_context, lesson.difficulty)

    concept_by_name = {db.get(models.Concept, s.concept_id).name: s.concept_id for s in sections if s.concept_id}
    assessment = models.Assessment(lesson_id=lesson_id, user_id=user_id)
    db.add(assessment)
    db.flush()

    out_questions, question_ids = [], []
    for qd in questions_data:
        q = models.Question(
            lesson_id=lesson_id, concept_id=concept_by_name.get(qd["concept"]), text=qd["text"], type=qd.get("type", "mcq"),
            options=qd.get("options", []), correct_answer=qd["correct_answer"], difficulty=lesson.difficulty, is_assessment=True,
        )
        db.add(q)
        db.flush()
        question_ids.append(q.id)
        out_questions.append({"id": q.id, "text": q.text, "type": q.type, "options": q.options})

    # Reassign (not in-place append) so SQLAlchemy's change tracking sees this
    # JSON column as dirty -- appending to the existing list object silently
    # would not persist without Mutable-tracked JSON.
    assessment.question_ids = question_ids
    db.commit()
    return {"assessment_id": assessment.id, "lesson_id": lesson_id, "questions": out_questions}


@router.post("/{assessment_id}/submit")
def submit_assessment(assessment_id: str, req: AssessmentSubmitRequest, db: Session = Depends(get_db)):
    assessment = db.get(models.Assessment, assessment_id)
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    lesson = db.get(models.Lesson, assessment.lesson_id)
    llm = get_llm_provider()

    results, misconceptions_seen = [], []
    prior = db.query(models.Misconception).filter(models.Misconception.user_id == req.user_id).all()
    misconceptions_seen.extend({m.label for m in prior})

    for r in req.responses:
        question = db.get(models.Question, r["question_id"])
        if not question or question.id not in assessment.question_ids:
            continue
        concept = db.get(models.Concept, question.concept_id) if question.concept_id else None
        q_dict = {"text": question.text, "type": question.type, "correct_answer": question.correct_answer,
                  "concept": concept.name if concept else lesson.title}
        evaluation = evaluate_response(llm, q_dict, r.get("response_text", ""))
        results.append({"concept": q_dict["concept"], "correct": evaluation["correct"]})

        db.add(models.StudentResponse(
            user_id=req.user_id, lesson_id=lesson.id, question_id=question.id, response_text=r.get("response_text", ""),
            is_correct=evaluation["correct"], confidence=evaluation.get("confidence", 0.0), feedback=evaluation,
        ))
        if question.concept_id:
            mastery_row = get_or_create_mastery(db, req.user_id, question.concept_id)
            if evaluation["correct"]:
                mastery_row.mastery = round(min(1.0, mastery_row.mastery + 0.1), 3)
            mastery_row.attempts += 1

    report = score_assessment(results, sorted(misconceptions_seen), lesson.title)
    result_row = models.AssessmentResult(
        assessment_id=assessment_id, user_id=req.user_id, score=report["score"], strong_areas=report["strong_areas"],
        weak_areas=report["weak_areas"], misconceptions=report["misconceptions"], recommended_revision=report["recommended_revision"],
        recommended_next_topic=report["recommended_next_topic"],
    )
    db.add(result_row)

    mastery_map = {}
    for m in db.query(models.ConceptMastery).filter(models.ConceptMastery.user_id == req.user_id).all():
        c = db.get(models.Concept, m.concept_id)
        if c:
            mastery_map[c.name] = m.mastery
    path = db.query(models.LearningPath).filter(models.LearningPath.user_id == req.user_id, models.LearningPath.topic == lesson.title).first()
    if not path:
        path = models.LearningPath(user_id=req.user_id, topic=lesson.title, steps=build_learning_path(llm, lesson.title))
        db.add(path)
    path.steps = adapt_path(path.steps, mastery_map)

    lesson.status = "completed"
    db.add(models.LearningEvent(user_id=req.user_id, event_type="assessment_completed", payload=report))
    db.commit()

    return {"assessment_id": assessment_id, **report, "learning_path": path.steps}


@router.get("/{assessment_id}/result")
def get_result(assessment_id: str, db: Session = Depends(get_db)):
    result = (
        db.query(models.AssessmentResult).filter(models.AssessmentResult.assessment_id == assessment_id)
        .order_by(models.AssessmentResult.created_at.desc()).first()
    )
    if not result:
        raise HTTPException(404, "No result yet for this assessment")
    return {
        "score": result.score, "strong_areas": result.strong_areas, "weak_areas": result.weak_areas,
        "misconceptions": result.misconceptions, "recommended_revision": result.recommended_revision,
        "recommended_next_topic": result.recommended_next_topic,
    }
