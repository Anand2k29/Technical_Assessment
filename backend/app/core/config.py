"""Central settings. All secrets come from env vars; nothing is hardcoded."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")

    app_name: str = "AUTOPSY"
    database_url: str = f"sqlite:///{BASE_DIR / 'storage' / 'autopsy.db'}"
    upload_dir: Path = BASE_DIR / "storage" / "uploads"
    vector_dir: Path = BASE_DIR / "storage" / "vectors"
    max_upload_mb: int = 25
    allowed_upload_ext: tuple[str, ...] = (".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt")

    # LLM provider: if ANTHROPIC_API_KEY is unset, the app runs in DEMO MODE
    # (deterministic templated reasoning) instead of pretending to call a live model.
    anthropic_api_key: str | None = None
    llm_model: str = "claude-sonnet-4-5"

    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def demo_mode(self) -> bool:
        return not bool(self.anthropic_api_key)


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.vector_dir.mkdir(parents=True, exist_ok=True)
