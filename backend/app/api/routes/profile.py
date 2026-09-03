from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.db.session import get_db
from app.schemas import OnboardingRequest

router = APIRouter(prefix="/api", tags=["profile"])


@router.post("/onboarding")
def onboarding(req: OnboardingRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        user = models.User(email=req.email, name=req.name)
        db.add(user)
        db.flush()
        profile = models.LearnerProfile(user_id=user.id)
        db.add(profile)
    else:
        profile = db.query(models.LearnerProfile).filter(models.LearnerProfile.user_id == user.id).first()

    profile.level = req.level
    profile.language = req.language
    profile.teaching_style = req.teaching_style
    profile.goal = req.goal
    profile.prior_knowledge = req.prior_knowledge
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return _profile_out(user, profile)


@router.get("/profile/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return _profile_out(user, user.profile)


@router.get("/dashboard/{user_id}")
def dashboard(user_id: str, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    mastery_rows = db.query(models.ConceptMastery).filter(models.ConceptMastery.user_id == user_id).all()
    overall = round(sum(m.mastery for m in mastery_rows) / len(mastery_rows), 3) if mastery_rows else 0.0
    concepts_mastered = sum(1 for m in mastery_rows if m.mastery >= 0.8)
    weak = sorted([m for m in mastery_rows if m.mastery < 0.5], key=lambda m: m.mastery)[:5]
    weak_out = [{"concept": db.get(models.Concept, m.concept_id).name, "mastery": m.mastery} for m in weak]

    recent_assessments = (
        db.query(models.AssessmentResult).filter(models.AssessmentResult.user_id == user_id)
        .order_by(models.AssessmentResult.created_at.desc()).limit(5).all()
    )
    recent_lessons = (
        db.query(models.Lesson).filter(models.Lesson.user_id == user_id)
        .order_by(models.Lesson.created_at.desc()).limit(6).all()
    )
    in_progress = next((l for l in recent_lessons if l.status == "teaching"), None)
    path = db.query(models.LearningPath).filter(models.LearningPath.user_id == user_id).order_by(models.LearningPath.updated_at.desc()).first()

    return {
        "profile": _profile_out(user, user.profile),
        "progress": {"overall_mastery": overall, "concepts_mastered": concepts_mastered, "weak_concepts": weak_out},
        "recent_assessments": [
            {"score": a.score, "weak_areas": a.weak_areas, "recommended_next_topic": a.recommended_next_topic, "created_at": a.created_at.isoformat()}
            for a in recent_assessments
        ],
        "recent_lessons": [{"id": l.id, "title": l.title, "status": l.status, "difficulty": l.difficulty} for l in recent_lessons],
        "continue_learning": {"lesson_id": in_progress.id, "title": in_progress.title} if in_progress else None,
        "recommended_next": (path.steps[0]["name"] if path and path.steps else "Start your first lesson"),
        "streak_days": user.profile.streak_days if user.profile else 0,
    }


def _touch_streak(profile: models.LearnerProfile, db: Session) -> None:
    now = datetime.now(timezone.utc)
    if profile.last_active and (now - profile.last_active.replace(tzinfo=timezone.utc)).days == 1:
        profile.streak_days += 1
    elif not profile.last_active or (now - profile.last_active.replace(tzinfo=timezone.utc)).days > 1:
        profile.streak_days = 1
    profile.last_active = now
    db.commit()


def _profile_out(user: models.User, profile: models.LearnerProfile | None) -> dict:
    return {
        "user_id": user.id, "name": user.name, "email": user.email,
        "level": profile.level if profile else "beginner",
        "language": profile.language if profile else "English",
        "teaching_style": profile.teaching_style if profile else "balanced",
        "goal": profile.goal if profile else "",
        "prior_knowledge": profile.prior_knowledge if profile else "",
        "streak_days": profile.streak_days if profile else 0,
    }
