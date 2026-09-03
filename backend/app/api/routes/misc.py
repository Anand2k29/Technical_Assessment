from fastapi import APIRouter

from app.core.config import settings
from app.schemas import TranslateRequest
from app.services.providers.llm import get_llm_provider
from app.services.providers.translator import get_translation_provider

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/system/status")
def system_status():
    llm = get_llm_provider()
    return {
        "app": settings.app_name, "demo_mode": settings.demo_mode, "llm_live": llm.is_live(),
        "model": settings.llm_model if llm.is_live() else None,
        "note": "LIVE AI is active." if llm.is_live() else "DEMO MODE: no LLM key configured. Teaching runs on real "
                                                             "rule-based agents (RAG, adaptive mastery, misconception "
                                                             "engine) instead of a live model. Add ANTHROPIC_API_KEY to backend/.env to switch to live LLM generation.",
    }


@router.post("/translate")
def translate(req: TranslateRequest):
    llm = get_llm_provider()
    return get_translation_provider().translate(req.text, req.target_language, llm)
