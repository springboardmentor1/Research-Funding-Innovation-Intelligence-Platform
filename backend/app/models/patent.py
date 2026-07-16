import uuid

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base, engine


class Patent(Base):
    __tablename__ = "patents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("research_profiles.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    patent_number = Column(String(100), nullable=False)

    filing_year = Column(Integer, nullable=False)

    status = Column(String(100), nullable=False)


Base.metadata.create_all(bind=engine)