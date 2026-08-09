from flask import Blueprint, jsonify
import pandas as pd
from urllib.parse import unquote

publication_details_bp = Blueprint("publication_details", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"


@publication_details_bp.route("/publication/<path:doi>")
def publication_details(doi):

    doi = unquote(doi)

    publications = pd.read_csv(PUBLICATIONS).fillna("")

    publication = publications[
        publications["doi"].astype(str) == doi
    ]

    if publication.empty:
        return jsonify({
            "error": "Publication not found"
        }), 404

    return jsonify(
        publication.iloc[0].to_dict()
    )