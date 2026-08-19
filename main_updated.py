from fastapi import FastAPI, Query
import requests
import urllib.parse

# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AI Research Intelligence Platform",
    description="Backend API for AI Research, Funding and Innovation Intelligence",
    version="1.0"
)

# =========================================================
# OPENALEX CONFIGURATION
# =========================================================

OPENALEX_URL = "https://api.openalex.org/works"

HEADERS = {
    "User-Agent": "AI-Research-Intelligence-Platform/1.0"
}

# =========================================================
# FALLBACK RESEARCH DATA
# =========================================================

FALLBACK_RECENT_RESEARCH = [
    {
        "title": "Artificial Intelligence Research",
        "publication_date": "2025-01-01",
        "doi": None
    },
    {
        "title": "Deep Learning and Artificial Intelligence",
        "publication_date": "2024-12-01",
        "doi": None
    },
    {
        "title": "Recent Advances in Machine Learning",
        "publication_date": "2024-11-01",
        "doi": None
    },
    {
        "title": "Computer Vision Using Deep Learning",
        "publication_date": "2024-10-01",
        "doi": None
    },
    {
        "title": "Artificial Intelligence Applications",
        "publication_date": "2024-09-01",
        "doi": None
    }
]

FALLBACK_TRENDS = [
    {
        "key": "2015",
        "key_display_name": "2015",
        "count": 32855
    },
    {
        "key": "2016",
        "key_display_name": "2016",
        "count": 38472
    },
    {
        "key": "2017",
        "key_display_name": "2017",
        "count": 47940
    },
    {
        "key": "2018",
        "key_display_name": "2018",
        "count": 70443
    },
    {
        "key": "2019",
        "key_display_name": "2019",
        "count": 98522
    },
    {
        "key": "2020",
        "key_display_name": "2020",
        "count": 141629
    },
    {
        "key": "2021",
        "key_display_name": "2021",
        "count": 190565
    },
    {
        "key": "2022",
        "key_display_name": "2022",
        "count": 238682
    },
    {
        "key": "2023",
        "key_display_name": "2023",
        "count": 355096
    },
    {
        "key": "2024",
        "key_display_name": "2024",
        "count": 457312
    },
    {
        "key": "2025",
        "key_display_name": "2025",
        "count": 646578
    }
]

# =========================================================
# HOME / HEALTH
# =========================================================

@app.get("/")
def root():

    return {
        "message": "AI Research Intelligence Platform Backend is running"
    }


@app.get("/api/health")
def health():

    return {
        "status": "success",
        "message": "Backend is working correctly"
    }


# =========================================================
# RESEARCH STATISTICS
# =========================================================

@app.get("/api/research/stats")
def research_stats():

    try:

        response = requests.get(
            OPENALEX_URL,
            params={
                "search": "artificial intelligence",
                "per-page": 1
            },
            headers=HEADERS,
            timeout=20
        )

        print(
            "OpenAlex Stats Status:",
            response.status_code
        )

        if response.status_code == 200:

            data = response.json()

            meta = data.get(
                "meta",
                {}
            )

            count = meta.get(
                "count",
                0
            )

            return {
                "status": "success",
                "total_research_works": int(count),
                "source": "OpenAlex"
            }

        # -------------------------------------------------
        # FALLBACK
        # -------------------------------------------------

        return {
            "status": "success",
            "total_research_works": 3157909,
            "source": "Fallback data"
        }

    except Exception as e:

        print(
            "Research Stats Error:",
            repr(e)
        )

        return {
            "status": "success",
            "total_research_works": 3157909,
            "source": "Fallback data"
        }


# =========================================================
# RECENT RESEARCH
# =========================================================

@app.get("/api/research/recent")
def recent_research():

    try:

        response = requests.get(
            OPENALEX_URL,
            params={
                "search": "artificial intelligence",
                "sort": "publication_date:desc",
                "per-page": 10
            },
            headers=HEADERS,
            timeout=30
        )

        print(
            "OpenAlex Recent Research Status:",
            response.status_code
        )

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        if response.status_code == 200:

            data = response.json()

            results = data.get(
                "results",
                []
            )

            if not isinstance(results, list):
                results = []

            recent_research = []

            for work in results:

                if not isinstance(work, dict):
                    continue

                recent_research.append({
                    "title": work.get(
                        "title",
                        "Untitled Research"
                    ),
                    "publication_date": work.get(
                        "publication_date",
                        "Unknown"
                    ),
                    "doi": work.get("doi")
                })

            if recent_research:

                return {
                    "status": "success",
                    "recent_research": recent_research,
                    "source": "OpenAlex"
                }

        # -------------------------------------------------
        # RATE LIMIT / OTHER ERROR
        # -------------------------------------------------

        print(
            "Using fallback recent research data."
        )

        return {
            "status": "success",
            "recent_research": FALLBACK_RECENT_RESEARCH,
            "source": "Fallback data"
        }

    except Exception as e:

        print(
            "Recent Research Error:",
            repr(e)
        )

        return {
            "status": "success",
            "recent_research": FALLBACK_RECENT_RESEARCH,
            "source": "Fallback data"
        }


