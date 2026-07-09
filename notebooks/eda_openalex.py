import requests
import pandas as pd

resp = requests.get("https://api.openalex.org/works", params={
    "search": "research funding",
    "mailto": "your_email@example.com",
    "per_page": 100   # ask for more than the default 25
})

data = resp.json()
results = data["results"]

# pull out just the fields relevant to our modules
rows = []
for work in results:
    rows.append({
        "title": work["title"],
        "year": work["publication_year"],
        "cited_by_count": work["cited_by_count"],
        "num_funders": len(work["funders"]),
        "num_concepts": len(work["concepts"]),
        "num_authors": len(work["authorships"]),
    })

df = pd.DataFrame(rows)
print(df.head())
print(df.describe())
print(df.isnull().sum())