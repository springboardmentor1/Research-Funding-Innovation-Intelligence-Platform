from flask import Blueprint, jsonify
import pandas as pd

researchers_bp = Blueprint("researchers", __name__)

@researchers_bp.route("/researchers")
def researchers():

    df = pd.read_csv("../datasets/researchers/researchers.csv")

    df = df.fillna("")

    return jsonify(
        df.to_dict(orient="records")
    )