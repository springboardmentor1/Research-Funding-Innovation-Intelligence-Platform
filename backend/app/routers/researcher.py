from fastapi import APIRouter, Depends

from app.dependencies.roles import require_roles

router = APIRouter(
    prefix="/api/researcher",
    tags=["Researcher"]
)


@router.get("/dashboard")
def researcher_dashboard(
    current_user=Depends(
        require_roles(["Researcher"])
    )
):

    return {
        "message": "Researcher Dashboard",
        "user": current_user.full_name
    }