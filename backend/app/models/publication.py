from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    journal = Column(String(255), nullable=False)

    publication_date = Column(Date, nullable=False)

    research_area = Column(String(255), nullable=False)

    doi = Column(String(255), unique=True, nullable=True)

    abstract = Column(Text, nullable=True)

    user = relationship(
        "User",
        back_populates="publications"
    )