from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.user import User
from app.models.technology import Notification
from app.api.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications System"])

@router.get("/")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    
    # Auto-generate default notification if empty
    if not notifications:
        n1 = Notification(
            user_id=current_user.id,
            title="Grant Deadline Approaching",
            message="NSF Translational AI for Medical Imaging deadline is in 30 days.",
            notification_type="funding"
        )
        n2 = Notification(
            user_id=current_user.id,
            title="New Matching Research Paper",
            message="Deep Learning Architectures for Early Detection of Alzheimer's published in Medical Image Analysis.",
            notification_type="research"
        )
        db.add_all([n1, n2])
        db.commit()
        notifications = db.query(Notification).filter(Notification.user_id == current_user.id).all()
        
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        }
        for n in notifications
    ]

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read."}
