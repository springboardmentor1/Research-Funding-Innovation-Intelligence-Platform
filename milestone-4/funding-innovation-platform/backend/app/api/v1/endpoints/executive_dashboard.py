"""Executive Dashboard endpoint (Milestone 4). Restricted to Administrator
and Innovation Manager, matching Reports & Export and the existing Admin
Dashboard analytics."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.postgres import get_db
from app.models.user import UserRole
from app.schemas.executive_dashboard import ExecutiveDashboardSummary
from app.services.executive_dashboard_service import ExecutiveDashboardService

router = APIRouter(
    prefix="/executive-dashboard",
    tags=["Executive Dashboard"],
    dependencies=[Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.INNOVATION_MANAGER))],
)


@router.get("/summary", response_model=ExecutiveDashboardSummary)
def get_executive_summary(db: Session = Depends(get_db)):
    """Single composite payload with the headline KPI from every module."""
    return ExecutiveDashboardService(db).summary()
