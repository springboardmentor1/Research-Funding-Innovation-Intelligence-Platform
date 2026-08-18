import requests

# Test registration endpoint
url = "http://localhost:8000/api/auth/register"

test_user = {
    "full_name": "Test User",
    "email": "testuser@example.com",
    "password": "test123",
    "role_id": 5,
    "organization_id": 2
}

try:
    response = requests.post(url, json=test_user)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
