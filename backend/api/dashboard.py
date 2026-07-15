from flask import Blueprint, jsonify
import pandas as pd

dashboard_bp = Blueprint("dashboard", __name__)

# -----------------------------
# Dashboard KPI Counts
# -----------------------------
@dashboard_bp.route("/dashboard")
def dashboard():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")
    funding = pd.read_csv("../datasets/funding/nih_funding.csv")
    patents = pd.read_csv("../datasets/patents/patents.csv")
    organizations = pd.read_csv("../datasets/organizations/organizations.csv")
    researchers = pd.read_csv("../datasets/researchers/researchers.csv")

    return jsonify({
        "publications": len(publications),
        "funding": len(funding),
        "patents": len(patents),
        "organizations": len(organizations),
        "researchers": len(researchers)
    })


# -----------------------------
# Recent Publications
# -----------------------------
@dashboard_bp.route("/recent-activity")
def recent_activity():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    publications = publications.head(10)

    return jsonify(
        publications.fillna("").to_dict(orient="records")
    )


# -----------------------------
# Publication Trend Chart
# -----------------------------
@dashboard_bp.route("/publication-trends")
def publication_trends():

    df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    trends = (
        df.groupby("publication_year")
        .size()
        .reset_index(name="count")
        .sort_values("publication_year")
    )

    return jsonify(
        trends.to_dict(orient="records")
    )
@dashboard_bp.route("/publication-types")
def publication_types():

    df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    types = (
        df.groupby("type")
          .size()
          .reset_index(name="count")
          .sort_values("count", ascending=False)
    )

    return types.fillna("").to_dict(orient="records")
@dashboard_bp.route("/funding-trends")
def funding_trends():

    df = pd.read_csv("../datasets/funding/nih_funding.csv")

    # Group by fiscal year
    trends = (
        df.groupby("fiscal_year")
          .size()
          .reset_index(name="count")
          .sort_values("fiscal_year")
    )

    return trends.fillna("").to_dict(orient="records")
@dashboard_bp.route("/patent-countries")
def patent_countries():

    df = pd.read_csv("../datasets/patents/patents.csv")

    countries = (
        df.groupby("country")
          .size()
          .reset_index(name="count")
          .sort_values("count", ascending=False)
    )

    return countries.fillna("").to_dict(orient="records")
@dashboard_bp.route("/dashboard/analytics")
def dashboard_analytics():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    patents = pd.read_csv("../datasets/patents/patents.csv")

    organizations = pd.read_csv("../datasets/organizations/organizations.csv")

    top_country = patents["country"].mode()[0]

    top_type = publications["type"].mode()[0]

    top_org = organizations["organization_name"].iloc[0]

    avg_citations = round(publications["cited_by_count"].mean(), 2)

    return jsonify({
        "top_country": top_country,
        "top_type": top_type,
        "top_org": top_org,
        "avg_citations": avg_citations
    })