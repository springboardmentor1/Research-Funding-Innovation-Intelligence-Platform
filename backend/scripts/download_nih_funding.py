import requests
import pandas as pd
import time
import os

URL = "https://api.reporter.nih.gov/v2/projects/search"

SAVE_PATH = "../datasets/funding/nih_funding.csv"

all_projects = []

offset = 0
limit = 500
TARGET = 10000

while len(all_projects) < TARGET:

    print(f"Downloading records {offset}...")

    payload = {
        "criteria": {},
        "offset": offset,
        "limit": limit
    }

    try:
        response = requests.post(
            URL,
            json=payload,
            timeout=60
        )

        response.raise_for_status()

        data = response.json()

        projects = data.get("results", [])

        if not projects:
            break

        all_projects.extend(projects)

        offset += limit

        # Save progress after every batch
        df = pd.json_normalize(all_projects)
        os.makedirs("../datasets/funding", exist_ok=True)
        df.to_csv(SAVE_PATH, index=False)

        print(f"Saved {len(df)} records")

        time.sleep(1)

    except Exception as e:
        print("Error:", e)
        print("Retrying in 5 seconds...")
        time.sleep(5)

df = pd.json_normalize(all_projects)

df.to_csv(SAVE_PATH, index=False)

print("===================================")
print("Download Completed")
print("Total Records:", len(df))
print("Saved to:", SAVE_PATH)