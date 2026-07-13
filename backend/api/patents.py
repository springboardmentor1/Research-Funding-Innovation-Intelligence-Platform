from flask import Blueprint, jsonify
import pandas as pd

patents_bp = Blueprint("patents", __name__)

@patents_bp.route("/patents")
def patents():

    df = pd.read_csv("../datasets/patents/patents.csv")

    df = df.fillna("")

    return jsonify(
        df.to_dict(orient="records")
    )