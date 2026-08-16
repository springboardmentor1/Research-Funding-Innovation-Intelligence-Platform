import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Date, Text, UniqueConstraint
from sqlalchemy import JSON
from app.database.connection import Base


class GlobalPatent(Base):
    """
    Platform-wide patent storage ingested from The Lens and other sources.
    Separate from the user-scoped `patents` table.
    Deduplication via unique constraint on (source, external_id).
    """
    __tablename__ = "global_patents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(String(512), nullable=False, index=True)   # Lens lens_id
    source = Column(String(50), nullable=False, index=True)         # "lens"
    patent_number = Column(String(255), nullable=True, index=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    inventors = Column(JSON, nullable=True)                         # list of inventor name strings
    assignee = Column(String(512), nullable=True, index=True)
    filing_date = Column(Date, nullable=True, index=True)
    publication_date = Column(Date, nullable=True, index=True)
    url = Column(Text, nullable=True)
    classification = Column(Text, nullable=True)                    # IPC/CPC codes
    status = Column(String(50), nullable=True, index=True)          # GRANTED | FILED | etc.
    jurisdiction = Column(String(10), nullable=True)                # US, EP, CN, etc.
    raw_metadata = Column(JSON, nullable=True)                      # selected raw API fields

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("source", "external_id", name="_global_pat_source_extid_uc"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "external_id": self.external_id,
            "source": self.source,
            "patent_number": self.patent_number,
            "title": self.title,
            "abstract": self.abstract,
            "inventors": self.inventors,
            "assignee": self.assignee,
            "filing_date": self.filing_date.isoformat() if self.filing_date else None,
            "publication_date": self.publication_date.isoformat() if self.publication_date else None,
            "url": self.url,
            "classification": self.classification,
            "status": self.status,
            "jurisdiction": self.jurisdiction,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
