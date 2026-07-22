from flask import Blueprint, request, jsonify
import pandas as pd

search_bp = Blueprint("search", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"
FUNDING = "../datasets/funding/nih_funding.csv"
PATENTS = "../datasets/patents/patents.csv"
ORGANIZATIONS = "../datasets/organizations/organizations.csv"
RESEARCHERS = "../datasets/researchers/researchers.csv"


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

    if query == "":
        return jsonify(results)

    # ---------------- Publications ----------------

    publications = pd.read_csv(PUBLICATIONS).fillna("")

    if "title" in publications.columns:
        mask = publications["title"].astype(str).str.lower().str.contains(query, na=False)
        results["publications"] = publications[mask].head(10).to_dict(orient="records")

    # ---------------- Funding ----------------

    funding = pd.read_csv(FUNDING, low_memory=False).fillna("")

    mask = pd.Series(False, index=funding.index)

    if "project_title" in funding.columns:
        mask |= funding["project_title"].astype(str).str.lower().str.contains(query, na=False)

    if "organization" in funding.columns:
        mask |= funding["organization"].astype(str).str.lower().str.contains(query, na=False)

    if "principal_investigator" in funding.columns:
        mask |= funding["principal_investigator"].astype(str).str.lower().str.contains(query, na=False)

    results["funding"] = funding[mask].head(10).to_dict(orient="records")

    # ---------------- Patents ----------------

    patents = pd.read_csv(
        PATENTS,
        low_memory=False
    ).fillna("")

    mask = pd.Series(False, index=patents.index)

    if "Title" in patents.columns:
        mask |= patents["Title"].astype(str).str.lower().str.contains(query, na=False)

    if "Inventor Name" in patents.columns:
        mask |= patents["Inventor Name"].astype(str).str.lower().str.contains(query, na=False)

    if "Applicant Name" in patents.columns:
        mask |= patents["Applicant Name"].astype(str).str.lower().str.contains(query, na=False)

    results["patents"] = patents[mask].head(10).to_dict(orient="records")

    # ---------------- Organizations ----------------

    organizations = pd.read_csv(ORGANIZATIONS).fillna("")

    mask = pd.Series(False, index=organizations.index)

    if "organization_name" in organizations.columns:
        mask |= organizations["organization_name"].astype(str).str.lower().str.contains(query, na=False)

    if "country" in organizations.columns:
        mask |= organizations["country"].astype(str).str.lower().str.contains(query, na=False)

    results["organizations"] = organizations[mask].head(10).to_dict(orient="records")

    # ---------------- Researchers ----------------

    researchers = pd.read_csv(RESEARCHERS).fillna("")

    mask = pd.Series(False, index=researchers.index)

    if "researcher_name" in researchers.columns:
        mask |= researchers["researcher_name"].astype(str).str.lower().str.contains(query, na=False)

    if "institution" in researchers.columns:
        mask |= researchers["institution"].astype(str).str.lower().str.contains(query, na=False)

    if "country" in researchers.columns:
        mask |= researchers["country"].astype(str).str.lower().str.contains(query, na=False)

    results["researchers"] = researchers[mask].head(10).to_dict(orient="records")

    return jsonify(results)