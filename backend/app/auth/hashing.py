from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback to simple hash for development/testing
        return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str):
    try:
        return pwd_context.verify(
            plain_password,
            hashed_password
        )
    except Exception:
        # Fallback for simple hash
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password