from app.database.database import engine, Base
from app.models import UserFunding

print("Recreating database schema...")

try:
    # Drop the user_funding table
    UserFunding.__table__.drop(engine, checkfirst=True)
    print("✓ Dropped user_funding table")
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Recreated all tables")
    
    # Verify the schema
    with engine.connect() as conn:
        result = conn.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_funding' 
            ORDER BY ordinal_position
        """)
        
        columns = result.fetchall()
        print("\nCurrent columns in user_funding table:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
    
    print("\n✓ Database schema recreated successfully")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
