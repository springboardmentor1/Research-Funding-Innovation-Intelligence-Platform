from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from database.db import Base
from datetime import datetime, timezone

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False) # e.g., 'funding_alert', 'patent_alert', 'system'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
