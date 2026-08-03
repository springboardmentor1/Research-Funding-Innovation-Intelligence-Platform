from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/papers")
def get_papers(topic: str = "artificial intelligence"):

    url = "https://api.openalex.org/works"

    params = {
        "search": topic,
        "per-page": 10
    }

    response = requests.get(url, params=params)
    data = response.json()

    papers = []

    for item in data.get("results", []):

        authors = []

        for author in item.get("authorships", []):
            if author.get("author"):
                authors.append(author["author"]["display_name"])

        paper_url = (
            item.get("primary_location", {}).get("landing_page_url")
            or item.get("primary_location", {}).get("pdf_url")
            or item.get("id")
        )

        papers.append({
            "title": item.get("display_name"),
            "authors": ", ".join(authors),
            "year": item.get("publication_year"),
            "abstract": "Abstract not available",
            "url": paper_url
        })

    return papers