from flask import Blueprint, jsonify
import pandas as pd

publications_bp = Blueprint("publications", __name__)

@publications_bp.route("/publications")
def publications():

    df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

    return jsonify(df.head(100).to_dict(orient="records"))