"""
Makes `from app.db import Base, get_db` work.

Without this file, every import would read
`from app.db.session import Base` - leaking the fact that the code happens to
live in session.py. Re-exporting here means you can reorganise the inside of
this package later without touching the twenty files that import from it.
"""

from app.db.session import Base, SessionLocal, engine, get_db

__all__ = ["Base", "SessionLocal", "engine", "get_db"]
