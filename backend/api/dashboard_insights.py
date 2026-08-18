from flask import Blueprint, jsonify
import pandas as pd

dashboard_insights_bp = Blueprint("dashboard_insights", __name__)


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
print("Loading dashboard insight datasets...")
print("==============================================")


try:
    publications = pd.read_csv(
        PUBLICATIONS_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Publications loaded: {len(publications):,}"
    )

except Exception as e:
    print("✗ Publications loading error:", e)
    publications = pd.DataFrame()


try:
    funding = pd.read_csv(
        FUNDING_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Funding loaded: {len(funding):,}"
    )

except Exception as e:
    print("✗ Funding loading error:", e)
    funding = pd.DataFrame()


try:
    patents = pd.read_csv(
        PATENTS_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Patents loaded: {len(patents):,}"
    )

except Exception as e:
    print("✗ Patents loading error:", e)
    patents = pd.DataFrame()


try:
    organizations = pd.read_csv(
        ORGANIZATIONS_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Organizations loaded: {len(organizations):,}"
    )

except Exception as e:
    print("✗ Organizations loading error:", e)
    organizations = pd.DataFrame()


try:
    researchers = pd.read_csv(
        RESEARCHERS_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Researchers loaded: {len(researchers):,}"
    )

except Exception as e:
    print("✗ Researchers loading error:", e)
    researchers = pd.DataFrame()


print("Dashboard insight datasets ready.")
print("==============================================\n")


# ==========================================================
# LATEST PUBLICATIONS
# ==========================================================

latest_publications = []


if (
    not publications.empty
    and "publication_year" in publications.columns
):

    latest = publications.copy()

    latest["publication_year_numeric"] = pd.to_numeric(
        latest["publication_year"],
        errors="coerce"
    )

    latest = (
        latest
        .sort_values(
            by="publication_year_numeric",
            ascending=False
        )
        .head(10)
    )

    required_columns = [
        "title",
        "publication_year",
        "type",
        "cited_by_count"
    ]

    available_columns = [
        column
        for column in required_columns
        if column in latest.columns
    ]

    latest_publications = (
        latest[available_columns]
        .fillna("")
        .to_dict(orient="records")
    )


# ==========================================================
# EMERGING TECHNOLOGIES
# ==========================================================

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


if (
    not publications.empty
    and "title" in publications.columns
):

    titles = (
        publications["title"]
        .astype(str)
        .str.lower()
    )

    for keyword in keywords:

        count = titles.str.contains(
            keyword.lower(),
            na=False,
            regex=False
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


# ==========================================================
# LATEST PUBLICATION YEAR
# ==========================================================

latest_year = "Unknown"


if (
    not publications.empty
    and "publication_year" in publications.columns
):

    publication_years = pd.to_numeric(
        publications["publication_year"],
        errors="coerce"
    ).dropna()

    if not publication_years.empty:

        latest_year = int(
            publication_years.max()
        )


# ==========================================================
# DATASET COUNTS
# ==========================================================

total_publications = len(publications)

total_funding = len(funding)

total_patents = len(patents)

total_organizations = len(organizations)

total_researchers = len(researchers)


# ==========================================================
# RESEARCH ALERTS
# ==========================================================

alerts = [

    (
        f"📚 {total_publications:,} "
        f"publications indexed in the platform."
    ),

    (
        f"📅 Latest publication year: "
        f"{latest_year}."
    ),

    (
        f"💰 {total_funding:,} "
        f"funding projects available."
    ),

    (
        f"📜 {total_patents:,} "
        f"patents indexed worldwide."
    ),

    (
        f"🏢 {total_organizations:,} "
        f"research organizations available."
    ),

    (
        f"👨‍🔬 {total_researchers:,} "
        f"researcher profiles available."
    )

]


# ==========================================================
# PRE-CALCULATED DASHBOARD INSIGHTS
# ==========================================================

dashboard_insights_data = {

    "latest_publications": latest_publications,

    "emerging_technologies": technologies,

    "alerts": alerts

}


print("Dashboard insights pre-calculated.")


# ==========================================================
# DASHBOARD INSIGHTS API
# ==========================================================

@dashboard_insights_bp.route("/dashboard-insights")
def dashboard_insights():

    return jsonify(
        dashboard_insights_data
    )