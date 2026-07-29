import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from database.db import Base


class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), index=True, nullable=False)
    source = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    eligibility_criteria = Column(Text, default="", nullable=True)
    domain_tags_json = Column("domain_tags", Text, default="[]", nullable=False)
    deadline = Column(String(100), nullable=True)
    amount = Column(String(100), nullable=True)
    min_career_stage = Column(String(100), nullable=True)
    institution_type = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    min_amount = Column(Integer, nullable=True)
    max_amount = Column(Integer, nullable=True)
    deadline_date = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    @property
    def domain_tags(self):
        try:
            return json.loads(self.domain_tags_json or "[]")
        except Exception:
            return []

    @domain_tags.setter
    def domain_tags(self, value):
        self.domain_tags_json = json.dumps(value if isinstance(value, list) else [])

class GrantTracking(Base):
    __tablename__ = "grant_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    funding_opportunity_id = Column(Integer, ForeignKey("funding_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="interested", nullable=False) # interested, applied, awarded, rejected
    notes = Column(Text, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
