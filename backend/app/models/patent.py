import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date, UniqueConstraint
from app.database.connection import Base

class Patent(Base):
    __tablename__ = "patents"

    patent_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_patent_id = Column(String(255), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    abstract = Column(String(4000), nullable=True)
    inventors = Column(String(1000), nullable=True)
    assignee = Column(String(255), nullable=True)
    filing_date = Column(Date, nullable=True)
    publication_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=True)
    classification = Column(String(500), nullable=True)
    technology_domain = Column(String(255), nullable=True)
    citation_count = Column(Integer, default=0)
    source_url = Column(String(500), nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'external_patent_id', name='_user_patent_uc'),
    )

    def to_dict(self):
        return {
            "patent_id": self.patent_id,
            "external_patent_id": self.external_patent_id,
            "user_id": self.user_id,
            "title": self.title,
            "abstract": self.abstract,
            "inventors": self.inventors,
            "assignee": self.assignee,
            "filing_date": self.filing_date.isoformat() if self.filing_date else None,
            "publication_date": self.publication_date.isoformat() if self.publication_date else None,
            "status": self.status,
            "classification": self.classification,
            "technology_domain": self.technology_domain,
            "citation_count": self.citation_count,
            "source_url": self.source_url,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None
        }
