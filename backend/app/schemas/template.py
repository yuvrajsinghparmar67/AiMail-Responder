from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# NOTE: category is intentionally a free-text field (not an enum) so users
# aren't blocked from adding their own — see frontend's SUGGESTED_CATEGORIES
# in components/templates/template-form.tsx for the suggested set shown in
# the UI's dropdown.


class TemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=64)
    prompt_text: str = Field(min_length=1)


class TemplateUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = Field(default=None, min_length=1, max_length=64)
    prompt_text: str | None = Field(default=None, min_length=1)


class TemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    prompt_text: str
    created_at: datetime
