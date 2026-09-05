"""Central settings. All secrets come from env vars; nothing is hardcoded."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
_on_vercel = bool(os.environ.get("VERCEL"))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")

    app_name: str = "AUTOPSY"

    # Vercel Postgres — set POSTGRES_URL for Postgres, leave blank for local SQLite
    postgres_url: str | None = None

    upload_dir: Path = Path("/tmp/uploads") if _on_vercel else BASE_DIR / "storage" / "uploads"
    vector_dir: Path = Path("/tmp/vectors") if _on_vercel else BASE_DIR / "storage" / "vectors"
    max_upload_mb: int = 25
    allowed_upload_ext: tuple[str, ...] = (".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt")

    # LLM provider: if ANTHROPIC_API_KEY is unset, the app runs in DEMO MODE
    # (deterministic templated reasoning) instead of pretending to call a live model.
    anthropic_api_key: str | None = None
    llm_model: str = "claude-sonnet-4-5"

    cors_origins: list[str] = ["http://localhost:3000"]
    extra_cors_origins: str = ""  # comma-separated, e.g. "https://my-app.vercel.app"

    @property
    def database_url(self) -> str:
        if self.postgres_url:
            url = self.postgres_url
            # Vercel uses postgres:// but SQLAlchemy needs postgresql://
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return f"sqlite:///{BASE_DIR / 'storage' / 'autopsy.db'}"

    @property
    def all_cors_origins(self) -> list[str]:
        origins = list(self.cors_origins)
        if self.extra_cors_origins:
            origins.extend(o.strip() for o in self.extra_cors_origins.split(",") if o.strip())
        return origins

    @property
    def demo_mode(self) -> bool:
        return not bool(self.anthropic_api_key)


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.vector_dir.mkdir(parents=True, exist_ok=True)
