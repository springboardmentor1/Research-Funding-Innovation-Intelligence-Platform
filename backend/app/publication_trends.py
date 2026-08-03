import json
from collections import Counter
from pathlib import Path


# ============================================================
# Find the project root directory
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

# Path to research paper dataset
DATA_FILE = BASE_DIR / "data" / "research_papers.json"


# ============================================================
# 1. PUBLICATION TREND ANALYSIS
# ============================================================

def get_publication_trends():
    """
    Analyze research papers and return
    the number of publications per year.
    """

    # Open the JSON dataset
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Get research paper records
    papers = data.get("results", [])

    # Extract publication years
    years = []

    for paper in papers:
        year = paper.get("publication_year")

        if year:
            years.append(year)

    # Count papers for each year
    year_counts = Counter(years)

    # Sort years from oldest to newest
    trends = []

    for year in sorted(year_counts.keys()):
        trends.append({
            "year": year,
            "paper_count": year_counts[year]
        })

    return trends


# ============================================================
# 2. TOP RESEARCH TOPICS ANALYSIS
# ============================================================

def get_top_research_topics():
    """
    Find the most common research topics
    from OpenAlex research paper data.
    """

    # Open the JSON dataset
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Get research papers
    papers = data.get("results", [])

    # Counter to store topic frequency
    topic_counts = Counter()

    # Extract concepts from each paper
    for paper in papers:

        concepts = paper.get("concepts", [])

        for concept in concepts:

            topic_name = concept.get("display_name")

            if topic_name:
                topic_counts[topic_name] += 1

    # Get top 10 most common research topics
    top_topics = []

    for topic, count in topic_counts.most_common(10):

        top_topics.append({
            "topic": topic,
            "paper_count": count
        })

    return top_topics