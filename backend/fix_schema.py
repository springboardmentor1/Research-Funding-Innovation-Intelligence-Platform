from app.database.database import engine
import sqlalchemy

print("Checking and fixing user_funding table schema...")

try:
    with engine.connect() as conn:
        # Check if created_at column exists
        result = conn.execute(sqlalchemy.text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_funding' AND column_name = 'created_at'
        """))
        
        created_at_exists = result.fetchone()
        
        if created_at_exists:
            print("Column 'created_at' exists in user_funding table")
            print("Dropping column 'created_at'...")
            conn.execute(sqlalchemy.text("ALTER TABLE user_funding DROP COLUMN IF EXISTS created_at"))
            conn.commit()
            print("✓ Column 'created_at' dropped successfully")
        else:
            print("Column 'created_at' does not exist in user_funding table")
            print("No migration needed")
        
        # Verify current schema
        result = conn.execute(sqlalchemy.text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_funding' 
            ORDER BY ordinal_position
        """))
        
        columns = result.fetchall()
        print("\nCurrent columns in user_funding table:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
        
        print("\n✓ Schema fix completed successfully")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
