from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Text
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    agency = Column(String(255), nullable=False)

    description = Column(Text, nullable=False)

    research_area = Column(String(200), nullable=False)

    keywords = Column(String(500), nullable=False)

    eligibility = Column(Text)

    amount = Column(Float)

    deadline = Column(Date)

    country = Column(String(100))

    application_url = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now()) 