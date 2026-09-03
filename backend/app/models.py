"""SQLAlchemy models for every entity in the AUTOPSY data model (see docs/architecture.md)."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _id() -> str:
    return uuid.uuid4().hex[:16]


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    email: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    profile: Mapped["LearnerProfile"] = relationship(back_populates="user", uselist=False)


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True)
    level: Mapped[str] = mapped_column(String, default="beginner")  # beginner/intermediate/advanced
    language: Mapped[str] = mapped_column(String, default="English")
    teaching_style: Mapped[str] = mapped_column(String, default="balanced")  # simple/analogy/example-heavy/socratic
    goal: Mapped[str] = mapped_column(Text, default="")
    prior_knowledge: Mapped[str] = mapped_column(Text, default="")
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_active: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    user: Mapped["User"] = relationship(back_populates="profile")


class Document(Base):
    __tablename__ = "documents"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    filename: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="uploaded")  # uploaded/processing/ready/failed
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    structure: Mapped[dict] = mapped_column(JSON, default=dict)  # detected chapters/sections
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    chapter: Mapped[str | None] = mapped_column(String, nullable=True)
    section: Mapped[str | None] = mapped_column(String, nullable=True)
    heading: Mapped[str | None] = mapped_column(String, nullable=True)
    page: Mapped[int | None] = mapped_column(Integer, nullable=True)


class Topic(Base):
    __tablename__ = "topics"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    document_id: Mapped[str | None] = mapped_column(ForeignKey("documents.id"), nullable=True)


class Concept(Base):
    __tablename__ = "concepts"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    topic_id: Mapped[str | None] = mapped_column(ForeignKey("topics.id"), nullable=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    prerequisites: Mapped[list] = mapped_column(JSON, default=list)  # list of concept names


class Lesson(Base):
    __tablename__ = "lessons"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    topic_id: Mapped[str | None] = mapped_column(ForeignKey("topics.id"), nullable=True)
    document_id: Mapped[str | None] = mapped_column(ForeignKey("documents.id"), nullable=True)
    title: Mapped[str] = mapped_column(String)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=20)
    difficulty: Mapped[str] = mapped_column(String, default="beginner")
    language: Mapped[str] = mapped_column(String, default="English")
    teaching_style: Mapped[str] = mapped_column(String, default="balanced")
    objectives: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String, default="planned")  # planned/teaching/completed
    grounded: Mapped[bool] = mapped_column(Boolean, default=False)  # True if built from uploaded material (RAG)
    current_section_index: Mapped[int] = mapped_column(Integer, default=0)
    teaching_state: Mapped[dict] = mapped_column(JSON, default=dict)  # current TeachingAgent state
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class LessonSection(Base):
    __tablename__ = "lesson_sections"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    concept_id: Mapped[str | None] = mapped_column(ForeignKey("concepts.id"), nullable=True)
    title: Mapped[str] = mapped_column(String)
    script: Mapped[str] = mapped_column(Text)  # what the teacher says
    examples: Mapped[list] = mapped_column(JSON, default=list)
    visual_spec: Mapped[dict] = mapped_column(JSON, default=dict)  # Visual Planner output
    source_refs: Mapped[list] = mapped_column(JSON, default=list)  # [{document, chapter, page}]


class Question(Base):
    __tablename__ = "questions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    lesson_id: Mapped[str | None] = mapped_column(ForeignKey("lessons.id"), nullable=True)
    concept_id: Mapped[str | None] = mapped_column(ForeignKey("concepts.id"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String, default="conceptual")  # mcq/conceptual/short_answer/application
    options: Mapped[list] = mapped_column(JSON, default=list)
    correct_answer: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[str] = mapped_column(String, default="beginner")
    is_assessment: Mapped[bool] = mapped_column(Boolean, default=False)
    misconception_map: Mapped[dict] = mapped_column(JSON, default=dict)  # optional curated wrong-answer -> diagnosis (sample content)


class Misconception(Base):
    __tablename__ = "misconceptions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    concept_id: Mapped[str | None] = mapped_column(ForeignKey("concepts.id"), nullable=True)
    label: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String, default="medium")  # low/medium/high
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)


class StudentResponse(Base):
    __tablename__ = "student_responses"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[str | None] = mapped_column(ForeignKey("lessons.id"), nullable=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"))
    response_text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    misconception_id: Mapped[str | None] = mapped_column(ForeignKey("misconceptions.id"), nullable=True)
    feedback: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class ConceptMastery(Base):
    __tablename__ = "concept_mastery"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    concept_id: Mapped[str] = mapped_column(ForeignKey("concepts.id"))
    mastery: Mapped[float] = mapped_column(Float, default=0.0)  # 0..1
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_reviewed: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    prerequisite_status: Mapped[str] = mapped_column(String, default="unknown")  # met/weak/unknown


class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    question_ids: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    score: Mapped[float] = mapped_column(Float)
    strong_areas: Mapped[list] = mapped_column(JSON, default=list)
    weak_areas: Mapped[list] = mapped_column(JSON, default=list)
    misconceptions: Mapped[list] = mapped_column(JSON, default=list)
    recommended_revision: Mapped[list] = mapped_column(JSON, default=list)
    recommended_next_topic: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class LearningPath(Base):
    __tablename__ = "learning_paths"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    topic: Mapped[str] = mapped_column(String)
    steps: Mapped[list] = mapped_column(JSON, default=list)  # [{name, status, mastery}]
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)


class LearningEvent(Base):
    __tablename__ = "learning_events"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    event_type: Mapped[str] = mapped_column(String)  # lesson_started, question_answered, misconception_detected, ...
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
