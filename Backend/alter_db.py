from database.db import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN notification_preferences VARCHAR(500) DEFAULT '{}' NOT NULL"))
        conn.commit()
        print('Column added successfully')
    except Exception as e:
        print(f"Error: {e}")
