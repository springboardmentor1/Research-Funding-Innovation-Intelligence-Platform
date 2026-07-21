from flask import Blueprint, jsonify
import pandas as pd

dashboard_bp = Blueprint("dashboard", __name__)


# ==========================================================
# Dashboard KPI Counts
# ==========================================================

@dashboard_bp.route("/dashboard")
def dashboard():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")
    funding = pd.read_csv("../datasets/funding/nih_funding.csv", low_memory=False)
    patents = pd.read_csv("../datasets/patents/patents.csv", low_memory=False)
    organizations = pd.read_csv("../datasets/organizations/organizations.csv")
    researchers = pd.read_csv("../datasets/researchers/researchers.csv")

    return jsonify({
        "publications": len(publications),
        "funding": len(funding),
        "patents": len(patents),
        "organizations": len(organizations),
        "researchers": len(researchers)
    })


# ==========================================================
# Recent Publications
# ==========================================================

@dashboard_bp.route("/recent-activity")
def recent_activity():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    recent = publications.head(10)

    return jsonify(
        recent.fillna("").to_dict(orient="records")
    )


# ==========================================================
# Publication Trends
# ==========================================================

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
        trends.fillna("").to_dict(orient="records")
    )


# ==========================================================
# Publication Types
# ==========================================================

@dashboard_bp.route("/publication-types")
def publication_types():

    df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    publication_types = (
        df.groupby("type")
          .size()
          .reset_index(name="count")
          .sort_values("count", ascending=False)
    )

    return jsonify(
        publication_types.fillna("").to_dict(orient="records")
    )


# ==========================================================
# Funding Trends
# ==========================================================

@dashboard_bp.route("/funding-trends")
def funding_trends():

    df = pd.read_csv(
        "../datasets/funding/nih_funding.csv",
        low_memory=False
    )

    trends = (
        df.groupby("fiscal_year")
          .size()
          .reset_index(name="count")
          .sort_values("fiscal_year")
    )

    return jsonify(
        trends.fillna("").to_dict(orient="records")
    )

# ==========================================================
# Patent Countries
# ==========================================================

@dashboard_bp.route("/patent-countries")
def patent_countries():

    df = pd.read_csv(
        "../datasets/patents/patents.csv",
        low_memory=False
    )

    if "Applicant Country" in df.columns:

        df["Applicant Country"] = (
            df["Applicant Country"]
            .fillna("Unknown")
            .astype(str)
            .str.replace("#", "", regex=False)
            .str.strip()
        )

        countries = (
            df["Applicant Country"]
            .value_counts()
            .head(10)                    # Top 10 countries only
            .reset_index()
        )

        countries.columns = ["country", "count"]

    else:

        countries = pd.DataFrame({
            "country": [],
            "count": []
        })

    return jsonify(
        countries.to_dict(orient="records")
    )


# ==========================================================
# Dashboard Analytics
# ==========================================================

@dashboard_bp.route("/dashboard/analytics")
def dashboard_analytics():

    publications = pd.read_csv(
        "../datasets/publications/openalex_cleaned.csv"
    )

    patents = pd.read_csv(
        "../datasets/patents/patents.csv",
        low_memory=False
    )

    organizations = pd.read_csv(
        "../datasets/organizations/organizations.csv"
    )

    # -----------------------
    # Top Patent Country
    # -----------------------

    if "Applicant Country" in patents.columns:

        top_country = (
            patents["Applicant Country"]
            .fillna("Unknown")
            .astype(str)
            .str.replace("#", "", regex=False)
            .mode()[0]
        )

    else:

        top_country = "Unknown"

    # -----------------------
    # Top Publication Type
    # -----------------------

    if "type" in publications.columns:

        top_type = (
            publications["type"]
            .fillna("Unknown")
            .mode()[0]
        )

    else:

        top_type = "Unknown"

    # -----------------------
    # Top Organization
    # -----------------------

    if "organization_name" in organizations.columns:

        top_org = organizations["organization_name"].iloc[0]

    elif "display_name" in organizations.columns:

        top_org = organizations["display_name"].iloc[0]

    elif "name" in organizations.columns:

        top_org = organizations["name"].iloc[0]

    else:

        top_org = "Unknown"

    # -----------------------
    # Average Citations
    # -----------------------

    if "cited_by_count" in publications.columns:

        avg_citations = round(
            publications["cited_by_count"].mean(),
            2
        )

    else:

        avg_citations = 0

    return jsonify({

        "top_country": top_country,
        "top_type": top_type,
        "top_org": top_org,
        "avg_citations": avg_citations

    })