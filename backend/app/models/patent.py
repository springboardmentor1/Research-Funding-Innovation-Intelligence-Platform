import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from app.database import Base, engine

class Patent(Base):
    __tablename__ = "patents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("research_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    patent_number = Column(String(100), nullable=False)
    filing_year = Column(Integer, nullable=False)
    status = Column(String(100), nullable=False)

Base.metadata.create_all(bind=engine)