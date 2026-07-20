import requests
import pandas as pd
import time
import os

URL = "https://api.openalex.org/institutions"

records = []

cursor = "*"
per_page = 200
TARGET = 10000

while len(records) < TARGET:

    print(f"Downloaded {len(records)} organizations...")

    params = {
        "per-page": per_page,
        "cursor": cursor
    }

    response = requests.get(URL, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()

    for item in data["results"]:

        records.append({
            "organization_name": item.get("display_name", ""),
            "country": item.get("country_code", ""),
            "type": item.get("type", ""),
            "city": item.get("geo", {}).get("city", ""),
            "homepage_url": item.get("homepage_url", ""),
            "works_count": item.get("works_count", 0),
            "cited_by_count": item.get("cited_by_count", 0)
        })

    cursor = data["meta"]["next_cursor"]

    if cursor is None:
        break

    time.sleep(1)

df = pd.DataFrame(records)

os.makedirs("../datasets/organizations", exist_ok=True)

df.to_csv(
    "../datasets/organizations/organizations.csv",
    index=False
)

print("\n================================")
print("Download Completed")
print("Organizations:", len(df))