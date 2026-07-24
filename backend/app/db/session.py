"""
Database engine, session factory, and the request-scoped session dependency.

Three objects, three different lifetimes:

  engine        Created ONCE when the app starts. Holds a pool of open
                connections to Postgres. Opening a TCP connection and
                authenticating costs milliseconds; doing that per request
                would dominate your response time, so the pool keeps a few
                open and hands them out.

  SessionLocal  A factory. Calling it produces a new Session.

  Session       Your unit of work for ONE request. It tracks which objects
                you changed and writes them all on commit. It is NOT
                thread-safe and must never be shared between requests.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # send a cheap SELECT 1 before handing out a pooled
                          # connection; without this, a connection that died
                          # while idle surfaces as a random 500 on some
                          # unlucky request
    echo=False,           # flip to True to print every SQL statement - the
                          # single best debugging tool you have with an ORM
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,      # you decide when pending changes hit the DB
    autocommit=False,     # nothing is written until you call commit()
    expire_on_commit=False,   # keep objects usable after commit, so you can
                              # still read obj.id when returning a response
)


class Base(DeclarativeBase):
    """Every model class inherits from this.

    Base carries a single `metadata` object that collects every table you
    define. That is how create_all() knows what to create - it walks
    Base.metadata, not your filesystem.
    """
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a session, always closes it.

    The try/finally is the entire point. If your endpoint raises halfway
    through, the connection still returns to the pool. Leak enough
    connections and the pool is exhausted and every later request hangs
    waiting for one - a failure that looks nothing like the bug that caused
    it.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
