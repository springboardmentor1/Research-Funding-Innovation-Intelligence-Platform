"""
User management endpoints: self-service profile view/update/password
change, and administrator-only user management (RBAC enforced).
"""
import logging
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.postgres import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    PasswordChange,
    UserListResponse,
    UserResponse,
    UserUpdate,
)
from app.services.user_service import UserService

logger = logging.getLogger("app.api.users")

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)) -> User:
    """Return the authenticated user's account details."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Update the authenticated user's display name / username."""
    service = UserService(db)
    return service.update_profile(current_user, payload)


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_my_password(
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Change the authenticated user's password."""
    service = UserService(db)
    service.change_password(current_user, payload)


# ---------------------------------------------------------------------------
# Administrator-only endpoints (RBAC enforced via require_admin dependency)
# ---------------------------------------------------------------------------


@router.get("", response_model=UserListResponse, dependencies=[Depends(require_admin)])
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> UserListResponse:
    """[Administrator] List all registered users with pagination."""
    service = UserService(db)
    items, total = service.list_users(skip=skip, limit=limit)
    return UserListResponse(total=total, items=items)


@router.get("/{user_id}", response_model=UserResponse, dependencies=[Depends(require_admin)])
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)) -> User:
    """[Administrator] Retrieve any user's account by ID."""
    service = UserService(db)
    return service.get_by_id(user_id)


@router.patch("/{user_id}/deactivate", response_model=UserResponse, dependencies=[Depends(require_admin)])
def deactivate_user(user_id: uuid.UUID, db: Session = Depends(get_db)) -> User:
    """[Administrator] Deactivate a user account."""
    service = UserService(db)
    user = service.get_by_id(user_id)
    return service.deactivate_user(user)


@router.patch("/{user_id}/activate", response_model=UserResponse, dependencies=[Depends(require_admin)])
def activate_user(user_id: uuid.UUID, db: Session = Depends(get_db)) -> User:
    """[Administrator] Reactivate a previously deactivated user account."""
    service = UserService(db)
    user = service.get_by_id(user_id)
    return service.activate_user(user)


@router.patch("/{user_id}/role", response_model=UserResponse, dependencies=[Depends(require_admin)])
def change_user_role(user_id: uuid.UUID, new_role: UserRole, db: Session = Depends(get_db)) -> User:
    """[Administrator] Change a user's platform role."""
    service = UserService(db)
    user = service.get_by_id(user_id)
    return service.change_role(user, new_role)
