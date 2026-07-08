import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, UniqueConstraint
from app.database.connection import Base

class Publication(Base):
    __tablename__ = "publications"

    publication_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    openalex_id = Column(String(255), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    abstract = Column(String(4000), nullable=True)
    authors = Column(String(1000), nullable=True)
    publication_year = Column(Integer, nullable=True)
    doi = Column(String(255), nullable=True)
    citation_count = Column(Integer, default=0)
    journal = Column(String(255), nullable=True)
    keywords = Column(String(1000), nullable=True)
    open_access = Column(Boolean, default=False)
    source_url = Column(String(500), nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'openalex_id', name='_user_publication_uc'),
    )

    def to_dict(self):
        return {
            "publication_id": self.publication_id,
            "openalex_id": self.openalex_id,
            "user_id": self.user_id,
            "title": self.title,
            "abstract": self.abstract,
            "authors": self.authors,
            "publication_year": self.publication_year,
            "doi": self.doi,
            "citation_count": self.citation_count,
            "journal": self.journal,
            "keywords": self.keywords,
            "open_access": self.open_access,
            "source_url": self.source_url,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None
        }
