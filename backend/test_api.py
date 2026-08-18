import http.client
import json

BASE_URL = "127.0.0.1"
PORT = 8000

def test_login():
    print("=" * 50)
    print("Test 1: Login")
    print("=" * 50)
    
    conn = http.client.HTTPConnection(BASE_URL, PORT)
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    data = 'username=researcher@demo.edu&password=research123'
    
    try:
        conn.request("POST", "/api/auth/token", data, headers)
        response = conn.getresponse()
        print(f"Status: {response.status}")
        result = response.read().decode()
        print(f"Response: {result}")
        
        if response.status == 200:
            token_data = json.loads(result)
            return token_data.get("access_token")
        else:
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        conn.close()

def test_endpoint(token, endpoint, name):
    print("\n" + "=" * 50)
    print(f"Test: {name}")
    print("=" * 50)
    
    conn = http.client.HTTPConnection(BASE_URL, PORT)
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        conn.request("GET", endpoint, "", headers)
        response = conn.getresponse()
        print(f"Status: {response.status}")
        result = response.read().decode()
        print(f"Response: {result[:500]}")
        return response.status == 200
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        conn.close()

# Run tests
token = test_login()

if token:
    test_endpoint(token, "/research-intelligence/dashboard", "Research Intelligence Dashboard")
    test_endpoint(token, "/publication-records/", "Publication Records")
    test_endpoint(token, "/api/dashboard/", "Dashboard API")
else:
    print("Could not get token, skipping endpoint tests")

print("\n" + "=" * 50)
print("Tests completed")
print("=" * 50)
