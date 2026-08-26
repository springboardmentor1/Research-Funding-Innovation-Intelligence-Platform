"""
fix_patents_db.py
-----------------
1. Deletes all fake/mock patents (generated numbers like US10000001B2) for every user.
2. The next "Sync Patents" click will generate new mock data with REAL patent numbers
   that actually exist on Google Patents.

Run from:  cd backend && python fix_patents_db.py
"""
import os
import sys

# Make sure we can import the app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/research_funding")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

try:
    # Count before
    before = db.execute(text("SELECT COUNT(*) FROM patents")).scalar()
    print(f"Patents in DB before cleanup: {before}")

    # Delete patents whose patent_number looks like a generated mock (US1000000xB2 range)
    # These were created by generate_mock_patents() with numbers US10000001 - US10000010
    result = db.execute(text("""
        DELETE FROM patents
        WHERE patent_number ~ '^US100000[0-9]+B2$'
           OR external_patent_id LIKE 'lens-id-US100000%'
    """))
    deleted = result.rowcount
    db.commit()

    after = db.execute(text("SELECT COUNT(*) FROM patents")).scalar()
    print(f"Deleted {deleted} fake mock patents.")
    print(f"Patents in DB after cleanup: {after}")
    print()
    print("Done! Go to the Patents page and click 'Sync Patents' to re-sync with real data.")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
