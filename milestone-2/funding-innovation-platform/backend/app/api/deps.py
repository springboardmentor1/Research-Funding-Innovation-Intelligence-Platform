"""
Shared FastAPI dependencies: database session injection, current-user
resolution from JWT, and role-based access control (RBAC) guards.
"""
import uuid
from typing import Callable

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.exceptions import InactiveUserError, PermissionDeniedError, TokenError
from app.core.security import decode_token
from app.db.postgres import get_db
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise TokenError("Not authenticated. Please provide a valid access token.")

    try:
        payload = decode_token(token)
    except Exception as exc:
        raise TokenError("Invalid or expired access token.") from exc

    if payload.get("type") != "access":
        raise TokenError("Provided token is not an access token.")

    user_id = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id)
    except (ValueError, TypeError) as exc:
        raise TokenError("Malformed token subject.") from exc

    user = UserRepository(db).get_by_id(user_uuid)
    if not user:
        raise TokenError("User associated with this token no longer exists.")
    if not user.is_active:
        raise InactiveUserError()

    return user


def get_current_active_user(user: User = Depends(get_current_user)) -> User:
    return user


def require_roles(*allowed_roles: UserRole) -> Callable[[User], User]:
    """Dependency factory implementing RBAC: restricts an endpoint to a
    given set of roles, e.g. Depends(require_roles(UserRole.ADMINISTRATOR))."""

    def dependency(user: User = Depends(get_current_active_user)) -> User:
        if user.role not in allowed_roles:
            raise PermissionDeniedError(
                f"This action requires one of the following roles: {[r.value for r in allowed_roles]}."
            )
        return user

    return dependency


require_admin = require_roles(UserRole.ADMINISTRATOR)
