import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Parse DATABASE_URL to get connection parameters
# Format: postgresql://user:password@host:port/database
db_url = DATABASE_URL.replace("postgresql://", "")
parts = db_url.split("@")

user_pass = parts[0].split(":")
user = user_pass[0]
password = user_pass[1]

host_db = parts[1].split("/")
host_port = host_db[0].split(":")
host = host_port[0]
port = host_port[1] if len(host_port) > 1 else "5432"
database = host_db[1]

print(f"Connecting to {host}:{port}/{database} as {user}")

try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if created_at column exists
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_funding' AND column_name = 'created_at'
    """)
    
    result = cursor.fetchone()
    
    if result:
        print("Column 'created_at' exists in user_funding table")
        print("Dropping column 'created_at'...")
        cursor.execute("ALTER TABLE user_funding DROP COLUMN IF EXISTS created_at")
        print("✓ Column 'created_at' dropped successfully")
    else:
        print("Column 'created_at' does not exist in user_funding table")
        print("No migration needed")
    
    # Verify current schema
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_funding' 
        ORDER BY ordinal_position
    """)
    
    columns = cursor.fetchall()
    print("\nCurrent columns in user_funding table:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
    
    cursor.close()
    conn.close()
    print("\n✓ Migration completed successfully")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
