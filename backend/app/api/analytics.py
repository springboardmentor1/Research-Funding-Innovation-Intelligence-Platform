from fastapi import APIRouter
from pathlib import Path
from collections import Counter
import csv
import json
import re

router = APIRouter()


# ============================================================
# DATASET PATHS
# ============================================================

# analytics.py
# -> backend/app/api/analytics.py
#
# parents[0] = api
# parents[1] = app
# parents[2] = backend
# parents[3] = project root

PROJECT_ROOT = Path(__file__).resolve().parents[3]

CSV_FILE = PROJECT_ROOT / "data" / "cleaned_research_papers.csv"
JSON_FILE = PROJECT_ROOT / "data" / "research_papers.json"


# ============================================================
# LOAD CSV
# ============================================================

def load_csv_papers():

    if not CSV_FILE.exists():
        print(f"CSV NOT FOUND: {CSV_FILE}")
        return []

    try:
        with open(
            CSV_FILE,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(file)
            papers = list(reader)

            print(f"CSV papers loaded: {len(papers)}")

            return papers

    except Exception as error:

        print(f"CSV ERROR: {error}")
        return []


# ============================================================
# LOAD JSON
# ============================================================

def load_json_papers():

    if not JSON_FILE.exists():
        print(f"JSON NOT FOUND: {JSON_FILE}")
        return []

    try:

        with open(
            JSON_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        if isinstance(data, dict):

            results = data.get("results", [])

            if isinstance(results, list):
                return results

        if isinstance(data, list):
            return data

    except Exception as error:

        print(f"JSON ERROR: {error}")

    return []


# ============================================================
# YEAR EXTRACTION
# ============================================================

def extract_year(value):

    if value is None:
        return None

    match = re.search(
        r"(19|20)\d{2}",
        str(value)
    )

    if not match:
        return None

    year = int(match.group(0))

    if 1900 <= year <= 2100:
        return year

    return None


# ============================================================
# PUBLICATION TRENDS
# ============================================================

@router.get("/publication-trends")
def get_publication_trends():

    papers = load_csv_papers()

    year_counts = Counter()

    for paper in papers:

        year = extract_year(
            paper.get("Publication_Year")
        )

        if year is not None:
            year_counts[year] += 1

    trends = [
        {
            "year": year,
            "paper_count": count
        }
        for year, count
        in sorted(year_counts.items())
    ]

    return {
        "publication_trends": trends,
        "data": trends,
        "total_papers": len(papers),
        "publication_years": len(trends)
    }


# ============================================================
# TOP RESEARCH TOPICS
# ============================================================

@router.get("/top-topics")
def get_top_topics():

    json_papers = load_json_papers()

    topic_counts = Counter()

    # --------------------------------------------------------
    # Read concepts from JSON
    # --------------------------------------------------------

    for paper in json_papers:

        concepts = paper.get(
            "concepts",
            []
        )

        if not isinstance(concepts, list):
            continue

        for concept in concepts:

            topic = None

            if isinstance(concept, dict):

                topic = (
                    concept.get("display_name")
                    or concept.get("name")
                    or concept.get("topic")
                )

            elif isinstance(concept, str):

                topic = concept

            if topic:

                topic = str(topic).strip()

                if topic:
                    topic_counts[topic] += 1

    # --------------------------------------------------------
    # Fallback: extract useful words from CSV titles
    # --------------------------------------------------------

    if not topic_counts:

        csv_papers = load_csv_papers()

        stop_words = {
            "the",
            "and",
            "for",
            "with",
            "from",
            "using",
            "into",
            "through",
            "based",
            "study",
            "analysis",
            "approach",
            "method",
            "methods",
            "research",
            "new",
            "an",
            "a",
            "of",
            "in",
            "on",
            "to",
            "by",
            "is",
            "are"
        }

        for paper in csv_papers:

            title = paper.get(
                "Paper_Title",
                ""
            )

            words = re.findall(
                r"[A-Za-z][A-Za-z-]{2,}",
                title.lower()
            )

            for word in words:

                if word not in stop_words:
                    topic_counts[word.title()] += 1

    top_topics = [
        {
            "topic": topic,
            "paper_count": count
        }
        for topic, count
        in topic_counts.most_common(10)
    ]

    return {
        "top_topics": top_topics,
        "data": top_topics,
        "total_topics": len(topic_counts)
    }


# ============================================================
# SUMMARY
# ============================================================

@router.get("/summary")
def get_summary():

    papers = load_csv_papers()

    trends = get_publication_trends()
    topics = get_top_topics()

    return {
        "total_papers": len(papers),
        "publication_years": trends["publication_years"],
        "research_topics": topics["total_topics"],
        "funding_programs": 4,
        "analytics_status": "Live"
    }


# ============================================================
# HEALTH
# ============================================================

@router.get("/health")
def analytics_health():

    csv_papers = load_csv_papers()
    json_papers = load_json_papers()

    return {
        "status": "ok",
        "csv_exists": CSV_FILE.exists(),
        "json_exists": JSON_FILE.exists(),
        "csv_papers": len(csv_papers),
        "json_papers": len(json_papers),
        "csv_path": str(CSV_FILE),
        "json_path": str(JSON_FILE)
    }