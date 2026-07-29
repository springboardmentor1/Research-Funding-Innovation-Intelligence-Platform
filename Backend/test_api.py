import requests
import json

def fetch_and_print():
    try:
        res = requests.get("http://127.0.0.1:8000/api/v1/research/trends", timeout=5)
        print("--- TRENDS ---")
        print(json.dumps(res.json(), indent=2))
        
        res = requests.get("http://127.0.0.1:8000/api/v1/research/hotspots", timeout=5)
        print("--- HOTSPOTS ---")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Error fetching: {e}")

if __name__ == "__main__":
    fetch_and_print()
