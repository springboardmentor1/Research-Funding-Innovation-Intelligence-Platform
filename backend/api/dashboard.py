from flask import Blueprint, jsonify
import pandas as pd

dashboard_bp = Blueprint("dashboard", __name__)


# ==========================================================
# DATASET PATHS
# ==========================================================

PUBLICATIONS_PATH = "../datasets/publications/openalex_cleaned.csv"
FUNDING_PATH = "../datasets/funding/nih_funding.csv"
PATENTS_PATH = "../datasets/patents/patents.csv"
ORGANIZATIONS_PATH = "../datasets/organizations/organizations.csv"
RESEARCHERS_PATH = "../datasets/researchers/researchers.csv"


# ==========================================================
# LOAD DATASETS ONCE
# ==========================================================

print("\n==============================================")
print("Loading dashboard datasets...")
print("==============================================")

try:
    publications = pd.read_csv(
        PUBLICATIONS_PATH,
        low_memory=False
    ).fillna("")

    print(f"✓ Publications loaded: {len(publications):,}")

except Exception as e:
    print("✗ Publications loading error:", e)
    publications = pd.DataFrame()


try:
    funding = pd.read_csv(
        FUNDING_PATH,
        low_memory=False
    ).fillna("")

    print(f"✓ Funding loaded: {len(funding):,}")

except Exception as e:
    print("✗ Funding loading error:", e)
    funding = pd.DataFrame()


try:
    patents = pd.read_csv(
        PATENTS_PATH,
        low_memory=False
    ).fillna("")

    print(f"✓ Patents loaded: {len(patents):,}")

except Exception as e:
    print("✗ Patents loading error:", e)
    patents = pd.DataFrame()


try:
    organizations = pd.read_csv(
        ORGANIZATIONS_PATH,
        low_memory=False
    ).fillna("")

    print(f"✓ Organizations loaded: {len(organizations):,}")

except Exception as e:
    print("✗ Organizations loading error:", e)
    organizations = pd.DataFrame()


try:
    researchers = pd.read_csv(
        RESEARCHERS_PATH,
        low_memory=False
    ).fillna("")

    print(f"✓ Researchers loaded: {len(researchers):,}")

except Exception as e:
    print("✗ Researchers loading error:", e)
    researchers = pd.DataFrame()


print("==============================================")
print("Dashboard datasets ready.")
print("==============================================\n")


# ==========================================================
# PRE-CALCULATE DASHBOARD COUNTS
# ==========================================================

dashboard_counts = {
    "publications": len(publications),
    "funding": len(funding),
    "patents": len(patents),
    "organizations": len(organizations),
    "researchers": len(researchers)
}


# ==========================================================
# PRE-CALCULATE PUBLICATION TRENDS
# ==========================================================

if (
    not publications.empty
    and "publication_year" in publications.columns
):

    publication_trends_data = (
        publications
        .groupby("publication_year")
        .size()
        .reset_index(name="count")
        .sort_values("publication_year")
        .fillna("")
        .to_dict(orient="records")
    )

else:

    publication_trends_data = []


# ==========================================================
# PRE-CALCULATE PUBLICATION TYPES
# ==========================================================

if (
    not publications.empty
    and "type" in publications.columns
):

    publication_types_data = (
        publications
        .groupby("type")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .fillna("")
        .to_dict(orient="records")
    )

else:

    publication_types_data = []


# ==========================================================
# PRE-CALCULATE FUNDING TRENDS
# ==========================================================

if (
    not funding.empty
    and "fiscal_year" in funding.columns
):

    funding_trends_data = (
        funding
        .groupby("fiscal_year")
        .size()
        .reset_index(name="count")
        .sort_values("fiscal_year")
        .fillna("")
        .to_dict(orient="records")
    )

else:

    funding_trends_data = []


# ==========================================================
# PRE-CALCULATE PATENT COUNTRIES
# ==========================================================

