from flask import Blueprint, jsonify
import pandas as pd

research_insights_bp = Blueprint("research_insights", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"
FUNDING = "../datasets/funding/nih_funding.csv"
RESEARCHERS = "../datasets/researchers/researchers.csv"


@research_insights_bp.route("/research-insights")
def research_insights():

    publications = pd.read_csv(PUBLICATIONS).fillna("")
    funding = pd.read_csv(FUNDING).fillna("")
    researchers = pd.read_csv(RESEARCHERS).fillna("")

    # ---------------- Top Research Area ----------------

    top_area = "Artificial Intelligence"

    if "title" in publications.columns:
        ai = publications["title"].astype(str).str.contains(
            "artificial intelligence|machine learning|deep learning|ai",
            case=False,
            na=False,
            regex=True
        ).sum()

        cyber = publications["title"].astype(str).str.contains(
            "cyber",
            case=False,
            na=False
        ).sum()

        iot = publications["title"].astype(str).str.contains(
            "iot",
            case=False,
            na=False
        ).sum()

        blockchain = publications["title"].astype(str).str.contains(
            "blockchain",
            case=False,
            na=False
        ).sum()

        counts = {
            "Artificial Intelligence": int(ai),
            "Cybersecurity": int(cyber),
            "IoT": int(iot),
            "Blockchain": int(blockchain),
        }

        top_area = max(counts, key=counts.get)

    # ---------------- Most Active Country ----------------

    top_country = "Unknown"

    if "country" in researchers.columns:
        c = researchers["country"].value_counts()

        if len(c) > 0:
            top_country = c.index[0]

    # ---------------- Highest Funding Organization ----------------

    top_org = "Unknown"

    if "organization" in funding.columns:
        o = funding["organization"].value_counts()

        if len(o) > 0:
            top_org = o.index[0]

    # ---------------- Most Active Researcher ----------------

    top_researcher = "Unknown"

    if "researcher_name" in researchers.columns:
        r = researchers["researcher_name"].value_counts()

        if len(r) > 0:
            top_researcher = r.index[0]

    # ---------------- Trending Technology ----------------

    trending = "Generative AI"

    return jsonify({
        "top_area": top_area,
        "top_country": top_country,
        "top_organization": top_org,
        "top_researcher": top_researcher,
        "trending": trending,
        "total_publications": len(publications)
    })