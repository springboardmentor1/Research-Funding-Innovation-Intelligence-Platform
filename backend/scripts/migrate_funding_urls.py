import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.utils.validators import is_valid_url, clean_markdown_url

from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

def run_migration():
    print("Running funding URLs migration...")
    
    # Fetch all funding opportunities
    records = db.execute(text("SELECT id, source_url, application_url FROM funding_opportunities")).fetchall()
    
    updated_count = 0
    invalid_count = 0
    
    for row in records:
        record_id = row[0]
        source_url = row[1] or row[2]
        
        cleaned_url = clean_markdown_url(source_url)
        verified = is_valid_url(cleaned_url)
        
        # If it's a generated URL like those from previous AI hallucination, un-verify it
        if cleaned_url and "grants.gov/search-grants?keyword=" in cleaned_url:
            verified = False
            
        if not verified:
            cleaned_url = None
            invalid_count += 1
            
        db.execute(
            text("UPDATE funding_opportunities SET source_url = :url, verified = :verified WHERE id = :id"),
            {"url": cleaned_url, "verified": verified, "id": record_id}
        )
        updated_count += 1
        
        if updated_count % 500 == 0:
            db.commit()
            print(f"Processed {updated_count} records...")
            
    db.commit()
    print(f"Migration complete! Processed: {updated_count}, Invalid/Nullified: {invalid_count}")

if __name__ == "__main__":
    run_migration()
