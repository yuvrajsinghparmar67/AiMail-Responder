from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Tone = Literal[
    "professional",
    "friendly",
    "formal",
    "casual",
    "apologetic",
    "sales",
    "customer_support",
    "executive",
]
ReplyLength = Literal["short", "medium", "long"]
Language = Literal["english", "hindi", "spanish", "french", "german"]


class EmailGenerationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incoming_text: str
    tone: str
    length: str
    language: str
    generated_reply: str
    token_usage: int
    created_at: datetime


class EmailGenerateRequest(BaseModel):
    incoming_text: str = Field(min_length=1, max_length=8000)
    tone: Tone = "professional"
    length: ReplyLength = "medium"
    language: Language = "english"
    custom_instructions: str | None = Field(default=None, max_length=500)


class EmailRegenerateRequest(BaseModel):
    generation_id: int
    tone: Tone | None = None
    length: ReplyLength | None = None
    language: Language | None = None
    custom_instructions: str | None = Field(default=None, max_length=500)


class EmailVariationsRequest(BaseModel):
    incoming_text: str = Field(min_length=1, max_length=8000)
    tone: Tone = "professional"
    length: ReplyLength = "medium"
    language: Language = "english"
    count: int = Field(default=2, ge=2, le=4)


class VariationItem(BaseModel):
    generated_reply: str
    token_usage: int


class EmailVariationsResponse(BaseModel):
    variations: list[VariationItem]
