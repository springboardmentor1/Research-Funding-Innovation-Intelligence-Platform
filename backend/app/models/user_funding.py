from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import UniqueConstraint
from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.database.database import Base


class UserFunding(Base):
    __tablename__ = "user_funding"
    __table_args__ = (
        UniqueConstraint('user_id', 'funding_id', name='unique_user_funding'),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    funding_id = Column(
        Integer,
        ForeignKey("funding_opportunities.id"),
        nullable=False
    )

    status = Column(
        String(50),
        default="Saved"
    )

    saved_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    applied_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    user = relationship("User")

    funding = relationship("FundingOpportunity")