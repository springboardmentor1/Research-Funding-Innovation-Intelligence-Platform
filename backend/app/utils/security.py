import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional, Any
import jwt
from app.config import settings

def get_password_hash(password: str) -> str:
    """Generates PBKDF2 HMAC SHA256 password hash."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + '$' + pwd_hash.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against PBKDF2 hash or legacy bcrypt."""
    try:
        if '$' in hashed_password:
            salt_hex, hash_hex = hashed_password.split('$')
            salt = bytes.fromhex(salt_hex)
            computed_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
            return computed_hash.hex() == hash_hex
        else:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            return pwd_context.verify(plain_password[:72], hashed_password)
    except Exception:
        return False

def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded
    except jwt.PyJWTError:
        return None
