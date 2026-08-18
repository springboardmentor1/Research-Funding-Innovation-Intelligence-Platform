"""
Database Auto-Migration Helper
Ensures all columns defined in SQLAlchemy models exist in the database tables.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text, inspect
from database.db import engine, Base
import database.models


def run_migrations():
    """Check all tables and add any missing columns."""
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if not inspector.has_table(table_name):
                continue
            existing_cols = {c["name"] for c in inspector.get_columns(table_name)}
            for col in table.columns:
                if col.name not in existing_cols:
                    col_type = col.type.compile(engine.dialect)
                    default_clause = ""
                    if col.default is not None and hasattr(col.default, 'arg') and isinstance(col.default.arg, str):
                        default_clause = f" DEFAULT '{col.default.arg}'"
                    alter_query = f"ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type}{default_clause}"
                    print(f"[MIGRATE] Adding missing column: {alter_query}")
                    conn.execute(text(alter_query))
    print("[MIGRATE] Database schema is up to date.")


if __name__ == "__main__":
    run_migrations()
