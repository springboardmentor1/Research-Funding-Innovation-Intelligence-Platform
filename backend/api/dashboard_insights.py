from flask import Blueprint, jsonify
import pandas as pd

dashboard_insights_bp = Blueprint("dashboard_insights", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"


@dashboard_insights_bp.route("/dashboard-insights")
def dashboard_insights():

    publications = pd.read_csv(PUBLICATIONS).fillna("")

    # Latest Publications
    latest = publications.sort_values(
        by="publication_year",
        ascending=False
    ).head(10)

    latest_publications = latest[
        ["title", "publication_year", "type", "cited_by_count"]
    ].to_dict(orient="records")

    # Emerging Technologies
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

    # Alerts
    alerts = [
        f"{len(publications):,} publications indexed",
        "Funding database updated",
        "Patent database synchronized",
        "Global search is available",
        "Analytics dashboard active"
    ]

    return jsonify({
        "latest_publications": latest_publications,
        "emerging_technologies": technologies,
        "alerts": alerts
    })