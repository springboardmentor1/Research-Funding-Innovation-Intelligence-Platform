import uuid
from sqlalchemy import Column, String, ForeignKey
from app.database import Base, engine

class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    research_domain = Column(String(100), nullable=False)
    keywords = Column(String(255), nullable=False)
    organization = Column(String(100), nullable=False)
    biography = Column(String(500), nullable=True)

Base.metadata.create_all(bind=engine)