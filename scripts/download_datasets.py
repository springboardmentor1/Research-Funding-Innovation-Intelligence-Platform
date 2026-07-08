import os
import requests
import pandas as pd

# -----------------------------
# Create Required Folders
# -----------------------------
folders = [
    "datasets/raw",
    "datasets/publications",
    "datasets/patents",
    "datasets/funding"
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)


# -----------------------------
# Helper Function
# -----------------------------
def save_csv(records, filename):
    df = pd.DataFrame(records)
    df.to_csv(filename, index=False)
    print(f"✅ Saved: {filename}")


# -----------------------------
# OpenAlex Downloader
# -----------------------------
def download_openalex():

    print("\nDownloading OpenAlex...")

    url = "https://api.openalex.org/works?per-page=100"

    response = requests.get(url)

    data = response.json()

    records = []

    for item in data["results"]:

        records.append({

            "title": item.get("display_name"),

            "publication_year": item.get("publication_year"),

            "doi": item.get("doi"),

            "type": item.get("type"),

            "cited_by_count": item.get("cited_by_count")

        })

    save_csv(records,
             "datasets/publications/openalex_publications.csv")

# -----------------------------
# NIH RePORTER Funding Downloader
# -----------------------------
def download_nih_funding():

    print("\nDownloading NIH Funding dataset...")

    url = "https://api.reporter.nih.gov/v2/projects/search"

    payload = {
        "criteria": {},
        "limit": 100
    }

    response = requests.post(url, json=payload)
    data = response.json()

    records = []

    for item in data.get("results", []):

        records.append({

            "project_title": item.get("project_title"),

            "project_number": item.get("project_number"),

            "organization": item.get("organization", {}).get("org_name"),

            "principal_investigator": item.get("principal_investigators", [{}])[0].get("full_name"),

            "fiscal_year": item.get("fiscal_year"),

            "award_amount": item.get("award_amount")

        })

    save_csv(records,
             "datasets/funding/nih_funding.csv")

# -----------------------------
# Patent Downloader
# -----------------------------



# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":

    print("=" * 50)
    print("Research Funding & Innovation Intelligence")
    print("=" * 50)

    download_openalex()
    download_nih_funding()

    print("\n🎉 Dataset download completed.")