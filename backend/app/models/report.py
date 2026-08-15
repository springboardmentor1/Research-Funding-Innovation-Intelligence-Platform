import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from app.database.connection import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False, default="executive_summary")
    file_format = Column(String(20), nullable=False, default="PDF")
    file_size_kb = Column(Integer, nullable=True, default=0)
    status = Column(String(50), nullable=False, default="completed")  # pending, generating, completed, failed
    description = Column(Text, nullable=True)

    generated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "report_type": self.report_type,
            "file_format": self.file_format,
            "file_size_kb": self.file_size_kb,
            "status": self.status,
            "description": self.description,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
