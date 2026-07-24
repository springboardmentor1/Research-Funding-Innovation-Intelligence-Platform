"""
Reusable FastAPI dependencies for authentication and authorisation.

A "dependency" here is just a function FastAPI calls before your endpoint.
Its return value is injected as an argument. If it raises HTTPException,
your endpoint never runs.

This is why guards are dependencies rather than decorators: the result is
INJECTED, so an endpoint that needs the current user simply asks for it and
gets a real User object, already validated.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db import get_db
from app.models import User, UserRole

# tokenUrl tells the OpenAPI docs where to obtain a token. It does not create
# a route - it is metadata that makes the "Authorize" button work at /docs.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Resolve the bearer token into a real User row.

    Note we decode the token AND then load the user from the database.
    Decoding alone would be faster - the role is right there in the payload -
    but a token issued 20 minutes ago carries a 20-minute-old snapshot. If an
    admin deactivated this account 5 minutes ago, only a DB read notices.

    That is the trade-off: one query per request buys you freshness. At this
    scale it is the right call. At very high traffic you would cache it and
    accept bounded staleness.
    """
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},   # required by the HTTP spec
                                                  # for a 401 on a bearer route
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_error

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_error

    user = db.get(User, int(user_id))
    if user is None:
        raise credentials_error

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*allowed: UserRole):
    """Build a dependency that permits only the listed roles.

    Usage:
        @router.get("/admin/users", dependencies=[Depends(require_roles(UserRole.ADMIN))])

    This is a FACTORY: require_roles(...) runs once at import time and returns
    the actual dependency function. That is how you parameterise a dependency,
    since FastAPI calls dependencies with no arguments of your choosing.
    """

    def checker(user: CurrentUser) -> User:
        if user.role not in allowed:
            # 403, not 401. The distinction matters:
            #   401 Unauthorized - "I do not know who you are" (bad/absent token)
            #   403 Forbidden    - "I know exactly who you are, and no"
            # Returning 401 here would tell a valid user to log in again,
            # which would not help and would look like a broken session.
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {', '.join(r.value for r in allowed)}",
            )
        return user

    return checker
