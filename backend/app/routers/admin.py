"""
Admin endpoints: user management and platform-wide statistics (Module 9).

Every route here is guarded by require_roles(ADMIN). A researcher token hitting
any of these gets 403 - the same RBAC mechanism proven in the auth tests, now
applied to a whole router via a router-level dependency.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_roles
from app.models import (
    FundingOpportunity, Patent, Publication, ResearchProfile, User, UserRole,
)
from app.schemas import UserRead

DB = Annotated[Session, Depends(get_db)]

# Router-level guard: applies to EVERY route below. No per-endpoint repetition,
# and impossible to forget on a new route added later.
router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@router.get("/users", response_model=list[UserRead])
def list_users(db: DB, limit: int = 100):
    return db.scalars(select(User).order_by(User.id).limit(limit)).all()


@router.get("/stats")
def platform_stats(db: DB):
    """Platform-wide counts for the admin dashboard.

    One endpoint returning every headline number, so the dashboard makes a
    single request instead of six.
    """
    users_by_role = dict(
        db.execute(
            select(User.role, func.count()).group_by(User.role)
        ).all()
    )

    return {
        "users": {
            "total": db.scalar(select(func.count()).select_from(User)),
            "by_role": {r.value: users_by_role.get(r, 0) for r in UserRole},
            "active": db.scalar(
                select(func.count()).select_from(User).where(User.is_active.is_(True))
            ),
        },
        "profiles": db.scalar(select(func.count()).select_from(ResearchProfile)),
        "data": {
            "patents": db.scalar(select(func.count()).select_from(Patent)),
            "publications": db.scalar(select(func.count()).select_from(Publication)),
            "funding_opportunities": db.scalar(
                select(func.count()).select_from(FundingOpportunity)
            ),
        },
    }


@router.patch("/users/{user_id}/active")
def set_user_active(user_id: int, is_active: bool, db: DB):
    """Activate or deactivate an account. Deactivation is the platform's
    'ban' - an inactive user's token is rejected by get_current_user even
    though the token itself is still cryptographically valid."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    user.is_active = is_active
    db.commit()
    return {"id": user.id, "email": user.email, "is_active": user.is_active}
