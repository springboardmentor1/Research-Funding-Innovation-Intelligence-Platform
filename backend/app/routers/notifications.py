from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.funding import FundingOpportunity
from app.models.patent import Patent
from app.schemas.notifications import Alert
from app.core.deps import get_current_user
from app.services.notifications import generate_alerts

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/alerts", response_model=list[Alert])
def get_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Notification & Alert System (spec section 10): computed alerts for the current user."""
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    opportunities = db.query(FundingOpportunity).all()
    patents = db.query(Patent).all()
    return generate_alerts(current_user, profile, opportunities, patents)
