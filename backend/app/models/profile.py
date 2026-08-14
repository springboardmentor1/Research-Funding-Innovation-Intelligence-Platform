import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey  # noqa: F401

from app.database.connection import Base


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    # Unique profile ID
    profile_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    # Must match users.id type (String/UUID)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    research_domain = Column(String(255), nullable=True)
    research_subdomain = Column(String(255), nullable=True)
    keywords = Column(String(500), nullable=True)

    organization = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    highest_qualification = Column(String(255), nullable=True)

    years_of_experience = Column(
        Integer,
        nullable=True,
        default=0
    )

    research_interests = Column(String(1000), nullable=True)
    technology_areas = Column(String(1000), nullable=True)

    publications_count = Column(
        Integer,
        nullable=True,
        default=0
    )

    patents_count = Column(
        Integer,
        nullable=True,
        default=0
    )

    biography = Column(String(2000), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    orcid_id = Column(String(50), nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "profile_id": self.profile_id,
            "user_id": self.user_id,
            "research_domain": self.research_domain,
            "research_subdomain": self.research_subdomain,
            "keywords": self.keywords,
            "organization": self.organization,
            "designation": self.designation,
            "highest_qualification": self.highest_qualification,
            "years_of_experience": self.years_of_experience,
            "research_interests": self.research_interests,
            "technology_areas": self.technology_areas,
            "publications_count": self.publications_count,
            "patents_count": self.patents_count,
            "biography": self.biography,
            "linkedin_url": self.linkedin_url,
            "orcid_id": self.orcid_id,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }