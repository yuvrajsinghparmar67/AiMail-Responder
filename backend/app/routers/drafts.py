"""
Draft endpoints.

GET / and POST / are built now. Update/delete/favorite-toggle are added in
Milestone 6 without touching these existing routes.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.draft import Draft
from app.models.email_generation import EmailGeneration
from app.models.user import User
from app.schemas.draft import DraftCreate, DraftResponse, DraftUpdate

router = APIRouter(prefix="/drafts", tags=["drafts"])


def _get_owned_draft(db: Session, draft_id: int, user_id: int) -> Draft:
    draft = db.query(Draft).filter(Draft.id == draft_id, Draft.user_id == user_id).first()
    if draft is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found.")
    return draft


@router.post("", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    payload: DraftCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.source_generation_id is not None:
        exists = (
            db.query(EmailGeneration.id)
            .filter(
                EmailGeneration.id == payload.source_generation_id,
                EmailGeneration.user_id == current_user.id,
            )
            .first()
        )
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Source generation not found."
            )

    draft = Draft(
        user_id=current_user.id,
        title=payload.title,
        content=payload.content,
        source_generation_id=payload.source_generation_id,
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@router.get("", response_model=list[DraftResponse])
async def list_drafts(
    search: str | None = Query(None, description="Filter by title or content"),
    favorites_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Draft).filter(Draft.user_id == current_user.id)

    if favorites_only:
        query = query.filter(Draft.is_favorite.is_(True))

    if search:
        like = f"%{search}%"
        query = query.filter(or_(Draft.title.ilike(like), Draft.content.ilike(like)))

    return query.order_by(Draft.updated_at.desc()).offset(offset).limit(limit).all()


@router.put("/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: int,
    payload: DraftUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    draft = _get_owned_draft(db, draft_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(draft, field, value)
    db.commit()
    db.refresh(draft)
    return draft


@router.patch("/{draft_id}/favorite", response_model=DraftResponse)
async def toggle_favorite(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    draft = _get_owned_draft(db, draft_id, current_user.id)
    draft.is_favorite = not draft.is_favorite
    db.commit()
    db.refresh(draft)
    return draft


@router.delete("/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_draft(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    draft = _get_owned_draft(db, draft_id, current_user.id)
    db.delete(draft)
    db.commit()
