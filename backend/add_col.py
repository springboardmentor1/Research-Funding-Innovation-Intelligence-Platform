from app.database.connection import engine
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE patents ADD COLUMN patent_number VARCHAR(255);'))
        conn.commit()
        print('Column added')
    except Exception as e:
        print(e)
