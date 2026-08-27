from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database.db import get_db
from schemas.notification import NotificationResponse, PreferencesUpdate
import services.notification_service as notification_service
from auth.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/v1/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user notifications."""
    return notification_service.get_notifications(db, current_user.id, unread_only)

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notif = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read."""
    notification_service.mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read"}

@router.put("/preferences")
def update_preferences(
    prefs: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences."""
    current_prefs = json.loads(current_user.notification_preferences or "{}")
    current_prefs.update(prefs.preferences)
    
    current_user.notification_preferences = json.dumps(current_prefs)
    db.commit()
    
    return {"message": "Preferences updated", "preferences": current_prefs}
