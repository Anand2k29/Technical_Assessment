"""LLMProvider abstraction. Swappable backend: real Claude API when a key is
configured, otherwise every agent that consumes this falls back to its own
deterministic reasoning (see each agent's `_fallback` method) so the app never
fakes a "live AI" result while claiming one — it degrades to a clearly-labeled
DEMO MODE instead (see /api/system/status)."""
import json
import logging
from abc import ABC, abstractmethod

from app.core.config import settings

logger = logging.getLogger("autopsy.llm")


class LLMProvider(ABC):
    @abstractmethod
    def is_live(self) -> bool: ...

    @abstractmethod
    def generate(self, system: str, prompt: str, max_tokens: int = 1024) -> str: ...

    def structured_output(self, system: str, prompt: str, schema_hint: str, max_tokens: int = 1024) -> dict | None:
        """Ask the model for JSON matching schema_hint; return None on any failure
        so callers can fall back rather than crash or show a raw error."""
        full_prompt = f"{prompt}\n\nRespond with ONLY valid JSON matching this shape:\n{schema_hint}"
        try:
            raw = self.generate(system, full_prompt, max_tokens=max_tokens)
            start, end = raw.find("{"), raw.rfind("}")
            if start == -1 or end == -1:
                return None
            return json.loads(raw[start:end + 1])
        except Exception as exc:  # LLM timeout / malformed JSON / rate limit
            logger.warning("structured_output failed, caller will use fallback: %s", exc)
            return None


class AnthropicLLMProvider(LLMProvider):
    def __init__(self, api_key: str, model: str):
        import anthropic
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model

    def is_live(self) -> bool:
        return True

    def generate(self, system: str, prompt: str, max_tokens: int = 1024) -> str:
        resp = self._client.messages.create(
            model=self._model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(block.text for block in resp.content if block.type == "text")


class DemoLLMProvider(LLMProvider):
    """No network calls. Used automatically whenever no API key is configured."""

    def is_live(self) -> bool:
        return False

    def generate(self, system: str, prompt: str, max_tokens: int = 1024) -> str:
        raise RuntimeError("DemoLLMProvider cannot generate free text; callers must use their rule-based fallback")


def get_llm_provider() -> LLMProvider:
    if settings.anthropic_api_key:
        try:
            return AnthropicLLMProvider(settings.anthropic_api_key, settings.llm_model)
        except Exception as exc:
            logger.error("Failed to init Anthropic provider, falling back to demo mode: %s", exc)
    return DemoLLMProvider()
