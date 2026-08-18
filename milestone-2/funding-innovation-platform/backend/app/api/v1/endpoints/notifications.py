"""Notification endpoints — list, unread count, mark read/mark all read."""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/me", response_model=PaginatedResponse[NotificationResponse])
def list_my_notifications(
    unread_only: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the authenticated user's notifications, newest first."""
    service = NotificationService(db)
    return service.list_mine(current_user, unread_only=unread_only, page=page, page_size=page_size)


@router.get("/me/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unread notification count, meant for a navbar badge."""
    service = NotificationService(db)
    return UnreadCountResponse(unread_count=service.count_unread(current_user))


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a single notification as read."""
    service = NotificationService(db)
    return service.mark_read(current_user, notification_id)


@router.patch("/read-all", response_model=dict)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all of the authenticated user's notifications as read."""
    service = NotificationService(db)
    count = service.mark_all_read(current_user)
    return {"marked_read": count}
