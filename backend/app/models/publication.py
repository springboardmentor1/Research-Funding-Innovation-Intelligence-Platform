import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from app.database import Base, engine

class Publication(Base):
    __tablename__ = "publications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("research_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    authors = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False)
    source = Column(String(255), nullable=False)

Base.metadata.create_all(bind=engine)