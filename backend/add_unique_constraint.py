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
    
    # Check if unique constraint already exists
    cursor.execute("""
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_funding' 
        AND constraint_name = 'unique_user_funding'
    """)
    
    result = cursor.fetchone()
    
    if result:
        print("Unique constraint 'unique_user_funding' already exists")
        print("No migration needed")
    else:
        print("Adding unique constraint on (user_id, funding_id)...")
        
        # First, remove any duplicate records
        cursor.execute("""
            DELETE FROM user_funding 
            WHERE id IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY user_id, funding_id 
                        ORDER BY id
                    ) as row_num
                    FROM user_funding
                ) t
                WHERE row_num > 1
            )
        """)
        deleted_count = cursor.rowcount
        if deleted_count > 0:
            print(f"Removed {deleted_count} duplicate records")
        
        # Add the unique constraint
        cursor.execute("""
            ALTER TABLE user_funding 
            ADD CONSTRAINT unique_user_funding 
            UNIQUE (user_id, funding_id)
        """)
        print("Unique constraint added successfully")
    
    # Verify current constraints
    cursor.execute("""
        SELECT constraint_name, constraint_type 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_funding' 
        ORDER BY constraint_name
    """)
    
    constraints = cursor.fetchall()
    print("\nCurrent constraints on user_funding table:")
    for constraint in constraints:
        print(f"  - {constraint[0]}: {constraint[1]}")
    
    cursor.close()
    conn.close()
    print("\nMigration completed successfully")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
