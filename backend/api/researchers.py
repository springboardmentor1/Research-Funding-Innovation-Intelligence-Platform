from flask import Blueprint, jsonify

researchers_bp = Blueprint("researchers", __name__)

@researchers_bp.route("/researchers", methods=["GET"])
def get_researchers():

    researchers = [
        {
            "name": "John Smith",
            "field": "Artificial Intelligence"
        },
        {
            "name": "Alice Brown",
            "field": "Machine Learning"
        }
    ]

    return jsonify(researchers)