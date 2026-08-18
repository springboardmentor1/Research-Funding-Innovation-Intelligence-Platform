"""
Security primitives: password hashing (bcrypt) and JWT access/refresh
token creation & verification.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(subject: str, expires_delta: timedelta, token_type: str, extra_claims: Optional[dict[str, Any]] = None) -> str:
    now = datetime.now(timezone.utc)
    to_encode: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + expires_delta,
        "type": token_type,
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: str, extra_claims: Optional[dict[str, Any]] = None) -> str:
    return _create_token(
        subject,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access",
        extra_claims,
    )


def create_refresh_token(subject: str) -> str:
    return _create_token(
        subject,
        timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
        "refresh",
    )


def decode_token(token: str) -> dict[str, Any]:
    """Raises jose.JWTError on invalid/expired token."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "JWTError",
]
