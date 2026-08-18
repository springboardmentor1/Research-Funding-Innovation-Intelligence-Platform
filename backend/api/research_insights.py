from flask import Blueprint, jsonify
import pandas as pd

research_insights_bp = Blueprint("research_insights", __name__)


# ==========================================================
# DATASET PATHS
# ==========================================================

PUBLICATIONS_PATH = "../datasets/publications/openalex_cleaned.csv"
FUNDING_PATH = "../datasets/funding/nih_funding.csv"
RESEARCHERS_PATH = "../datasets/researchers/researchers.csv"


# ==========================================================
# LOAD DATASETS ONCE
# ==========================================================

print("\n==============================================")
print("Loading research insight datasets...")
print("==============================================")


try:
    publications = pd.read_csv(
        PUBLICATIONS_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Research publications loaded: "
        f"{len(publications):,}"
    )

except Exception as e:

    print(
        "✗ Research publications loading error:",
        e
    )

    publications = pd.DataFrame()


try:
    funding = pd.read_csv(
        FUNDING_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Research funding loaded: "
        f"{len(funding):,}"
    )

except Exception as e:

    print(
        "✗ Research funding loading error:",
        e
    )

    funding = pd.DataFrame()


try:
    researchers = pd.read_csv(
        RESEARCHERS_PATH,
        low_memory=False
    ).fillna("")

    print(
        f"✓ Researchers loaded: "
        f"{len(researchers):,}"
    )

except Exception as e:

    print(
        "✗ Researchers loading error:",
        e
    )

    researchers = pd.DataFrame()


print("Research insight datasets ready.")
print("==============================================\n")


# ==========================================================
# PRE-CALCULATE TOP RESEARCH AREA
# ==========================================================

top_area = "Artificial Intelligence"


if (
    not publications.empty
    and "title" in publications.columns
):

    titles = (
        publications["title"]
        .astype(str)
        .str.lower()
    )

    ai_count = titles.str.contains(
        "artificial intelligence|machine learning|deep learning|ai",
        na=False,
        regex=True
    ).sum()

    cyber_count = titles.str.contains(
        "cyber",
        na=False,
        regex=False
    ).sum()

    iot_count = titles.str.contains(
        "iot",
        na=False,
        regex=False
    ).sum()

    blockchain_count = titles.str.contains(
        "blockchain",
        na=False,
        regex=False
    ).sum()

    research_area_counts = {
        "Artificial Intelligence": int(ai_count),
        "Cybersecurity": int(cyber_count),
        "IoT": int(iot_count),
        "Blockchain": int(blockchain_count),
    }

    top_area = max(
        research_area_counts,
        key=research_area_counts.get
    )


# ==========================================================
# PRE-CALCULATE MOST ACTIVE COUNTRY
# ==========================================================

top_country = "Unknown"


if (
    not researchers.empty
    and "country" in researchers.columns
):

    country_counts = (
        researchers["country"]
        .astype(str)
        .str.strip()
        .replace("", "Unknown")
        .value_counts()
    )

    if not country_counts.empty:
        top_country = country_counts.index[0]


# ==========================================================
# PRE-CALCULATE HIGHEST FUNDING ORGANIZATION
# ==========================================================

top_organization = "Unknown"


if (
    not funding.empty
    and "organization" in funding.columns
):

    organization_counts = (
        funding["organization"]
        .astype(str)
        .str.strip()
        .replace("", "Unknown")
        .value_counts()
    )

    if not organization_counts.empty:
        top_organization = organization_counts.index[0]


# ==========================================================
# PRE-CALCULATE MOST ACTIVE RESEARCHER
# ==========================================================

top_researcher = "Unknown"


if (
    not researchers.empty
    and "researcher_name" in researchers.columns
):

    researcher_counts = (
        researchers["researcher_name"]
        .astype(str)
        .str.strip()
        .replace("", "Unknown")
        .value_counts()
    )

    if not researcher_counts.empty:
        top_researcher = researcher_counts.index[0]


# ==========================================================
# TRENDING TECHNOLOGY
# ==========================================================

# Current project logic
trending = "Generative AI"


# ==========================================================
# PRE-CALCULATED RESEARCH INSIGHTS
# ==========================================================

research_insights_data = {

    "top_area": top_area,

    "top_country": top_country,

    "top_organization": top_organization,

    "top_researcher": top_researcher,

    "trending": trending,

    "total_publications": len(publications)

}


print("Research insights pre-calculated.")


# ==========================================================
# RESEARCH INSIGHTS API
# ==========================================================

@research_insights_bp.route("/research-insights")
def research_insights():

    return jsonify(research_insights_data)