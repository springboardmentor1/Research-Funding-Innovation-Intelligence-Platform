import os
import bcrypt
from datetime import datetime, timedelta
from typing import Union, Any

from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "super_secret_platform_key_38472948729348"
)

ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "30"
    )
)


# ============================================================
# PASSWORD HASHING
# ============================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    try:
        plain_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")

        return bcrypt.checkpw(
            plain_bytes,
            hashed_bytes
        )

    except Exception:
        return False


def get_password_hash(password: str) -> str:

    pwd_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        pwd_bytes,
        salt
    )

    return hashed.decode("utf-8")


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    subject: Union[str, Any],
    expires_delta: timedelta = None
) -> str:

    if expires_delta:

        expire = datetime.utcnow() + expires_delta

    else:

        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    payload = {
        "sub": str(subject),
        "exp": expire
    }

    encoded_jwt = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ============================================================
# DECODE JWT TOKEN
# ============================================================

def decode_access_token(
    token: str
) -> Union[str, None]:

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            return None

        return str(user_id)

    except JWTError:

        return None

    except Exception:

        return None