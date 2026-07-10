from sqlalchemy import Column, Integer, String
from app.database.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String(200))
    organization_type = Column(String(100))
    country = Column(String(100))
    website = Column(String(255))