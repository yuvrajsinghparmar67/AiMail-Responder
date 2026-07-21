from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DraftCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    source_generation_id: int | None = None


class DraftUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)


class DraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    is_favorite: bool
    source_generation_id: int | None
    created_at: datetime
    updated_at: datetime
