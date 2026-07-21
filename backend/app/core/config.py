"""
Application settings, loaded from environment variables (see .env.example
at the project root). Import `get_settings()` rather than instantiating
`Settings()` directly so the config is cached and read once.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    cors_origins: list[str] = []

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ------------------------------------------------------------
    app_name: str = "AI Email Responder"
    environment: str = "development"  # development | production
    api_prefix: str = "/api"

    # --- Database ---------------------------------------------------------
    database_url: str = "sqlite:///./data/app.db"

    # --- Auth (JWT) ---------------------------------------------------------
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # --- CORS ---------------------------------------------------------
    cors_origins: list[str] = ["http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, v: str | list[str]) -> list[str]:
        """Allow CORS_ORIGINS as a plain comma-separated string in .env
        (e.g. `http://a.com,http://b.com`) instead of requiring JSON list syntax."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # --- Gemini API (chat + embeddings) ------------------------------------
    gemini_api_key: str = ""
    chat_model: str = "gemini-3.5-flash"
    embedding_model: str = "gemini-embedding-2"

    # --- Rate limiting --------------------------------------------------
    rate_limit_generate: str = "20/minute"
    rate_limit_auth: str = "10/minute"

    # --- Logging ---------------------------------------------------------
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
