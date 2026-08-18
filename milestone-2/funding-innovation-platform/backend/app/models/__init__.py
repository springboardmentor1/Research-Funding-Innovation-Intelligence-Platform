"""
Importing all model modules here ensures SQLAlchemy's mapper registry is
fully populated (needed for string-based relationship() forward refs and
for Alembic autogenerate to see every table) whenever `app.models` is
imported anywhere in the application.
"""
from app.models.user import User, UserRole, OAuthProvider  # noqa: F401
from app.models.research_profile import ResearchProfile, Publication, Patent  # noqa: F401
from app.models.funding_opportunity import FundingOpportunity, FundingSourceType, OpportunityStatus  # noqa: F401
from app.models.application import FundingApplication, ApplicationStatus  # noqa: F401
from app.models.bookmark import FundingBookmark  # noqa: F401
from app.models.notification import Notification, NotificationType  # noqa: F401

__all__ = [
    "User",
    "UserRole",
    "OAuthProvider",
    "ResearchProfile",
    "Publication",
    "Patent",
    "FundingOpportunity",
    "FundingSourceType",
    "OpportunityStatus",
    "FundingApplication",
    "ApplicationStatus",
    "FundingBookmark",
    "Notification",
    "NotificationType",
]
