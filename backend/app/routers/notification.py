from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services import notification as notification_service

router = APIRouter(tags=["User Notifications & Alerts"])

@router.get("/", response_model=list[NotificationResponse])
def fetch_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all notifications and status warnings for the authenticated user's preferences."""
    return notification_service.get_user_notifications(db, current_user.id)

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification or status warning as read."""
    return notification_service.mark_notification_as_read(db, current_user.id, notification_id)
