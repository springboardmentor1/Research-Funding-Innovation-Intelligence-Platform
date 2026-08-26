from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
load_dotenv()
e = create_engine(os.getenv('DATABASE_URL'))
with e.connect() as c:
    cols = c.execute(text(
        "SELECT column_name FROM information_schema.columns WHERE table_name='funding_opportunities' ORDER BY ordinal_position"
    )).fetchall()
    print("ACTUAL funding_opportunities columns:")
    for col in cols:
        print(" -", col[0])

    row = c.execute(text("SELECT * FROM funding_opportunities LIMIT 1")).mappings().fetchone()
    if row:
        print()
        for k, v in dict(row).items():
            print(f"  {k}: {str(v)[:80]}")

    # patents sample
    print()
    pat = c.execute(text("SELECT patent_number, title, status, source_url, technology_domain FROM patents LIMIT 5")).fetchall()
    print("PATENTS sample:")
    for p in pat:
        print(" ", p)
