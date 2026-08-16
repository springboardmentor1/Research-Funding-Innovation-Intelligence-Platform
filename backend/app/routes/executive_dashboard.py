from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services import executive_dashboard_service
from app.services.auth_service import get_current_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/executive", tags=["Executive Dashboards"])

@router.get("/admin")
def get_admin_dashboard_api(
    current_user: User = Depends(RoleChecker(["Administrator"])),
    db: Session = Depends(get_db)
):
    """
    Retrieve Administrator Executive Dashboard.
    Requires JWT Authentication and Administrator role.
    """
    return executive_dashboard_service.get_admin_dashboard(db)

@router.get("/manager")
def get_manager_dashboard_api(
    current_user: User = Depends(RoleChecker(["Innovation Manager", "Administrator"])),
    db: Session = Depends(get_db)
):
    """
    Retrieve Innovation Manager Executive Dashboard.
    Requires JWT Authentication and Innovation Manager or Administrator role.
    """
    return executive_dashboard_service.get_manager_dashboard(db)

@router.get("/researcher")
def get_researcher_dashboard_api(
    current_user: User = Depends(RoleChecker(["Researcher", "Administrator"])),
    db: Session = Depends(get_db)
):
    """
    Retrieve Researcher Executive Dashboard.
    Requires JWT Authentication and Researcher or Administrator role.
    """
    return executive_dashboard_service.get_researcher_dashboard(db, current_user)

@router.get("/startup")
def get_startup_dashboard_api(
    current_user: User = Depends(RoleChecker(["Startup Founder", "Administrator"])),
    db: Session = Depends(get_db)
):
    """
    Retrieve Startup Founder Executive Dashboard.
    Requires JWT Authentication and Startup Founder or Administrator role.
    """
    return executive_dashboard_service.get_startup_dashboard(db, current_user)
