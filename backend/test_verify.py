import sqlite3
import urllib.request

print('--- DB Check ---')
conn = sqlite3.connect('research_platform.db')
cursor = conn.cursor()
cursor.execute('PRAGMA table_info(users);')
columns = cursor.fetchall()
role_col = next((c for c in columns if c[1] == 'role'), None)
if role_col:
    print('SUCCESS: role column exists in users table.')
else:
    print('ERROR: role column is missing!')

print('--- Auth Endpoint Check ---')
try:
    req = urllib.request.Request('http://127.0.0.1:8000/docs')
    with urllib.request.urlopen(req) as response:
        print('SUCCESS: FastAPI backend is running and reachable.')
except Exception as e:
    print('ERROR:', e)
