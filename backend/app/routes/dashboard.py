from fastapi import APIRouter, Depends
from app.services import dashboard_service
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Research Intelligence Dashboard"])

@router.get("/analytics")
def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    """
    Retrieve aggregated publications, patents, funding trends, and KPI summary metrics.
    Requires JWT authentication.
    """
    return dashboard_service.get_dashboard_data()
