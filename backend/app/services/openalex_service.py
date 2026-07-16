import requests

BASE_URL = "https://api.openalex.org/works"


def search_publications(query: str):
    response = requests.get(
        BASE_URL,
        params={
            "search": query,
            "per_page": 5
        }
    )

    response.raise_for_status()

    data = response.json()

    results = []

    for work in data["results"]:
        authors = []

        for authorship in work.get("authorships", []):
            author = authorship.get("author")
            if author:
                authors.append(author.get("display_name", ""))

        results.append({
            "title": work.get("display_name"),
            "authors": ", ".join(authors),
            "year": work.get("publication_year"),
            "doi": work.get("doi"),
            "source": "OpenAlex"
        })

    return results