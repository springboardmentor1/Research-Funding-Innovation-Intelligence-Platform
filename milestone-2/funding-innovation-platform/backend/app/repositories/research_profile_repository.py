"""Data-access layer for ResearchProfile, Publication and Patent entities."""
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.research_profile import Patent, Publication, ResearchProfile


class ResearchProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> ResearchProfile | None:
        stmt = (
            select(ResearchProfile)
            .where(ResearchProfile.user_id == user_id)
            .options(
                selectinload(ResearchProfile.publications),
                selectinload(ResearchProfile.patents),
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, profile_id: uuid.UUID) -> ResearchProfile | None:
        stmt = (
            select(ResearchProfile)
            .where(ResearchProfile.id == profile_id)
            .options(
                selectinload(ResearchProfile.publications),
                selectinload(ResearchProfile.patents),
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, profile: ResearchProfile) -> ResearchProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, profile: ResearchProfile) -> ResearchProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def add_publication(self, publication: Publication) -> Publication:
        self.db.add(publication)
        self.db.commit()
        self.db.refresh(publication)
        return publication

    def add_patent(self, patent: Patent) -> Patent:
        self.db.add(patent)
        self.db.commit()
        self.db.refresh(patent)
        return patent
