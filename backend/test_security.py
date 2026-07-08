from app.core.security import hash_password, verify_password

password = "password123"

hashed = hash_password(password)

print("Hashed Password:", hashed)

print("Password Verified:", verify_password(password, hashed))