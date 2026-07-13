from flask import Blueprint, jsonify
import pandas as pd

organizations_bp = Blueprint("organizations", __name__)

@organizations_bp.route("/organizations")
def organizations():

    df = pd.read_csv("../datasets/organizations/organizations.csv")

    df = df.fillna("")

    return jsonify(df.to_dict(orient="records"))