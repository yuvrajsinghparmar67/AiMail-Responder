"""Business logic for email generation: SSE event formatting + DB persistence."""
from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.models.email_generation import EmailGeneration


def sse_event(event_type: str, **data: object) -> str:
    """Format one Server-Sent Event. Frontend parses `data:` lines as JSON
    with a `type` field, rather than using separate SSE `event:` lines —
    simpler to consume from a plain fetch + ReadableStream on the client."""
    payload = {"type": event_type, **data}
    return f"data: {json.dumps(payload)}\n\n"


def save_generation(
    db: Session,
    user_id: int,
    incoming_text: str,
    tone: str,
    length: str,
    language: str,
    generated_reply: str,
    token_usage: int,
) -> EmailGeneration:
    generation = EmailGeneration(
        user_id=user_id,
        incoming_text=incoming_text,
        tone=tone,
        length=length,
        language=language,
        generated_reply=generated_reply,
        token_usage=token_usage,
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    return generation
