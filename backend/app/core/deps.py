"""
Shared `get_current_user` dependency. Every protected route across the app
(emails, drafts, templates, analytics — built in later milestones) depends
on this rather than re-implementing token parsing.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User
from app.services.auth_service import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    user_id_str = decode_access_token(credentials.credentials)
    if user_id_str is None:
        raise unauthorized

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise unauthorized from None

    user = get_user_by_id(db, user_id)
    if user is None:
        raise unauthorized

    return user
