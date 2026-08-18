from flask import Blueprint, request, jsonify
import pandas as pd

search_bp = Blueprint("search", __name__)

# =====================================================
# DATASET PATHS
# =====================================================

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"
FUNDING = "../datasets/funding/nih_funding.csv"
PATENTS = "../datasets/patents/patents.csv"
ORGANIZATIONS = "../datasets/organizations/organizations.csv"
RESEARCHERS = "../datasets/researchers/researchers.csv"


# =====================================================
# LOAD DATASETS ONCE
# =====================================================

print("Loading search datasets...")

try:
    publications = pd.read_csv(
        PUBLICATIONS,
        low_memory=False
    ).fillna("")

    print(
        f"Publications loaded: {len(publications)} records"
    )

except Exception as e:
    print("Error loading publications:", e)
    publications = pd.DataFrame()


try:
    funding = pd.read_csv(
        FUNDING,
        low_memory=False
    ).fillna("")

    print(
        f"Funding loaded: {len(funding)} records"
    )

except Exception as e:
    print("Error loading funding:", e)
    funding = pd.DataFrame()


try:
    patents = pd.read_csv(
        PATENTS,
        low_memory=False
    ).fillna("")

    print(
        f"Patents loaded: {len(patents)} records"
    )

except Exception as e:
    print("Error loading patents:", e)
    patents = pd.DataFrame()


try:
    organizations = pd.read_csv(
        ORGANIZATIONS,
        low_memory=False
    ).fillna("")

    print(
        f"Organizations loaded: {len(organizations)} records"
    )

except Exception as e:
    print("Error loading organizations:", e)
    organizations = pd.DataFrame()


try:
    researchers = pd.read_csv(
        RESEARCHERS,
        low_memory=False
    ).fillna("")

    print(
        f"Researchers loaded: {len(researchers)} records"
    )

except Exception as e:
    print("Error loading researchers:", e)
    researchers = pd.DataFrame()


print("All search datasets loaded successfully.")


# =====================================================
# SEARCH ROUTE
# =====================================================

@search_bp.route("/search")
def search():

    query = request.args.get("q", "").strip().lower()

    results = {
        "publications": [],
        "funding": [],
        "patents": [],
        "organizations": [],
        "researchers": []
    }

    # -------------------------------------------------
    # Empty search
    # -------------------------------------------------

    if not query:
        return jsonify(results)


    # =================================================
    # PUBLICATIONS
    # =================================================

    if not publications.empty:

        mask = pd.Series(
            False,
            index=publications.index
        )

        if "title" in publications.columns:

            mask |= publications["title"].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        results["publications"] = (
            publications[mask]
            .head(10)
            .to_dict(orient="records")
        )


    # =================================================
    # FUNDING
    # =================================================

    if not funding.empty:

        mask = pd.Series(
            False,
            index=funding.index
        )

        if "project_title" in funding.columns:

            mask |= funding["project_title"].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "organization" in funding.columns:

            mask |= funding["organization"].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "principal_investigator" in funding.columns:

            mask |= funding[
                "principal_investigator"
            ].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        results["funding"] = (
            funding[mask]
            .head(10)
            .to_dict(orient="records")
        )


    # =================================================
    # PATENTS
    # =================================================

    if not patents.empty:

        mask = pd.Series(
            False,
            index=patents.index
        )

        if "Title" in patents.columns:

            mask |= patents["Title"].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "Inventor Name" in patents.columns:

            mask |= patents["Inventor Name"].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "Applicant Name" in patents.columns:

            mask |= patents["Applicant Name"].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        results["patents"] = (
            patents[mask]
            .head(10)
            .to_dict(orient="records")
        )


    # =================================================
    # ORGANIZATIONS
    # =================================================

    if not organizations.empty:

        mask = pd.Series(
            False,
            index=organizations.index
        )

        if "organization_name" in organizations.columns:

            mask |= organizations[
                "organization_name"
            ].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "country" in organizations.columns:

            mask |= organizations[
                "country"
            ].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        results["organizations"] = (
            organizations[mask]
            .head(10)
            .to_dict(orient="records")
        )


    # =================================================
    # RESEARCHERS
    # =================================================

    if not researchers.empty:

        mask = pd.Series(
            False,
            index=researchers.index
        )

        if "researcher_name" in researchers.columns:

            mask |= researchers[
                "researcher_name"
            ].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "institution" in researchers.columns:

            mask |= researchers[
                "institution"
            ].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        if "country" in researchers.columns:

            mask |= researchers[
                "country"
            ].astype(
                str
            ).str.lower().str.contains(
                query,
                na=False,
                regex=False
            )

        results["researchers"] = (
            researchers[mask]
            .head(10)
            .to_dict(orient="records")
        )


    # =================================================
    # RETURN RESULTS
    # =================================================

    return jsonify(results)