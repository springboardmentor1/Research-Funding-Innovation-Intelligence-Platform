from fastapi import APIRouter, HTTPException
import sqlite3
import hashlib
import os

router = APIRouter()

DATABASE = "research.db"


def get_connection():
    return sqlite3.connect(DATABASE)


def hash_password(password):
    salt = os.urandom(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        100000
    )

    return salt.hex() + ":" + password_hash.hex()


def verify_password(password, stored_password):
    salt_hex, hash_hex = stored_password.split(":")

    salt = bytes.fromhex(salt_hex)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        100000
    )

    return password_hash.hex() == hash_hex


def create_users_table():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


create_users_table()


@router.post("/register")
def register(username: str, password: str):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE username = ?",
        (username,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_password = hash_password(password)

    cursor.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (username, hashed_password)
    )

    conn.commit()
    conn.close()

    return {
        "message": "Registration successful"
    }


@router.post("/login")
def login(username: str, password: str):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT password FROM users WHERE username = ?",
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(password, user[0]):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return {
        "message": "Login successful",
        "username": username
    }