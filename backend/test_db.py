from app.database.database import SessionLocal, engine, Base
from app.models import UserFunding

# Check the current database schema
print("Checking database schema for user_funding table...")

try:
    with engine.connect() as conn:
        result = conn.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_funding' ORDER BY ordinal_position")
        columns = result.fetchall()
        print("\nCurrent columns in user_funding table:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
except Exception as e:
    print(f"Error checking schema: {e}")

# Try to create tables to sync schema
print("\nSyncing database schema with models...")
try:
    Base.metadata.create_all(bind=engine)
    print("✓ Schema synced successfully")
except Exception as e:
    print(f"Error syncing schema: {e}")
