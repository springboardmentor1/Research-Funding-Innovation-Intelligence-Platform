from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.oauth2 import get_current_user
from app.models.research_profile import ResearchProfile
from app.models.user import User

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(ResearchProfile).filter(
        ResearchProfile.user_id == current_user.id
    ).first()

    return {
        "user": current_user.full_name,
        "role": current_user.role.role_name,
        "organization": current_user.organization.organization_name,
        "profile": profile
    }