from fastapi import APIRouter, Depends
from app.services import innovation_dashboard_service
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/innovation", tags=["Innovation Analytics Dashboard"])

@router.get("/dashboard")
def get_innovation_dashboard_api(current_user: User = Depends(get_current_user)):
    """
    Retrieve executive innovation analytics dashboard containing aggregated KPI summaries,
    health metadata, patent landscape, technology intelligence, innovation scores, and commercialization strategies.
    Supports Role-Based Access Control (RBAC).
    Requires JWT authentication.
    """
    role = getattr(current_user, "role", "Administrator")
    return innovation_dashboard_service.get_innovation_dashboard(user_role=role)
