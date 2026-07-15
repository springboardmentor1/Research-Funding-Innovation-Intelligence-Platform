from flask import Blueprint, jsonify, request
import pandas as pd

publications_bp = Blueprint("publications", __name__)

# Load dataset once
df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

# Replace NaN values with empty strings
df = df.fillna("")


@publications_bp.route("/publications", methods=["GET"])
def publications():

    # Pagination parameters
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)

    # Search parameter
    search = request.args.get("search", default="", type=str).lower()

    filtered_df = df

    # Search by title
    if search:
        filtered_df = filtered_df[
            filtered_df["title"].str.lower().str.contains(search, na=False)
        ]

    total_records = len(filtered_df)

    start = (page - 1) * per_page
    end = start + per_page

    paginated_df = filtered_df.iloc[start:end]

    return jsonify({
        "page": page,
        "per_page": per_page,
        "total_records": total_records,
        "total_pages": (total_records + per_page - 1) // per_page,
        "data": paginated_df.to_dict(orient="records")
    })