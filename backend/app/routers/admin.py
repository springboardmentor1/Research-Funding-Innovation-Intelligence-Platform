from fastapi import APIRouter, Depends

from app.dependencies.roles import require_roles

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(
        require_roles(["Administrator"])
    )
):

    return {
        "message": "Welcome Administrator",
        "user": current_user.full_name
    }