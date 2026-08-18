from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database.db import get_db
from database.models import Alert, Profile, AlertTypeEnum
from auth.deps import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])

class AlertResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AlertResponse])
def get_alerts(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch all alerts for the logged-in user."""
    alerts = db.query(Alert).filter(Alert.user_id == current_user["sub"]).order_by(Alert.created_at.desc()).all()
    
    # Map Integer to bool for response
    results = []
    for a in alerts:
        results.append(AlertResponse(
            id=a.id,
            type=a.type.value,
            title=a.title,
            message=a.message,
            is_read=bool(a.is_read),
            created_at=a.created_at
        ))
    return results


@router.put("/{alert_id}/read")
def mark_alert_read(alert_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark an alert as read."""
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user["sub"]).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = 1
    db.commit()
    return {"message": "Alert marked as read"}


@router.delete("/{alert_id}")
def delete_alert(alert_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user["sub"]).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted"}


@router.post("/trigger-synthetic")
def trigger_synthetic_alerts(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Synthetic trigger to generate mock alerts based on the user's profile.
    This simulates a background worker finding new grants/patents.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user["sub"]).first()
    if not profile:
        return {"message": "Profile not found. Cannot generate personalized alerts."}
    
    # Generate some mock alerts
    new_alerts = [
        Alert(
            user_id=current_user["sub"],
            type=AlertTypeEnum.FUNDING,
            title="New Grant Matching Your Profile",
            message=f"A new Horizon Europe grant for '{profile.research_area or 'AI'}' just opened.",
            is_read=0
        ),
        Alert(
            user_id=current_user["sub"],
            type=AlertTypeEnum.PATENT,
            title="Competitor Patent Filed",
            message="A new patent related to your keywords was recently filed by a competitor.",
            is_read=0
        )
    ]
    
    db.bulk_save_objects(new_alerts)
    db.commit()
    
    return {"message": "Synthetic alerts generated"}