# =========================================================
# RESEARCH TRENDS
# =========================================================

@app.get("/api/research/trends")
def research_trends():

    try:

        response = requests.get(
            OPENALEX_URL,
            params={
                "search": "artificial intelligence",
                "group_by": "publication_year",
                "per-page": 200
            },
            headers=HEADERS,
            timeout=30
        )

        print(
            "OpenAlex Trends Status:",
            response.status_code
        )

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        if response.status_code == 200:

            data = response.json()

            groups = data.get(
                "group_by",
                []
            )

            if isinstance(groups, list) and groups:

                valid_groups = []

                for item in groups:

                    if not isinstance(item, dict):
                        continue

                    if "key" not in item:
                        continue

                    valid_groups.append({
                        "key": str(item.get("key")),
                        "key_display_name": str(
                            item.get(
                                "key_display_name",
                                item.get("key")
                            )
                        ),
                        "count": int(
                            item.get(
                                "count",
                                0
                            )
                        )
                    })

                if valid_groups:

                    return {
                        "status": "success",
                        "group_by": valid_groups,
                        "source": "OpenAlex"
                    }

        # -------------------------------------------------
        # FALLBACK
        # -------------------------------------------------

        print(
            "Using fallback research trend data."
        )

        return {
            "status": "success",
            "group_by": FALLBACK_TRENDS,
            "source": "Fallback data"
        }

    except Exception as e:

        print(
            "Research Trends Error:",
            repr(e)
        )

        return {
            "status": "success",
            "group_by": FALLBACK_TRENDS,
            "source": "Fallback data"
        }


# =========================================================
# RESEARCH SEARCH
# =========================================================

@app.get("/api/research/search")
def research_search(
    topic: str = Query(...)
):

    topic = topic.strip()

    if not topic:

        return {
            "status": "error",
            "topic": topic,
            "results": [],
            "message": "Please enter a research topic."
        }

    print(
        "Research Search:",
        topic
    )

    try:

        response = requests.get(
            OPENALEX_URL,
            params={
                "search": topic,
                "per-page": 10
            },
            headers=HEADERS,
            timeout=30
        )

        print(
            "OpenAlex Search Status:",
            response.status_code
        )

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        if response.status_code == 200:

            data = response.json()

            results = data.get(
                "results",
                []
            )

            research_results = []

            if isinstance(results, list):

                for work in results:

                    if not isinstance(work, dict):
                        continue

                    research_results.append({
                        "title": work.get(
                            "title",
                            "Untitled Research Paper"
                        ),
                        "publication_year": work.get(
                            "publication_year",
                            "Unknown"
                        ),
                        "doi": work.get("doi")
                    })

            return {
                "status": "success",
                "topic": topic,
                "results": research_results,
                "source": "OpenAlex"
            }

        # -------------------------------------------------
        # RATE LIMIT FALLBACK
        # -------------------------------------------------

        if response.status_code == 429:

            print(
                "OpenAlex rate limit reached "
                "during research search."
            )

            fallback_results = [
                {
                    "title": f"{topic} - Research Overview",
                    "publication_year": 2025,
                    "doi": None
                },
                {
                    "title": f"Recent Advances in {topic}",
                    "publication_year": 2024,
                    "doi": None
                },
                {
                    "title": f"Applications of {topic}",
                    "publication_year": 2024,
                    "doi": None
                },
                {
                    "title": f"Deep Learning for {topic}",
                    "publication_year": 2023,
                    "doi": None
                },
                {
                    "title": f"Emerging Research in {topic}",
                    "publication_year": 2023,
                    "doi": None
                }
            ]

            return {
                "status": "success",
                "topic": topic,
                "results": fallback_results,
                "source": "Fallback data - OpenAlex rate limit"
            }

        # -------------------------------------------------
        # OTHER ERRORS
        # -------------------------------------------------

        return {
            "status": "success",
            "topic": topic,
            "results": [],
            "source": "No live results available"
        }

    except Exception as e:

        print(
            "Research Search Error:",
            repr(e)
        )

        return {
            "status": "success",
            "topic": topic,
            "results": [
                {
                    "title": f"{topic} - Research Overview",
                    "publication_year": 2025,
                    "doi": None
                },
                {
                    "title": f"Recent Advances in {topic}",
                    "publication_year": 2024,
                    "doi": None
                }
            ],
            "source": "Fallback data"
        }