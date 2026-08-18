"""
Business logic for the Research Profile Management module: creating and
updating a researcher's profile, and adding publications and patents to it.
"""
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AlreadyExistsError, NotFoundError
from app.models.research_profile import Patent, Publication, ResearchProfile
from app.models.user import User
from app.repositories.research_profile_repository import ResearchProfileRepository
from app.schemas.research_profile import (
    PatentCreate,
    PublicationCreate,
    ResearchProfileCreate,
    ResearchProfileUpdate,
)

logger = logging.getLogger("app.services.research_profile")


class ResearchProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ResearchProfileRepository(db)

    def get_by_user(self, user: User) -> ResearchProfile:
        profile = self.repo.get_by_user_id(user.id)
        if not profile:
            raise NotFoundError("Research profile has not been created yet.")
        return profile

    def get_by_user_optional(self, user: User) -> ResearchProfile | None:
        return self.repo.get_by_user_id(user.id)

    def create_profile(self, user: User, payload: ResearchProfileCreate) -> ResearchProfile:
        if self.repo.get_by_user_id(user.id):
            raise AlreadyExistsError("Research profile already exists for this user.")

        profile = ResearchProfile(
            user_id=user.id,
            biography=payload.biography,
            organization=payload.organization,
            research_domains=payload.research_domains,
            keywords=payload.keywords,
            technology_areas=payload.technology_areas,
        )
        profile = self.repo.create(profile)
        logger.info("Research profile created for user: %s", user.email)
        return profile

    def update_profile(self, user: User, payload: ResearchProfileUpdate) -> ResearchProfile:
        profile = self.get_by_user(user)
        profile.biography = payload.biography
        profile.organization = payload.organization
        profile.research_domains = payload.research_domains
        profile.keywords = payload.keywords
        profile.technology_areas = payload.technology_areas
        profile = self.repo.update(profile)
        logger.info("Research profile updated for user: %s", user.email)
        return profile

    def add_publication(self, user: User, payload: PublicationCreate) -> Publication:
        profile = self.get_by_user(user)
        publication = Publication(profile_id=profile.id, **payload.model_dump())
        return self.repo.add_publication(publication)

    def add_patent(self, user: User, payload: PatentCreate) -> Patent:
        profile = self.get_by_user(user)
        patent = Patent(profile_id=profile.id, **payload.model_dump())
        return self.repo.add_patent(patent)
