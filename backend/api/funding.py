from flask import Blueprint, jsonify
import pandas as pd

funding_bp = Blueprint("funding", __name__)

@funding_bp.route("/funding")
def funding():

    df = pd.read_csv("../datasets/funding/nih_funding.csv")

    df = df.fillna("")

    return jsonify(
        df.head(100).to_dict(orient="records")
    )