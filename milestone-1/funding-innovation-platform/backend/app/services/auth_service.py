"""
Authentication business logic: registration, credential login, token
refresh, and Google OAuth2 login/sign-up.
"""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlreadyExistsError,
    InactiveUserError,
    InvalidCredentialsError,
    TokenError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.mongo import log_activity
from app.models.user import OAuthProvider, User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse
from app.schemas.user import UserRegister

logger = logging.getLogger("app.services.auth")


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def _issue_tokens(self, user: User) -> TokenResponse:
        claims = {"role": user.role.value, "email": user.email}
        access_token = create_access_token(str(user.id), extra_claims=claims)
        refresh_token = create_refresh_token(str(user.id))
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user,
        )

    async def register(self, payload: UserRegister) -> TokenResponse:
        if self.repo.get_by_email(payload.email):
            raise AlreadyExistsError("An account with this email already exists.")
        if self.repo.get_by_username(payload.username):
            raise AlreadyExistsError("This username is already taken.")

        # Administrator role cannot be self-assigned at registration time.
        role = payload.role if payload.role != UserRole.ADMINISTRATOR else UserRole.RESEARCHER

        user = User(
            email=payload.email.lower(),
            username=payload.username,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role=role,
            oauth_provider=OAuthProvider.LOCAL,
            is_active=True,
        )
        user = self.repo.create(user)
        logger.info("New user registered: %s (%s)", user.email, user.role)
        await log_activity("user_registered", user_id=str(user.id), email=user.email)
        return self._issue_tokens(user)

    async def login(self, email: str, password: str) -> TokenResponse:
        user = self.repo.get_by_email(email)
        if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
            await log_activity("login_failed", email=email, success=False)
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InactiveUserError()

        await log_activity("login_success", user_id=str(user.id), email=user.email)
        logger.info("User logged in: %s", user.email)
        return self._issue_tokens(user)

    async def refresh_access_token(self, refresh_token: str) -> str:
        try:
            payload = decode_token(refresh_token)
        except Exception as exc:  # jose.JWTError
            raise TokenError("Invalid or expired refresh token.") from exc

        if payload.get("type") != "refresh":
            raise TokenError("Provided token is not a refresh token.")

        user_id = payload.get("sub")
        user = self.repo.get_by_id(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise TokenError("User not found or inactive.")

        claims = {"role": user.role.value, "email": user.email}
        return create_access_token(str(user.id), extra_claims=claims)

    async def login_or_register_oauth(
        self, provider: OAuthProvider, oauth_id: str, email: str, full_name: str
    ) -> TokenResponse:
        """Find an existing OAuth user, link an existing local account by
        email, or create a brand-new account — then issue platform tokens."""
        user = self.repo.get_by_oauth(provider.value, oauth_id)
        if not user:
            user = self.repo.get_by_email(email)
            if user:
                user.oauth_provider = provider
                user.oauth_id = oauth_id
                user = self.repo.update(user)
            else:
                base_username = email.split("@")[0]
                username = base_username
                suffix = 1
                while self.repo.get_by_username(username):
                    username = f"{base_username}{suffix}"
                    suffix += 1

                user = User(
                    email=email.lower(),
                    username=username,
                    full_name=full_name or base_username,
                    hashed_password=None,
                    role=UserRole.RESEARCHER,
                    oauth_provider=provider,
                    oauth_id=oauth_id,
                    is_active=True,
                    is_verified=True,
                )
                user = self.repo.create(user)

        if not user.is_active:
            raise InactiveUserError()

        await log_activity("oauth_login", user_id=str(user.id), email=user.email, metadata={"provider": provider.value})
        return self._issue_tokens(user)
