import sqlite3
import hashlib
import secrets

DB_NAME = "users.db"


def get_connection():
    return sqlite3.connect(DB_NAME)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            research_interest TEXT
        )
    """)

    conn.commit()
    conn.close()


def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()

    return password_hash, salt


def create_user(name, email, password, research_interest):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        password_hash, salt = hash_password(password)

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password_hash, salt, research_interest)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                name,
                email,
                password_hash,
                salt,
                research_interest
            )
        )

        conn.commit()
        return True, "Account created successfully!"

    except sqlite3.IntegrityError:
        return False, "An account with this email already exists."

    finally:
        conn.close()


def authenticate_user(email, password):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, password_hash, salt, research_interest
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    user = cursor.fetchone()
    conn.close()

    if user is None:
        return None

    user_id, name, email, stored_hash, salt, research_interest = user

    password_hash, _ = hash_password(password, salt)

    if password_hash == stored_hash:
        return {
            "id": user_id,
            "name": name,
            "email": email,
            "research_interest": research_interest
        }

    return None