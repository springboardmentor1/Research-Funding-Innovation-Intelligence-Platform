from flask import Blueprint, request, jsonify
import pandas as pd

search_bp = Blueprint("search", __name__)

@search_bp.route("/search")
def search():

    query = request.args.get("q", "").lower()

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")
    funding = pd.read_csv("../datasets/funding/nih_funding.csv")

    # Search Publications
    pub_results = publications[
        publications["title"].fillna("").str.lower().str.contains(query)
    ].head(20)

    # Search Funding
    fund_results = funding[
        funding["project_title"].fillna("").str.lower().str.contains(query)
    ].head(20)

    return jsonify({
        "publications": pub_results.to_dict(orient="records"),
        "funding": fund_results.to_dict(orient="records")
    })