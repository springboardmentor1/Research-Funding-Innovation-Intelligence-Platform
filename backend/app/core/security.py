"""
Security primitives: password hashing and JSON Web Tokens.

This module knows nothing about HTTP, FastAPI, or your database. It is pure
functions in and out. That separation matters: you can unit-test every line
here without a running server or a database connection.
"""

from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import settings

# One hasher instance for the whole app. It carries the cost parameters
# (memory, iterations, parallelism) that decide how slow hashing is.
_hasher = PasswordHasher()


# ------------------------------------------------------------------ passwords
def hash_password(plain: str) -> str:
    """Turn a plaintext password into an Argon2 hash.

    The output looks like:
        $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>

    Note the salt is INSIDE the string. You do not store it separately -
    argon2 generates a fresh random salt per call and packs it into the
    output, then reads it back out when verifying. That is why hashing the
    same password twice gives two different strings, and why a precomputed
    rainbow table is useless against you.
    """
    return _hasher.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Check a plaintext password against a stored hash.

    You never decrypt a hash - hashing is one-way. You re-hash the candidate
    using the salt and parameters embedded in the stored string, then compare.

    Every failure mode returns False rather than raising, so a malformed hash
    in the database behaves as "wrong password" instead of crashing the login
    endpoint with a 500.
    """
    try:
        _hasher.verify(hashed, plain)
        return True
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


# ------------------------------------------------------------------ tokens
def create_access_token(user_id: int, role: str,
                        expires_minutes: int | None = None) -> str:
    """Issue a signed JWT.

    The payload uses registered claim names from the JWT spec:
        sub  subject      - who this token is about (the user id)
        exp  expiry       - after this instant the token is invalid
        iat  issued at    - when it was created

    `sub` is the user id, not the email, because emails change and ids do
    not. `sub` must be a string per the spec, hence str(user_id).

    IMPORTANT: this token is SIGNED, not ENCRYPTED. Anyone holding it can
    read the payload - paste one into jwt.io and you will see the role in
    plaintext. What the signature guarantees is that nobody can CHANGE it
    without SECRET_KEY. Never put anything secret in a JWT.
    """
    minutes = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=minutes),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Verify a token's signature and expiry, returning its payload.

    Returns None on any problem - bad signature, expired, malformed. The
    caller turns that into a 401. We deliberately do not distinguish
    "expired" from "forged" in the return value: telling an attacker which
    of their guesses was structurally valid is free information.

    `algorithms=[...]` is not optional. Accepting whatever algorithm the
    token declares is the classic JWT vulnerability - an attacker sets
    alg to "none" and self-signs.
    """
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except jwt.PyJWTError:
        return None
