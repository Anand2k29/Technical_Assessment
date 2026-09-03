from pydantic import BaseModel, EmailStr


class OnboardingRequest(BaseModel):
    email: EmailStr
    name: str
    level: str = "beginner"
    language: str = "English"
    teaching_style: str = "balanced"
    goal: str = ""
    prior_knowledge: str = ""


class LessonPlanRequest(BaseModel):
    user_id: str
    topic: str | None = None
    document_id: str | None = None
    sample_topic_id: str | None = None
    duration_minutes: int = 20
    level: str | None = None
    language: str | None = None
    teaching_style: str | None = None


class AnswerRequest(BaseModel):
    user_id: str
    question_id: str
    response_text: str


class AssessmentSubmitRequest(BaseModel):
    user_id: str
    responses: list[dict]  # [{question_id, response_text}]


class TranslateRequest(BaseModel):
    text: str
    target_language: str
