from flask import Blueprint, request, jsonify
import pandas as pd

search_bp = Blueprint("search", __name__)


@search_bp.route("/search")
def search():

    query = request.args.get("q", "").lower().strip()

    results = {
        "publications": [],
        "funding": [],
        "patents": [],
        "organizations": [],
        "researchers": []
    }

    # ---------------- Publications ----------------

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv").fillna("")

    results["publications"] = publications[
        publications["title"].str.lower().str.contains(query)
    ].head(10).to_dict(orient="records")


    # ---------------- Funding ----------------

    funding = pd.read_csv("../datasets/funding/nih_funding.csv").fillna("")

    if "project_title" in funding.columns:

        results["funding"] = funding[
            funding["project_title"].str.lower().str.contains(query)
        ].head(10).to_dict(orient="records")


    # ---------------- Patents ----------------

    patents = pd.read_csv("../datasets/patents/patents.csv").fillna("")

    results["patents"] = patents[
        patents["patent_title"].str.lower().str.contains(query)
    ].head(10).to_dict(orient="records")


    # ---------------- Organizations ----------------

    organizations = pd.read_csv("../datasets/organizations/organizations.csv").fillna("")

    results["organizations"] = organizations[
        organizations["organization_name"].str.lower().str.contains(query)
    ].head(10).to_dict(orient="records")


    # ---------------- Researchers ----------------

    researchers = pd.read_csv("../datasets/researchers/researchers.csv").fillna("")

    results["researchers"] = researchers[
        researchers["researcher_name"].str.lower().str.contains(query)
    ].head(10).to_dict(orient="records")

    return jsonify(results)