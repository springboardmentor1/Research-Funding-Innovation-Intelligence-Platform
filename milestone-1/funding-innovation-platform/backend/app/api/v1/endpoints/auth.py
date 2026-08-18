"""Authentication endpoints: register, login, token refresh, and Google OAuth2."""
import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.postgres import get_db
from app.models.user import OAuthProvider, User
from app.schemas.auth import (
    AccessTokenResponse,
    GoogleOAuthRequest,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
)
from app.schemas.user import UserRegister, UserResponse
from app.services.auth_service import AuthService
from app.services.oauth_service import GoogleOAuthService

logger = logging.getLogger("app.api.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: Session = Depends(get_db)) -> TokenResponse:
    """Register a new user account and receive access + refresh tokens."""
    service = AuthService(db)
    return await service.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate with email + password and receive access + refresh tokens."""
    service = AuthService(db)
    return await service.login(payload.email, payload.password)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> AccessTokenResponse:
    """Exchange a valid refresh token for a new short-lived access token."""
    service = AuthService(db)
    new_access_token = await service.refresh_access_token(payload.refresh_token)
    return AccessTokenResponse(access_token=new_access_token)


@router.post("/oauth/google", response_model=TokenResponse)
async def google_oauth_login(payload: GoogleOAuthRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Login or register via a Google-issued ID token (OAuth2 / OpenID Connect)."""
    google_service = GoogleOAuthService()
    claims = await google_service.verify_id_token(payload.id_token)

    auth_service = AuthService(db)
    return await auth_service.login_or_register_oauth(
        provider=OAuthProvider.GOOGLE,
        oauth_id=claims["sub"],
        email=claims["email"],
        full_name=claims.get("name", ""),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user's profile."""
    return current_user
