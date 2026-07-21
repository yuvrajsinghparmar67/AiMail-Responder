from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class EmailGeneration(Base):
    __tablename__ = "email_generations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    incoming_text: Mapped[str] = mapped_column(Text, nullable=False)
    tone: Mapped[str] = mapped_column(String(32), nullable=False)
    length: Mapped[str] = mapped_column(String(16), nullable=False)  # short | medium | long
    language: Mapped[str] = mapped_column(String(16), default="english")
    generated_reply: Mapped[str] = mapped_column(Text, nullable=False)
    token_usage: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )

    user = relationship("User", back_populates="generations")
