import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Date, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import JSON
from app.database.connection import Base


class GlobalPublication(Base):
    """
    Platform-wide publication storage ingested from OpenAlex and other sources.
    Separate from the user-scoped `publications` table.
    Deduplication via unique constraint on (source, external_id).
    """
    __tablename__ = "global_publications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(String(512), nullable=False, index=True)   # e.g. OpenAlex W12345
    source = Column(String(50), nullable=False, index=True)         # "openalex"
    doi = Column(String(512), nullable=True, index=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, nullable=True)                           # list of author name strings
    journal = Column(String(512), nullable=True)
    publication_date = Column(Date, nullable=True, index=True)
    publication_year = Column(Integer, nullable=True, index=True)
    citation_count = Column(Integer, default=0)
    open_access = Column(String(10), nullable=True)                 # "gold","green","closed", etc.
    url = Column(Text, nullable=True)
    topics = Column(JSON, nullable=True)                            # list of concept/topic strings
    raw_metadata = Column(JSON, nullable=True)                      # selected raw API fields

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("source", "external_id", name="_global_pub_source_extid_uc"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "external_id": self.external_id,
            "source": self.source,
            "doi": self.doi,
            "title": self.title,
            "abstract": self.abstract,
            "authors": self.authors,
            "journal": self.journal,
            "publication_date": self.publication_date.isoformat() if self.publication_date else None,
            "publication_year": self.publication_year,
            "citation_count": self.citation_count,
            "open_access": self.open_access,
            "url": self.url,
            "topics": self.topics,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
