from flask import Blueprint, jsonify

organizations_bp = Blueprint("organizations", __name__)

@organizations_bp.route("/organizations", methods=["GET"])
def get_organizations():

    organizations = [
        {
            "name": "MIT",
            "country": "USA"
        },
        {
            "name": "IIT Madras",
            "country": "India"
        }
    ]

    return jsonify(organizations)