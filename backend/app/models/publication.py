import uuid

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base, engine


class Publication(Base):
    __tablename__ = "publications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("research_profiles.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    authors = Column(String(255), nullable=False)

    year = Column(Integer, nullable=False)

    source = Column(String(255), nullable=False)


Base.metadata.create_all(bind=engine)