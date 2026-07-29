import hashlib
import hmac
import os
import base64

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored PBKDF2-HMAC-SHA256 hash."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = base64.b64decode(parts[2].encode("utf-8"))
        stored_hash = base64.b64decode(parts[3].encode("utf-8"))
        computed_hash = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(stored_hash, computed_hash)
    except Exception:
        return False


def get_password_hash(password: str, iterations: int = 260000) -> str:
    """Generates a PBKDF2-HMAC-SHA256 hash."""
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    hash_b64 = base64.b64encode(hashed).decode("utf-8")
    return f"pbkdf2_sha256${iterations}${salt_b64}${hash_b64}"
