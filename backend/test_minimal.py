from app.database.database import SessionLocal, engine, Base
from app.models import UserFunding
import sqlalchemy

# Try to query the user_funding table
print("Testing user_funding table access...")
db = SessionLocal()

try:
    # Try a simple query
    result = db.query(UserFunding).all()
    print(f"✓ Query successful, found {len(result)} records")
except Exception as e:
    print(f"✗ Query failed: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

# Check table structure
print("\nChecking table structure...")
try:
    with engine.connect() as conn:
        result = conn.execute(sqlalchemy.text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_funding' ORDER BY ordinal_position"))
        columns = result.fetchall()
        print("Current columns in user_funding table:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
except Exception as e:
    print(f"Error checking schema: {e}")
