from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    title = Column(String(255), nullable=False)

    patent_number = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    inventors = Column(Text, nullable=False)

    assignee = Column(String(255), nullable=False)

    technology_area = Column(
        String(150),
        nullable=False,
        index=True,
    )

    filing_date = Column(Date, nullable=False)

    publication_date = Column(Date, nullable=True)

    status = Column(
        String(50),
        nullable=False,
        default="Filed",
        index=True,
    )

    country = Column(
        String(100),
        nullable=False,
    )

    abstract = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship(
        "User",
        back_populates="patents",
    )