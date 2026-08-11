from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import (
    DashboardResponse,
    RecentActivityResponse,
)

from app.services.dashboard_service import (
    get_dashboard,
    get_recent_activity,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get User Dashboard",
    description=(
        "Returns a comprehensive dashboard for the authenticated user, "
        "including publication analytics, funding analytics, "
        "recommendation summary, and research trends."
    ),
    response_description="Dashboard analytics retrieved successfully",
)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/recent",
    response_model=RecentActivityResponse,
    summary="Get Recent Activity",
    description=(
        "Returns the latest publications and funding opportunities "
        "available in the platform."
    ),
)
def recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recent_activity(db=db)