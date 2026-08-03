import uuid
from sqlalchemy import Column, String
from app.database import Base, engine

class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    eligibility = Column(String(500), nullable=False) # comma-separated keywords
    deadline = Column(String(100), nullable=False)
    amount = Column(String(100), nullable=False)

Base.metadata.create_all(bind=engine)
