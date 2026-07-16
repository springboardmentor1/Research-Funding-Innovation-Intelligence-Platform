import uuid

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base, engine


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    research_domain = Column(String(100), nullable=False)

    keywords = Column(String(255), nullable=False)

    organization = Column(String(100), nullable=False)

    biography = Column(String(500), nullable=True)


Base.metadata.create_all(bind=engine)