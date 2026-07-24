"""
Authentication endpoints: register, token, me.

    POST /api/v1/auth/register   create an account
    POST /api/v1/auth/token      exchange email+password for a JWT
    GET  /api/v1/auth/me         who am I (requires a valid token)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.deps import CurrentUser, require_roles
from app.models import User, UserRole
from app.schemas import Token, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead,
             status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Annotated[Session, Depends(get_db)]):
    """Create a new account.

    Returns 201 Created, not 200 OK, because a new resource now exists.
    Status codes are part of your API contract - clients branch on them.
    """
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),   # never store plaintext
        full_name=payload.full_name,
        role=payload.role,
    )
    db.add(user)        # stage it in the session
    db.commit()         # write to Postgres
    db.refresh(user)    # reload so user.id and created_at are populated
    return user         # UserRead has no password field, so none is returned


@router.post("/token", response_model=Token)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    """Exchange credentials for an access token.

    OAuth2PasswordRequestForm reads FORM-ENCODED fields named `username` and
    `password` - not JSON. That is fixed by the OAuth2 spec (RFC 6749), which
    is why the field is called `username` even though we put an email in it.
    Deviating would break every standard OAuth2 client, including the
    Authorize button in your own /docs page.
    """
    user = db.scalar(select(User).where(User.email == form.username))

    # One identical error for "no such user" and "wrong password", on purpose.
    # Distinct messages turn this endpoint into an account-enumeration oracle:
    # an attacker learns which emails are registered without a single login.
    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account",
        )

    return Token(access_token=create_access_token(user.id, user.role.value))


@router.get("/me", response_model=UserRead)
def read_me(user: CurrentUser):
    """Return the caller's own account.

    The entire auth check is the CurrentUser annotation. No token, bad token,
    or expired token and this function body never executes.
    """
    return user


@router.get("/admin/users", response_model=list[UserRead],
            dependencies=[Depends(require_roles(UserRole.ADMIN))])
def list_users(db: Annotated[Session, Depends(get_db)], limit: int = 50):
    """Admin-only. Exists to prove RBAC works.

    The guard is in `dependencies=[...]` rather than a parameter because this
    endpoint does not need the user object - it only needs the check to have
    passed.
    """
    return db.scalars(select(User).limit(limit)).all()
