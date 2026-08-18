"""
Google OAuth2 helper service. Verifies a Google-issued ID token against
Google's tokeninfo endpoint and extracts the verified identity claims.

Kept as a thin, isolated service so the OAuth provider could be swapped
or extended (e.g. GitHub, Microsoft) without touching AuthService.
"""
import logging

import httpx

from app.core.config import settings
from app.core.exceptions import InvalidCredentialsError

logger = logging.getLogger("app.services.oauth")

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class GoogleOAuthService:
    async def verify_id_token(self, id_token: str) -> dict:
        """Validates the ID token with Google and returns its claims.

        Raises InvalidCredentialsError if the token is invalid, expired,
        or was not issued for this application's client ID.
        """
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.get(GOOGLE_TOKENINFO_URL, params={"id_token": id_token})
            except httpx.HTTPError as exc:
                logger.error("Failed to reach Google tokeninfo endpoint: %s", exc)
                raise InvalidCredentialsError("Could not verify Google credentials.") from exc

        if response.status_code != 200:
            raise InvalidCredentialsError("Invalid or expired Google ID token.")

        claims = response.json()

        if settings.GOOGLE_CLIENT_ID and claims.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise InvalidCredentialsError("Google token was not issued for this application.")

        if not claims.get("email_verified", "false") in ("true", True):
            raise InvalidCredentialsError("Google account email is not verified.")

        return claims
