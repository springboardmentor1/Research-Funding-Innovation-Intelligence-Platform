import requests
import pandas as pd
import time

BASE_URL = "https://api.openalex.org/works"

TOPICS = [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Data Science",
    "Computer Vision",
    "Natural Language Processing",
    "Cyber Security",
    "Cloud Computing",
    "Blockchain",
    "Internet of Things",
    "Software Engineering",
    "Robotics",
    "Healthcare",
    "Biotechnology",
    "Renewable Energy",
    "Quantum Computing",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Materials Science",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Environmental Science"
]

PER_PAGE = 200

all_publications = []

for topic in TOPICS:

    print(f"\nFetching publications for: {topic}")

    params = {
        "search": topic,
        "per-page": PER_PAGE
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()

        data = response.json()

        for work in data.get("results", []):

            title = work.get("display_name", "")

            publication_year = work.get("publication_year", "")

            doi = work.get("doi", "")

            citation_count = work.get("cited_by_count", 0)

            open_access = work.get("open_access", {}).get("is_oa", False)

            source_url = work.get("id", "")

            journal = ""

            if work.get("primary_location"):
                source = work["primary_location"].get("source")
                if source:
                    journal = source.get("display_name", "")

            authors = []

            for author in work.get("authorships", []):
                if author.get("author"):
                    authors.append(author["author"].get("display_name", ""))

            authors = ", ".join(authors)

            concepts = []

            for concept in work.get("concepts", []):
                concepts.append(concept.get("display_name", ""))

            keywords = ", ".join(concepts)

            abstract = ""

            if work.get("abstract_inverted_index"):

                inverted = work["abstract_inverted_index"]

                words = {}

                for word, positions in inverted.items():
                    for pos in positions:
                        words[pos] = word

                abstract = " ".join(words[pos] for pos in sorted(words.keys()))

            all_publications.append({
                "Research_Domain": topic,
                "Title": title,
                "Abstract": abstract,
                "Authors": authors,
                "Publication_Year": publication_year,
                "DOI": doi,
                "Citation_Count": citation_count,
                "Journal": journal,
                "Keywords": keywords,
                "Open_Access": open_access,
                "Source_URL": source_url
            })

        print(f"Collected {len(data.get('results', []))} publications.")

        time.sleep(1)

    except Exception as e:
        print(f"Error while fetching {topic}: {e}")

df = pd.DataFrame(all_publications)

output_path = "../raw/publications/publications_raw.csv"

df.to_csv(output_path, index=False)

print("\n========================================")
print(f"Dataset Created Successfully!")
print(f"Total Publications Collected: {len(df)}")
print(f"Saved to: {output_path}")
print("========================================")