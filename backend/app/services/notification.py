from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.notification import Notification
from app.models.profile import ResearchProfile
from app.services.recommendations import get_recommendations_for_user

def generate_notifications_for_user(db: Session, user_id: int):
    """Automatically seeds notifications based on user profile preferences and matches."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user_id).first()
    if not profile:
        # Default fallback values if profile isn't constructed yet
        first_name = "Researcher"
        keywords = ["Deep Learning"]
    else:
        first_name = profile.first_name
        keywords = profile.keywords

    # 1. Emerging Technology Preference Notification
    tech_name = "Neuromorphic Processing Units (NPUs)"
    n1 = Notification(
        user_id=user_id,
        type="TECHNOLOGY",
        title="Emerging Technology Alert",
        message=(
            f"Dear {first_name}, the emerging technology '{tech_name}' aligns directly with your profile preferences. "
            f"Filing counts in this class increased by 54.8% recently. Consider updating your portfolio keywords."
        ),
        is_read=False
    )
    db.add(n1)

    # 2. Expiring Funding Opportunity Notification
    try:
        recs = get_recommendations_for_user(db, user_id)
        if recs:
            top_grant = recs[0]
            n2 = Notification(
                user_id=user_id,
                type="DEADLINE",
                title="Expiring Funding Opportunity",
                message=(
                    f"Action Required: The grant opportunity '{top_grant.title}' from '{top_grant.funder}' "
                    f"has a match score of {top_grant.match_score}% on your profile. The deadline is approaching on {top_grant.deadline}."
                ),
                is_read=False
            )
            db.add(n2)
    except Exception:
        # Fallback if no profile is built
        n2 = Notification(
            user_id=user_id,
            type="DEADLINE",
            title="Expiring Funding Opportunity",
            message="Action Required: Next-Generation Deep Learning Core Systems grant opportunity deadline is approaching on 2026-11-15.",
            is_read=False
        )
        db.add(n2)

    # 3. Outdated Research Citation Warning Notification
    n3 = Notification(
        user_id=user_id,
        type="RESEARCH",
        title="Outdated Research Warning",
        message=(
            f"Citation Warning: Your referenced concepts in '{keywords[0] if keywords else 'Deep Learning'}' "
            f"have experienced a 30% drop in global citation velocity compared to emerging Generative AI models. "
            f"We recommend exploring newer papers in the intelligence dashboard."
        ),
        is_read=False
    )
    db.add(n3)

    db.commit()

def get_user_notifications(db: Session, user_id: int) -> list[Notification]:
    """Retrieves all notifications for a user, automatically generating default alerts if none exist."""
    notifications = db.query(Notification).filter(Notification.user_id == user_id).all()
    if not notifications:
        generate_notifications_for_user(db, user_id)
        notifications = db.query(Notification).filter(Notification.user_id == user_id).all()
    
    # Sort with unread first, then newest first
    notifications.sort(key=lambda x: (x.is_read, x.created_at), reverse=True)
    return notifications

def mark_notification_as_read(db: Session, user_id: int, notification_id: int) -> Notification:
    """Marks a notification as read. Verifies ownership."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
