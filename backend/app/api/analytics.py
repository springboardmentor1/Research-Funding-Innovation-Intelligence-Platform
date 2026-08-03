from fastapi import APIRouter
import requests
from collections import Counter

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# ----------------------------------------------------
# Get papers from OpenAlex
# ----------------------------------------------------

def load_papers():

    url = "https://api.openalex.org/works"

    params = {
        "search": "artificial intelligence",
        "per-page": 100
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return []

    data = response.json()

    return data.get("results", [])


# ----------------------------------------------------
# Publication Trends
# ----------------------------------------------------

@router.get("/publication-trends")
def publication_trends():

    papers = load_papers()

    year_counter = Counter()

    for paper in papers:

        year = paper.get("publication_year")

        if year:
            year_counter[year] += 1

    trends = []

    for year in sorted(year_counter.keys()):

        trends.append({
            "year": year,
            "paper_count": year_counter[year]
        })

    return {
        "success": True,
        "data": trends
    }


# ----------------------------------------------------
# Top Research Topics
# ----------------------------------------------------

@router.get("/top-topics")
def top_topics():

    papers = load_papers()

    topic_counter = Counter()

    for paper in papers:

        for concept in paper.get("concepts", []):

            name = concept.get("display_name")

            if name:
                topic_counter[name] += 1

    topics = []

    for topic, count in topic_counter.most_common(10):

        topics.append({
            "topic": topic,
            "paper_count": count
        })

    return {
        "success": True,
        "data": topics
    }