from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from .base import BaseModel


class Institution(BaseModel):
    __tablename__ = "institutions"

    ror_id = Column(String, unique=True, index=True, nullable=True)
    openalex_id = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    country_code = Column(String, nullable=True)
    type = Column(String, nullable=True)
    homepage_url = Column(String, nullable=True)

    # Relationships
    authors = relationship("Author", back_populates="primary_institution")
