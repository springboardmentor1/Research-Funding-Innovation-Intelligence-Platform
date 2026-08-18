"""
Importing all model modules here ensures SQLAlchemy's mapper registry is
fully populated (needed for string-based relationship() forward refs and
for Alembic autogenerate to see every table) whenever `app.models` is
imported anywhere in the application.
"""
from app.models.user import User, UserRole, OAuthProvider  # noqa: F401
from app.models.research_profile import ResearchProfile, Publication, Patent  # noqa: F401

__all__ = [
    "User",
    "UserRole",
    "OAuthProvider",
    "ResearchProfile",
    "Publication",
    "Patent",
]
