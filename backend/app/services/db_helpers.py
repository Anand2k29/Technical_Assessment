from sqlalchemy.orm import Session
from app import models


def get_or_create_concept(db: Session, topic_id: str | None, name: str) -> models.Concept:
    name = name.strip().lower()
    existing = (
        db.query(models.Concept)
        .filter(models.Concept.topic_id == topic_id, models.Concept.name == name)
        .first()
    )
    if existing:
        return existing
    concept = models.Concept(topic_id=topic_id, name=name)
    db.add(concept)
    db.flush()
    return concept


def get_or_create_mastery(db: Session, user_id: str, concept_id: str) -> models.ConceptMastery:
    existing = (
        db.query(models.ConceptMastery)
        .filter(models.ConceptMastery.user_id == user_id, models.ConceptMastery.concept_id == concept_id)
        .first()
    )
    if existing:
        return existing
    mastery = models.ConceptMastery(user_id=user_id, concept_id=concept_id)
    db.add(mastery)
    db.flush()
    return mastery
