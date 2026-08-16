import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.database.connection import Base


class DataIngestionJob(Base):
    """Tracks every ingestion run for auditing and incremental sync."""
    __tablename__ = "data_ingestion_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(50), nullable=False, index=True)          # openalex | lens
    entity_type = Column(String(50), nullable=False)                  # publication | patent
    status = Column(String(30), nullable=False, default="pending")    # pending | running | completed | failed
    query = Column(String(500), nullable=True)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    records_processed = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)

    last_cursor = Column(Text, nullable=True)    # OpenAlex cursor / Lens scroll_id
    error_message = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "entity_type": self.entity_type,
            "status": self.status,
            "query": self.query,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "records_processed": self.records_processed,
            "records_created": self.records_created,
            "records_updated": self.records_updated,
            "records_failed": self.records_failed,
            "last_cursor": self.last_cursor,
            "error_message": self.error_message,
        }
