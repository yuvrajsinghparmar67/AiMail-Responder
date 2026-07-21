"""
AI Email Responder — FastAPI entrypoint.

Routers are registered incrementally as they're built (auth in Milestone 3,
emails in Milestone 5, drafts/templates in Milestone 6). This file stays
the single source of truth for app wiring: CORS, rate limiting, logging,
and startup tasks.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import configure_logging, logger
from app.db.database import init_db
from app.routers import analytics, auth, drafts, emails, templates

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("Starting %s (%s)", settings.app_name, settings.environment)
    init_db()
    logger.info("Database ready")
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    """Liveness/readiness probe for Docker/orchestration."""
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(emails.router, prefix=settings.api_prefix)
app.include_router(drafts.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)
app.include_router(templates.router, prefix=settings.api_prefix)
