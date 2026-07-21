from __future__ import annotations

from pydantic import BaseModel


class DailyUsagePoint(BaseModel):
    date: str  # ISO date, e.g. "2026-07-19"
    count: int


class AnalyticsSummaryResponse(BaseModel):
    total_emails_generated: int
    total_drafts_saved: int
    total_token_usage: int
    daily_usage: list[DailyUsagePoint]
