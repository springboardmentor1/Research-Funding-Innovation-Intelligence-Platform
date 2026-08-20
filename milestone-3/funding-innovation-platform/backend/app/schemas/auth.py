"""Pydantic schemas for authentication flows (login, tokens, refresh)."""
from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GoogleOAuthRequest(BaseModel):
    """Payload for exchanging a Google-issued ID token for platform tokens."""

    id_token: str
