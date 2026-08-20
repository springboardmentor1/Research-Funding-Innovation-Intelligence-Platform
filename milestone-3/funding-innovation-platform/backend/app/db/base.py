"""
Declarative base for all SQLAlchemy ORM models. Imported by Alembic's
env.py so that autogenerate can discover metadata, and by every model
module in app/models/.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