if (
    not patents.empty
    and "Applicant Country" in patents.columns
):

    patent_country_series = (
        patents["Applicant Country"]
        .fillna("Unknown")
        .astype(str)
        .str.replace("#", "", regex=False)
        .str.strip()
    )

    patent_countries_data = (
        patent_country_series
        .value_counts()
        .head(10)
        .reset_index()
    )

    patent_countries_data.columns = [
        "country",
        "count"
    ]

    patent_countries_data = (
        patent_countries_data
        .to_dict(orient="records")
    )

else:

    patent_countries_data = []


# ==========================================================
# PRE-CALCULATE ANALYTICS
# ==========================================================

# -----------------------
# Top Patent Country
# -----------------------

if (
    not patents.empty
    and "Applicant Country" in patents.columns
):

    country_series = (
        patents["Applicant Country"]
        .fillna("Unknown")
        .astype(str)
        .str.replace("#", "", regex=False)
        .str.strip()
    )

    if not country_series.empty:
        top_country = country_series.mode().iloc[0]
    else:
        top_country = "Unknown"

else:

    top_country = "Unknown"


# -----------------------
# Top Publication Type
# -----------------------

if (
    not publications.empty
    and "type" in publications.columns
):

    type_series = (
        publications["type"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
    )

    if not type_series.empty:
        top_type = type_series.mode().iloc[0]
    else:
        top_type = "Unknown"

else:

    top_type = "Unknown"


# -----------------------
# Top Organization
# -----------------------

if not organizations.empty:

    if "organization_name" in organizations.columns:

        org_series = (
            organizations["organization_name"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    elif "display_name" in organizations.columns:

        org_series = (
            organizations["display_name"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    elif "name" in organizations.columns:

        org_series = (
            organizations["name"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    else:

        org_series = pd.Series(dtype=str)

    org_series = org_series[org_series != ""]

    if not org_series.empty:
        top_org = org_series.iloc[0]
    else:
        top_org = "Unknown"

else:

    top_org = "Unknown"


# -----------------------
# Average Citations
# -----------------------

if (
    not publications.empty
    and "cited_by_count" in publications.columns
):

    citation_values = pd.to_numeric(
        publications["cited_by_count"],
        errors="coerce"
    )

    avg_citations = round(
        citation_values.mean(),
        2
    )

    if pd.isna(avg_citations):
        avg_citations = 0

else:

    avg_citations = 0


# Store analytics in memory
dashboard_analytics_data = {

    "top_country": top_country,

    "top_type": top_type,

    "top_org": top_org,

    "avg_citations": avg_citations

}


print("Dashboard analytics pre-calculated.")


# ==========================================================
# DASHBOARD KPI COUNTS
# ==========================================================

@dashboard_bp.route("/dashboard")
def dashboard():

    return jsonify(dashboard_counts)


# ==========================================================
# RECENT PUBLICATIONS
# ==========================================================

@dashboard_bp.route("/recent-activity")
def recent_activity():

    if publications.empty:
        return jsonify([])

    recent = publications.head(10)

    return jsonify(
        recent
        .fillna("")
        .to_dict(orient="records")
    )


# ==========================================================
# PUBLICATION TRENDS
# ==========================================================

@dashboard_bp.route("/publication-trends")
def publication_trends():

    return jsonify(publication_trends_data)


# ==========================================================
# PUBLICATION TYPES
# ==========================================================

@dashboard_bp.route("/publication-types")
def publication_types():

    return jsonify(publication_types_data)


# ==========================================================
# FUNDING TRENDS
# ==========================================================

@dashboard_bp.route("/funding-trends")
def funding_trends():

    return jsonify(funding_trends_data)


# ==========================================================
# PATENT COUNTRIES
# ==========================================================

@dashboard_bp.route("/patent-countries")
def patent_countries():

    return jsonify(patent_countries_data)


# ==========================================================
# DASHBOARD ANALYTICS
# ==========================================================

@dashboard_bp.route("/dashboard/analytics")
def dashboard_analytics():

    return jsonify(dashboard_analytics_data)