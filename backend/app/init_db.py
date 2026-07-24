"""
Create all tables defined in app/models.py.

Run once:  python -m app.init_db

This uses Base.metadata.create_all(), which issues CREATE TABLE IF NOT EXISTS
for every model. It is the fast path for getting a schema up.

What it does NOT do: change an existing table. If you add a column to a model
later, create_all() will silently ignore it because the table already exists.
That is what Alembic migrations solve. For a 7-day build with a schema you
control, drop-and-recreate is acceptable; for anything with real user data it
is not.
"""

from app.db import Base, engine
from app import models  # noqa: F401  - import registers models on Base.metadata


def main(drop: bool = False) -> None:
    if drop:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    for name in sorted(Base.metadata.tables):
        print(f"  ok  {name}")
    print("\nDone.")


if __name__ == "__main__":
    import sys
    main(drop="--drop" in sys.argv)
