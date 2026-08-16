import os
import requests
from dotenv import load_dotenv

print("TEST STARTED")

load_dotenv()

api_key = os.getenv("OPENALEX_API_KEY")

print("API KEY FOUND:", bool(api_key))

url = "https://api.openalex.org/works"

params = {
    "search": "machine learning",
    "per-page": 5,
}

if api_key:
    params["api_key"] = api_key

print("Calling OpenAlex...")

try:
    response = requests.get(
        url,
        params=params,
        timeout=30
    )

    print("STATUS CODE:", response.status_code)
    print("RESPONSE URL:", response.url)

    print("\nRAW RESPONSE:")
    print(response.text[:2000])

    if response.status_code == 200:
        data = response.json()

        print("\n==============================")
        print("TOTAL RESULTS:", data.get("meta", {}).get("count"))
        print("==============================")

        for i, work in enumerate(data.get("results", []), start=1):
            print(f"\nPaper {i}")
            print("Title:", work.get("title"))
            print("OpenAlex ID:", work.get("id"))
            print("DOI:", work.get("doi"))

except Exception as e:
    print("\nERROR OCCURRED:")
    print(type(e).__name__)
    print(str(e))

print("\nTEST FINISHED")