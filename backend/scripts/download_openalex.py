import requests
import pandas as pd
import time

BASE_URL = "https://api.openalex.org/works"

all_records = []

PER_PAGE = 200
TOTAL_PAGES = 50   # 50 × 200 = 10,000 records

print("Downloading OpenAlex publications...")

for page in range(1, TOTAL_PAGES + 1):

    print(f"Downloading page {page}/{TOTAL_PAGES}")

    params = {
        "per-page": PER_PAGE,
        "page": page
    }

    response = requests.get(BASE_URL, params=params)

    if response.status_code != 200:
        print("Error:", response.status_code)
        break

    data = response.json()["results"]

    for item in data:

        authors = ", ".join([
            a["author"]["display_name"]
            for a in item.get("authorships", [])
        ])

        all_records.append({
            "title": item.get("display_name", ""),
            "publication_year": item.get("publication_year", ""),
            "type": item.get("type", ""),
            "cited_by_count": item.get("cited_by_count", 0),
            "doi": item.get("doi", ""),
            "authors": authors
        })

    time.sleep(0.2)

df = pd.DataFrame(all_records)

output = "../datasets/publications/openalex_cleaned.csv"

df.to_csv(output, index=False)

print("-----------------------------------")
print("Download completed!")
print("Records:", len(df))
print("Saved to:", output)