from flask import Blueprint, jsonify
import pandas as pd

dashboard_insights_bp = Blueprint("dashboard_insights", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"
FUNDING = "../datasets/funding/nih_funding.csv"
PATENTS = "../datasets/patents/patents.csv"
ORGANIZATIONS = "../datasets/organizations/organizations.csv"
RESEARCHERS = "../datasets/researchers/researchers.csv"


@dashboard_insights_bp.route("/dashboard-insights")
def dashboard_insights():

    # ---------------- Load Datasets ----------------

    publications = pd.read_csv(PUBLICATIONS).fillna("")
    funding = pd.read_csv(FUNDING, low_memory=False).fillna("")
    patents = pd.read_csv(PATENTS, low_memory=False).fillna("")
    organizations = pd.read_csv(ORGANIZATIONS).fillna("")
    researchers = pd.read_csv(RESEARCHERS).fillna("")

    # ---------------- Latest Publications ----------------

    latest = publications.sort_values(
        by="publication_year",
        ascending=False
    ).head(10)

    latest_publications = latest[
        ["title", "publication_year", "type", "cited_by_count"]
    ].to_dict(orient="records")

    # ---------------- Emerging Technologies ----------------

    keywords = [
        "Artificial Intelligence",
        "Machine Learning",
        "Deep Learning",
        "Generative AI",
        "LLM",
        "Quantum",
        "Robotics",
        "IoT",
        "Blockchain",
        "Cybersecurity"
    ]

    technologies = []

    titles = publications["title"].astype(str).str.lower()

    for keyword in keywords:

        count = titles.str.contains(
            keyword.lower(),
            na=False
        ).sum()

        if count > 0:
            technologies.append({
                "name": keyword,
                "count": int(count)
            })

    technologies = sorted(
        technologies,
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    # ---------------- Dynamic Alerts ----------------

    latest_year = int(
        publications["publication_year"].max()
    )

    total_publications = len(publications)
    total_funding = len(funding)
    total_patents = len(patents)
    total_organizations = len(organizations)
    total_researchers = len(researchers)

    alerts = [
        f"📚 {total_publications:,} publications indexed in the platform.",
        f"📅 Latest publication year: {latest_year}.",
        f"💰 {total_funding:,} funding projects available.",
        f"📜 {total_patents:,} patents indexed worldwide.",
        f"🏢 {total_organizations:,} research organizations available.",
        f"👨‍🔬 {total_researchers:,} researcher profiles available."
    ]

    return jsonify({
        "latest_publications": latest_publications,
        "emerging_technologies": technologies,
        "alerts": alerts
    })