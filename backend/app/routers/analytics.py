from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.draft import Draft
from app.models.email_generation import EmailGeneration
from app.models.user import User
from app.schemas.analytics import AnalyticsSummaryResponse, DailyUsagePoint

router = APIRouter(prefix="/analytics", tags=["analytics"])

DAILY_USAGE_WINDOW_DAYS = 14


@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_emails = (
        db.query(func.count(EmailGeneration.id))
        .filter(EmailGeneration.user_id == current_user.id)
        .scalar()
        or 0
    )
    total_drafts = (
        db.query(func.count(Draft.id)).filter(Draft.user_id == current_user.id).scalar() or 0
    )
    total_tokens = (
        db.query(func.coalesce(func.sum(EmailGeneration.token_usage), 0))
        .filter(EmailGeneration.user_id == current_user.id)
        .scalar()
        or 0
    )

    window_start = datetime.now(timezone.utc) - timedelta(days=DAILY_USAGE_WINDOW_DAYS - 1)
    rows = (
        db.query(
            func.date(EmailGeneration.created_at).label("day"),
            func.count(EmailGeneration.id).label("count"),
        )
        .filter(
            EmailGeneration.user_id == current_user.id,
            EmailGeneration.created_at >= window_start,
        )
        .group_by("day")
        .all()
    )
    counts_by_day = {row.day: row.count for row in rows}

    # Zero-fill so the frontend always renders a continuous N-day series,
    # even for a brand-new account with no activity yet.
    daily_usage: list[DailyUsagePoint] = []
    for i in range(DAILY_USAGE_WINDOW_DAYS - 1, -1, -1):
        day = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_usage.append(DailyUsagePoint(date=day, count=counts_by_day.get(day, 0)))

    return AnalyticsSummaryResponse(
        total_emails_generated=total_emails,
        total_drafts_saved=total_drafts,
        total_token_usage=total_tokens,
        daily_usage=daily_usage,
    )
