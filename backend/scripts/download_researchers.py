import requests
import pandas as pd

URL = "https://api.openalex.org/authors"

rows = []

cursor = "*"

while len(rows) < 10000:

    print("Downloaded:", len(rows))

    response = requests.get(
        URL,
        params={
            "per-page": 200,
            "cursor": cursor
        }
    )

    response.raise_for_status()

    data = response.json()

    for author in data["results"]:

        rows.append({

            "researcher_name": author.get("display_name", ""),

            "orcid": author.get("orcid", ""),

            "institution": (
                author["last_known_institutions"][0]["display_name"]
                if author.get("last_known_institutions")
                else ""
            ),

            "country": (
                author["last_known_institutions"][0].get("country_code", "")
                if author.get("last_known_institutions")
                else ""
            ),

            "works_count": author.get("works_count", 0),

            "cited_by_count": author.get("cited_by_count", 0),

        })

        if len(rows) >= 10000:
            break

    cursor = data["meta"]["next_cursor"]

df = pd.DataFrame(rows)

df.to_csv(
    "../datasets/researchers/researchers.csv",
    index=False
)

print("Downloaded", len(df), "researchers")