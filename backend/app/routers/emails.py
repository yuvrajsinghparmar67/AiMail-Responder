"""
Email generation endpoints.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.deps import get_current_user
from app.core.rate_limit import RateLimiter
from app.db.database import get_db
from app.models.email_generation import EmailGeneration
from app.models.user import User
from app.schemas.email import (
    EmailGenerateRequest,
    EmailGenerationResponse,
    EmailRegenerateRequest,
    EmailVariationsRequest,
    EmailVariationsResponse,
    VariationItem,
)
from app.services import email_service, llm_service

settings = get_settings()
router = APIRouter(prefix="/emails", tags=["emails"])

# Module-level singleton so hit history persists across requests (see
# RateLimiter's docstring in core/rate_limit.py).
generate_rate_limiter = RateLimiter(settings.rate_limit_generate)


async def _stream_and_persist(
    db: Session,
    user_id: int,
    incoming_text: str,
    tone: str,
    length: str,
    language: str,
    custom_instructions: str | None = None,
    variation_hint: str | None = None,
) -> AsyncGenerator[str, None]:
    """Shared streaming body for /generate and /regenerate: stream tokens to
    the client, then persist the full reply once the stream completes."""
    full_text = ""
    try:
        async for token in llm_service.stream_reply(
            incoming_text, tone, length, language, custom_instructions, variation_hint
        ):
            full_text += token
            yield email_service.sse_event("token", token=token)
    except Exception as exc:  # noqa: BLE001 - surface any provider error to the client
        yield email_service.sse_event("error", message=str(exc))
        return

    # Rough token estimate for the streamed path (Gemini's streaming API
    # doesn't reliably surface usage_metadata per-chunk the way the
    # non-streamed call does). ~4 chars/token is a standard approximation.
    token_estimate = max(1, len(full_text) // 4)

    generation = email_service.save_generation(
        db, user_id, incoming_text, tone, length, language, full_text, token_estimate
    )
    yield email_service.sse_event(
        "done",
        generation=EmailGenerationResponse.model_validate(generation).model_dump(mode="json"),
    )


@router.post("/generate", dependencies=[Depends(generate_rate_limiter)])
async def generate(
    payload: EmailGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StreamingResponse(
        _stream_and_persist(
            db,
            current_user.id,
            payload.incoming_text,
            payload.tone,
            payload.length,
            payload.language,
            payload.custom_instructions,
        ),
        media_type="text/event-stream",
    )


@router.post("/regenerate", dependencies=[Depends(generate_rate_limiter)])
async def regenerate(
    payload: EmailRegenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    original = (
        db.query(EmailGeneration)
        .filter(
            EmailGeneration.id == payload.generation_id,
            EmailGeneration.user_id == current_user.id,
        )
        .first()
    )
    if original is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found.")

    return StreamingResponse(
        _stream_and_persist(
            db,
            current_user.id,
            original.incoming_text,
            payload.tone or original.tone,
            payload.length or original.length,
            payload.language or original.language,
            payload.custom_instructions,
            variation_hint=(
                "This is a regeneration — write a fresh alternate version, "
                "meaningfully different in phrasing and structure from a typical first draft."
            ),
        ),
        media_type="text/event-stream",
    )


@router.post("/variations", response_model=EmailVariationsResponse, dependencies=[Depends(generate_rate_limiter)])
async def variations(
    payload: EmailVariationsRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate several alternate replies at once for side-by-side comparison.
    Non-streamed by design (see llm_service module docstring) and NOT
    persisted to history — these are exploratory; the user saves whichever
    one they like via POST /drafts.
    """
    results = await llm_service.generate_variations(
        payload.incoming_text, payload.tone, payload.length, payload.language, payload.count
    )
    return EmailVariationsResponse(
        variations=[VariationItem(generated_reply=text, token_usage=tokens) for text, tokens in results]
    )


@router.get("/history", response_model=list[EmailGenerationResponse])
async def list_history(
    search: str | None = Query(None, description="Filter by incoming text or reply content"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(EmailGeneration).filter(EmailGeneration.user_id == current_user.id)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                EmailGeneration.incoming_text.ilike(like),
                EmailGeneration.generated_reply.ilike(like),
            )
        )

    return (
        query.order_by(EmailGeneration.created_at.desc()).offset(offset).limit(limit).all()
    )
