from flask import Blueprint, jsonify, request
import pandas as pd

patents_bp = Blueprint("patents", __name__)

df = pd.read_csv(
    "../datasets/patents/patents.csv",
    low_memory=False
).fillna("")

print("Patents loaded:", len(df))


@patents_bp.route("/patents")
def patents():

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    search = request.args.get("search", "").lower()
    sort = request.args.get("sort", "newest")
    status = request.args.get("status", "")

    filtered = df.copy()

    # Search
    if search:
        filtered = filtered[
            filtered["Title"]
            .astype(str)
            .str.lower()
            .str.contains(search, na=False)
        ]

    # Status Filter
    if status:
        filtered = filtered[
            filtered["Status"]
            .astype(str)
            .str.lower()
            ==
            status.lower()
        ]

    # Sorting
    if sort == "title_asc":
        filtered = filtered.sort_values("Title")

    elif sort == "title_desc":
        filtered = filtered.sort_values(
            "Title",
            ascending=False
        )

    elif sort == "newest":
        filtered = filtered.sort_values(
            "Publication Date(U/S 11A)",
            ascending=False
        )

    elif sort == "oldest":
        filtered = filtered.sort_values(
            "Publication Date(U/S 11A)"
        )

    total = len(filtered)

    total_pages = (total + per_page - 1) // per_page

    start = (page - 1) * per_page
    end = start + per_page

    return jsonify({

        "page": page,

        "per_page": per_page,

        "total_records": total,

        "total_pages": total_pages,

        "data": filtered.iloc[start:end].to_dict(
            orient="records"
        )

    })