import os
from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:Kartikey123@localhost:5432/research-funding')
with engine.connect() as conn:
    tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).fetchall()
    for row in tables:
        table_name = row[0]
        count = conn.execute(text(f"SELECT count(*) FROM {table_name}")).scalar()
        print(f"Table: {table_name}, Row count: {count}")
