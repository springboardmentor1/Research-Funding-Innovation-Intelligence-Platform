from flask import Blueprint, jsonify, request
import pandas as pd

researchers_bp = Blueprint("researchers", __name__)

# Load dataset once
df = pd.read_csv(
    "../datasets/researchers/researchers.csv",
    low_memory=False
).fillna("")

# Convert numeric columns
df["works_count"] = pd.to_numeric(
    df["works_count"],
    errors="coerce"
).fillna(0)

df["cited_by_count"] = pd.to_numeric(
    df["cited_by_count"],
    errors="coerce"
).fillna(0)

print("Researchers loaded:", len(df))


@researchers_bp.route("/researchers", methods=["GET"])
def researchers():

    # ---------------- Pagination ----------------

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)

    # ---------------- Search ----------------

    search = request.args.get(
        "search",
        default="",
        type=str
    ).lower()

    # ---------------- Filters ----------------

    country = request.args.get(
        "country",
        default="",
        type=str
    ).lower()

    # ---------------- Sorting ----------------

    sort = request.args.get(
        "sort",
        default="citations_desc",
        type=str
    )

    filtered = df.copy()

    # Search by researcher name
    if search:
        filtered = filtered[
            filtered["researcher_name"]
            .astype(str)
            .str.lower()
            .str.contains(search, na=False)
        ]

    # Filter by country
    if country:
        filtered = filtered[
            filtered["country"]
            .astype(str)
            .str.lower()
            == country
        ]

    # ---------------- Sorting ----------------

    if sort == "works_desc":
        filtered = filtered.sort_values(
            by="works_count",
            ascending=False
        )

    elif sort == "works_asc":
        filtered = filtered.sort_values(
            by="works_count",
            ascending=True
        )

    elif sort == "citations_desc":
        filtered = filtered.sort_values(
            by="cited_by_count",
            ascending=False
        )

    elif sort == "citations_asc":
        filtered = filtered.sort_values(
            by="cited_by_count",
            ascending=True
        )

    elif sort == "name_asc":
        filtered = filtered.sort_values(
            by="researcher_name",
            ascending=True
        )

    elif sort == "name_desc":
        filtered = filtered.sort_values(
            by="researcher_name",
            ascending=False
        )

    # ---------------- Pagination ----------------

    total_records = len(filtered)

    total_pages = (
        total_records + per_page - 1
    ) // per_page

    start = (page - 1) * per_page
    end = start + per_page

    paginated = filtered.iloc[start:end]

    return jsonify({
        "page": page,
        "per_page": per_page,
        "total_records": total_records,
        "total_pages": total_pages,
        "data": paginated.to_dict(orient="records")
    })