"""Bookmark endpoints — save/unsave/list bookmarked funding opportunities."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.bookmark import BookmarkResponse
from app.schemas.common import PaginatedResponse
from app.services.bookmark_service import BookmarkService

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


@router.get("/me", response_model=PaginatedResponse[BookmarkResponse])
def list_my_bookmarks(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the authenticated user's bookmarked funding opportunities."""
    service = BookmarkService(db)
    return service.list_mine(current_user, page=page, page_size=page_size)


@router.post("/{opportunity_id}", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
def add_bookmark(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bookmark a funding opportunity for later reference."""
    service = BookmarkService(db)
    return service.add(current_user, opportunity_id)


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_bookmark(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Remove a bookmark."""
    service = BookmarkService(db)
    service.remove(current_user, opportunity_id)
