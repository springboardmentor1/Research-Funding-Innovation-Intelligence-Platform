from app.auth.jwt_handler import create_access_token

token = create_access_token(
    {"sub": "admin@gmail.com"}
)

print(token)