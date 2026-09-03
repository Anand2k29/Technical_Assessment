from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.db.session import get_db

router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress/{user_id}")
def get_progress(user_id: str, db: Session = Depends(get_db)):
    rows = db.query(models.ConceptMastery).filter(models.ConceptMastery.user_id == user_id).all()
    concepts = []
    for m in rows:
        c = db.get(models.Concept, m.concept_id)
        concepts.append({
            "concept": c.name if c else m.concept_id, "mastery": m.mastery, "confidence": m.confidence,
            "attempts": m.attempts, "prerequisite_status": m.prerequisite_status,
            "last_reviewed": m.last_reviewed.isoformat() if m.last_reviewed else None,
        })

    misconceptions = (
        db.query(models.Misconception).filter(models.Misconception.user_id == user_id)
        .order_by(models.Misconception.detected_at.desc()).limit(20).all()
    )
    return {
        "concept_mastery": sorted(concepts, key=lambda c: c["mastery"]),
        "misconceptions": [{"label": m.label, "description": m.description, "severity": m.severity, "resolved": m.resolved} for m in misconceptions],
    }


@router.get("/learning-path/{user_id}")
def get_learning_path(user_id: str, topic: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.LearningPath).filter(models.LearningPath.user_id == user_id)
    if topic:
        q = q.filter(models.LearningPath.topic == topic)
    paths = q.order_by(models.LearningPath.updated_at.desc()).all()
    return [{"id": p.id, "topic": p.topic, "steps": p.steps} for p in paths]


@router.get("/history/{user_id}")
def get_history(user_id: str, db: Session = Depends(get_db)):
    lessons = db.query(models.Lesson).filter(models.Lesson.user_id == user_id).order_by(models.Lesson.created_at.desc()).all()
    return [{"id": l.id, "title": l.title, "status": l.status, "difficulty": l.difficulty, "created_at": l.created_at.isoformat()} for l in lessons]
