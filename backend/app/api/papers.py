from fastapi import APIRouter
from pathlib import Path
import csv
import ast
import re

router = APIRouter()


# ============================================================
# DATASET
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

CSV_FILE = PROJECT_ROOT / "data" / "cleaned_research_papers.csv"


# ============================================================
# LOAD PAPERS
# ============================================================

def load_papers():

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

            print(
                f"Loaded {len(papers)} papers from CSV"
            )

            return papers

    except Exception as error:

        print(f"CSV ERROR: {error}")

        return []


# ============================================================
# AUTHORS
# ============================================================

def parse_authors(value):

    if not value:
        return "Authors not available"

    try:

        parsed = ast.literal_eval(value)

        if isinstance(parsed, list):

            names = []

            for item in parsed:

                if not isinstance(item, dict):
                    continue

                author = item.get("author")

                if isinstance(author, dict):

                    name = author.get("display_name")

                    if name:
                        names.append(name)

                elif isinstance(author, str):

                    names.append(author)

            if names:
                return ", ".join(names)

    except Exception:
        pass

    # Fallback: extract display_name values
    names = re.findall(
        r"'display_name':\s*'([^']+)'",
        str(value)
    )

    if names:
        return ", ".join(names)

    return str(value)


# ============================================================
# SEARCH
# ============================================================

@router.get("/papers")
def get_papers(
    topic: str = "artificial intelligence"
):

    papers = load_papers()

    topic = topic.strip()

    if not topic:
        topic = "artificial intelligence"

    keywords = [
        word.lower()
        for word in re.findall(
            r"[A-Za-z0-9]+",
            topic
        )
        if len(word) >= 2
    ]

    results = []

    for paper in papers:

        title = str(
            paper.get("Paper_Title", "")
        )

        authors = str(
            paper.get("Authors", "")
        )

        journal = str(
            paper.get("Journal", "")
        )

        publication_type = str(
            paper.get("Publication_Type", "")
        )

        searchable_text = " ".join([
            title,
            authors,
            journal,
            publication_type
        ]).lower()

        # ----------------------------------------------------
        # Match search keywords
        # ----------------------------------------------------

        matched_keywords = [
            keyword
            for keyword in keywords
            if keyword in searchable_text
        ]

        if not matched_keywords:
            continue

        # ----------------------------------------------------
        # Ranking
        # ----------------------------------------------------

        title_lower = title.lower()

        title_matches = sum(
            1
            for keyword in keywords
            if keyword in title_lower
        )

        score = (
            title_matches * 10
            + len(matched_keywords)
        )

        # ----------------------------------------------------
        # URL
        # ----------------------------------------------------

        doi = paper.get("DOI", "")

        url = doi if doi else "#"

        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        results.append({
            "title": title or "Untitled research paper",

            "authors": parse_authors(
                paper.get("Authors", "")
            ),

            "year": paper.get(
                "Publication_Year"
            ),

            "publication_year": paper.get(
                "Publication_Year"
            ),

            "abstract": (
                "Abstract information is not available "
                "in the current research dataset."
            ),

            "doi": doi,

            "url": url,

            "journal": journal,

            "publication_type": publication_type,

            "matched_keywords": matched_keywords,

            "match_score": score
        })

    # --------------------------------------------------------
    # Sort best matches first
    # --------------------------------------------------------

    results.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    # --------------------------------------------------------
    # Return top 20
    # --------------------------------------------------------

    results = results[:20]

    return {
        "papers": results,
        "results": results,
        "total": len(results),
        "topic": topic
    }


# ============================================================
# SEARCH HEALTH
# ============================================================

@router.get("/papers/health")
def papers_health():

    papers = load_papers()

    return {
        "status": "ok",
        "dataset_exists": CSV_FILE.exists(),
        "dataset": str(CSV_FILE),
        "total_papers": len(papers)
    }