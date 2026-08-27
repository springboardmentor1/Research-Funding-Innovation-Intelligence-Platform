from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.db import get_db
from models.user import User
from auth.auth import get_current_user
from services.dashboard_service import (
    get_researcher_dashboard,
    get_startup_dashboard,
    get_innovation_manager_dashboard,
    get_admin_dashboard,
)

router = APIRouter(prefix="/v1/dashboards", tags=["Dashboards"])

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of {allowed_roles}"
            )
        return current_user
    return role_checker

@router.get("/researcher")
def researcher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Researcher", "Administrator"])),
):
    """Returns the Researcher dashboard data."""
    data = get_researcher_dashboard(db, current_user)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

@router.get("/startup")
def startup_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Startup Founder", "Administrator"])),
):
    """Returns the Startup Founder dashboard data."""
    data = get_startup_dashboard(db, current_user)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data

@router.get("/innovation-manager")
def innovation_manager_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Innovation Manager", "Administrator"])),
):
    """Returns the Innovation Manager dashboard data."""
    return get_innovation_manager_dashboard(db, current_user)

@router.get("/admin")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Administrator"])),
):
    """Returns the Administrator dashboard data."""
    return get_admin_dashboard(db, current_user)
