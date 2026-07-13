from flask import Blueprint, jsonify

publications_bp = Blueprint("publications", __name__)

@publications_bp.route("/publications", methods=["GET"])
def get_publications():

    publications = [
        {
            "id": 1,
            "title": "Artificial Intelligence in Healthcare",
            "authors": "John Smith",
            "year": 2024,
            "citations": 120
        },
        {
            "id": 2,
            "title": "Machine Learning for Climate Change",
            "authors": "Alice Brown",
            "year": 2023,
            "citations": 95
        }
    ]

    return jsonify(publications)