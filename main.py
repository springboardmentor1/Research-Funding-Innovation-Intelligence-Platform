from fastapi import FastAPI
import requests
app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "AI Research Funding Platform Backend is Running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "Backend is working correctly"
    }

@app.get("/api/research/stats")
def research_stats():

    response = requests.get(
        "https://api.openalex.org/works?search=artificial%20intelligence&per-page=1"
    )

    data = response.json()

    return {
        "total_research_works": data["meta"]["count"]
    }

@app.get("/api/research/recent")
def recent_research():

    response = requests.get(
        "https://api.openalex.org/works"
        "?search=artificial%20intelligence"
        "&sort=publication_date:desc"
        "&per-page=10"
    )

    data = response.json()

    recent_works = []

    for work in data["results"]:
        recent_works.append({
            "title": work["title"],
            "publication_date": work["publication_date"],
            "doi": work["doi"]
        })

    return {
        "recent_research": recent_works
    }

@app.get("/api/research/trends")
def research_trends():

    trends = {}

    for year in range(2015, 2026):

        response = requests.get(
            "https://api.openalex.org/works",
            params={
                "search": "artificial intelligence",
                "filter": f"publication_year:{year}",
                "per-page": 1
            },
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        trends[year] = data["meta"]["count"]

    return {
        "research_trends": trends
    }

@app.get("/api/research/search")
def search_research(topic: str):

    response = requests.get(
        "https://api.openalex.org/works",
        params={
            "search": topic,
            "per-page": 10
        },
        timeout=30
    )

    data = response.json()

    results = []

    for work in data["results"]:

        results.append({
            "title": work["title"],
            "publication_year": work["publication_year"],
            "doi": work["doi"]
        })

    return {
        "topic": topic,
        "results": results
    }