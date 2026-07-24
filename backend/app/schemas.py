"""
Pydantic schemas - the shape of data IN TRANSIT.

models.py describes data at rest (tables). This file describes data crossing
the API boundary. They are deliberately different, and the difference is the
whole point.

Consider User. The table has `hashed_password`. If you returned the model
directly, every login response would leak password hashes. Instead:

    UserCreate  what a client may SEND when registering  (has password)
    UserRead    what the API SENDS BACK                  (no password at all)

Separate classes make leaking a field an explicit act rather than an
oversight. This is why "just return the ORM object" is a security bug.
"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import UserRole


# ------------------------------------------------------------------ auth
class UserCreate(BaseModel):
    """Registration payload. Validated BEFORE it reaches your code."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = UserRole.RESEARCHER


class UserRead(BaseModel):
    """What the API returns about a user. Note: no password field exists
    here at all, so it cannot be leaked by accident."""
    model_config = ConfigDict(from_attributes=True)   # allow building from
                                                      # a SQLAlchemy object

    id: int
    email: EmailStr
    full_name: str | None
    role: UserRole
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    """OAuth2 requires exactly these field names in the token response."""
    access_token: str
    token_type: str = "bearer"


# ------------------------------------------------------------------ profile
class ProfileCreate(BaseModel):
    organization: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    research_domains: list[str] = []
    keywords: list[str] = []
    technology_areas: list[str] = []
    country: str | None = Field(default=None, max_length=2)


class ProfileUpdate(BaseModel):
    """Every field optional - a PATCH sends only what changes."""
    organization: str | None = None
    bio: str | None = None
    research_domains: list[str] | None = None
    keywords: list[str] | None = None
    technology_areas: list[str] | None = None
    country: str | None = None


class ProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    organization: str | None
    bio: str | None
    research_domains: list[str]
    keywords: list[str]
    technology_areas: list[str]
    country: str | None
    created_at: datetime


# ------------------------------------------------------------------ funding
class FundingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: str
    title: str
    agency: str | None
    description: str | None
    close_date: date | None
    award_floor: float | None
    award_ceiling: float | None
    category: str | None
    url: str | None


class RecommendationRead(BaseModel):
    """A funding opportunity plus why it was recommended.

    `score` and `matched_terms` exist so the UI can explain the ranking.
    A recommendation the user cannot interrogate is one they will not trust.
    """
    opportunity: FundingRead
    score: float
    matched_terms: list[str] = []
