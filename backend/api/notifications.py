from flask import Blueprint, jsonify
import pandas as pd

notifications_bp = Blueprint("notifications", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"
FUNDING = "../datasets/funding/nih_funding.csv"
PATENTS = "../datasets/patents/patents.csv"
ORGANIZATIONS = "../datasets/organizations/organizations.csv"
RESEARCHERS = "../datasets/researchers/researchers.csv"


@notifications_bp.route("/notifications")
def notifications():

    publications = pd.read_csv(PUBLICATIONS).fillna("")
    funding = pd.read_csv(FUNDING).fillna("")
    patents = pd.read_csv(PATENTS, low_memory=False).fillna("")
    organizations = pd.read_csv(ORGANIZATIONS).fillna("")
    researchers = pd.read_csv(RESEARCHERS).fillna("")

    data = [
        {
            "icon": "📚",
            "message": f"{len(publications):,} publications indexed",
            "time": "Just now"
        },
        {
            "icon": "💰",
            "message": f"{len(funding):,} funding projects available",
            "time": "2 mins ago"
        },
        {
            "icon": "📜",
            "message": f"{len(patents):,} patents indexed",
            "time": "5 mins ago"
        },
        {
            "icon": "🏢",
            "message": f"{len(organizations):,} organizations available",
            "time": "10 mins ago"
        },
        {
            "icon": "👨‍🔬",
            "message": f"{len(researchers):,} researcher profiles available",
            "time": "Today"
        }
    ]

    return jsonify(data)