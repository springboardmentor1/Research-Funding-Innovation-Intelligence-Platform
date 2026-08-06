from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.funding import FundingOpportunity
from app.models.patent import Patent
from app.models.profile import ResearchProfile
from app.schemas.user import UserOut
from app.schemas.admin import PlatformStats
from app.core.deps import require_roles

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN))):
    """User management (spec section: Admin Dashboard)."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(
    user_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/activate", response_model=UserOut)
def activate_user(
    user_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.get("/platform-stats", response_model=PlatformStats)
def platform_stats(db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN))):
    """Platform analytics + system reports (spec section: Admin Dashboard)."""
    users = db.query(User).all()
    roles_count: dict[str, int] = {}
    for u in users:
        roles_count[u.role.value] = roles_count.get(u.role.value, 0) + 1

    profiles_with_domains = db.query(ResearchProfile).all()
    domains_count = sum(1 for p in profiles_with_domains if p.research_domains)

    return PlatformStats(
        total_users=len(users),
        users_by_role=roles_count,
        total_funding_opportunities=db.query(FundingOpportunity).count(),
        total_patents=db.query(Patent).count(),
        total_research_profiles_with_domains=domains_count,
    )
