from flask import Blueprint, jsonify

funding_bp = Blueprint("funding", __name__)

@funding_bp.route("/funding", methods=["GET"])
def get_funding():

    funding = [
        {
            "agency": "NSF",
            "amount": 250000,
            "year": 2024
        },
        {
            "agency": "DST India",
            "amount": 500000,
            "year": 2023
        }
    ]

    return jsonify(funding)