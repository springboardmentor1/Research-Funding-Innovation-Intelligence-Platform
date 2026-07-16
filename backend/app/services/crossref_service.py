import requests

BASE_URL = "https://api.crossref.org/works"


def search_crossref(query: str):
    response = requests.get(
        BASE_URL,
        params={
            "query": query,
            "rows": 5
        },
        timeout=10
    )

    if response.status_code != 200:
        return []

    data = response.json()

    results = []

    for item in data["message"]["items"]:

        authors = []

        for author in item.get("author", []):
            given = author.get("given", "")
            family = author.get("family", "")
            authors.append(f"{given} {family}".strip())

        results.append({
            "title": item.get("title", [""])[0],
            "authors": ", ".join(authors),
            "year": item.get("published", {})
                        .get("date-parts", [[None]])[0][0],
            "doi": item.get("DOI"),
            "source": "CrossRef"
        })

    return results