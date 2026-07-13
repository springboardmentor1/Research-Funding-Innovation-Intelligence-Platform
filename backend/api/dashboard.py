from flask import Blueprint, jsonify
import pandas as pd

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard")
def dashboard():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    return jsonify({
        "publications": len(publications),
        "funding": 2,
        "patents": 2,
        "organizations": 2,
        "researchers": 2
    })
@dashboard_bp.route("/recent-activity")
def recent_activity():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    publications = publications.head(10)

    return publications.fillna("").to_dict(orient="records")
@dashboard_bp.route("/publication-trends")
def publication_trends():

    df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    trends = (
        df.groupby("publication_year")
          .size()
          .reset_index(name="count")
          .sort_values("publication_year")
    )

    return trends.to_dict(orient="records")