from flask import Blueprint, jsonify

patents_bp = Blueprint("patents", __name__)

@patents_bp.route("/patents", methods=["GET"])
def get_patents():

    patents = [
        {
            "patent_id": "US123456",
            "title": "AI Based Medical Diagnosis",
            "year": 2024
        },
        {
            "patent_id": "IN567890",
            "title": "Smart Agriculture System",
            "year": 2023
        }
    ]

    return jsonify(patents)