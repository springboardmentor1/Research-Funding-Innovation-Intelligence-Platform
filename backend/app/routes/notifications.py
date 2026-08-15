from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.connection import get_db
from app.services.auth_service import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationOut(BaseModel):
    id: str
    title: str
    body: Optional[str] = None
    notif_type: str
    is_read: bool
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


def _seed_notifications_if_empty(db: Session, user_id: str):
    """Seed sample notifications for new users."""
    count = db.query(Notification).filter(Notification.user_id == user_id).count()
    if count == 0:
        samples = [
            Notification(user_id=user_id, title="New Funding Opportunity",
                         body="$500K NSF Grant for Quantum Computing Research is now open.", notif_type="funding"),
            Notification(user_id=user_id, title="Patent Alert",
                         body="New competitor patent in AI/ML space detected.", notif_type="patent"),
            Notification(user_id=user_id, title="Research Trend Alert",
                         body="Emerging trend in Gene Therapy detected across 340 publications.", notif_type="research"),
            Notification(user_id=user_id, title="Funding Deadline",
                         body="NSF Grant application deadline in 3 days. Don't miss it.", notif_type="deadline"),
            Notification(user_id=user_id, title="Matching Opportunity",
                         body="Excellent match found for your research profile in biotech sector.", notif_type="match"),
            Notification(user_id=user_id, title="New Publication Indexed",
                         body="A highly-cited paper in your research domain was published.", notif_type="research",
                         is_read=True),
        ]
        db.add_all(samples)
        db.commit()


@router.get("", response_model=List[NotificationOut])
def get_notifications(
    notif_type: Optional[str] = None,
    is_read: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for the current user, with optional filters."""
    _seed_notifications_if_empty(db, str(current_user.id))

    query = db.query(Notification).filter(Notification.user_id == str(current_user.id))
    if notif_type:
        query = query.filter(Notification.notif_type == notif_type)
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)

    notifications = query.order_by(Notification.created_at.desc()).all()
    return [NotificationOut(
        id=n.id, title=n.title, body=n.body, notif_type=n.notif_type,
        is_read=n.is_read,
        created_at=n.created_at.isoformat() if n.created_at else None
    ) for n in notifications]


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications."""
    _seed_notifications_if_empty(db, str(current_user.id))
    count = db.query(Notification).filter(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == str(current_user.id)
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user."""
    db.query(Notification).filter(
        Notification.user_id == str(current_user.id)
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a notification."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == str(current_user.id)
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}
