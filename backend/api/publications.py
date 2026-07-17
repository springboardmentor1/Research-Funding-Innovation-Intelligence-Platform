from flask import Blueprint, jsonify, request
import pandas as pd

publications_bp = Blueprint("publications", __name__)

# Load dataset once
df = pd.read_csv("../datasets/publications/openalex_cleaned.csv")

# Replace NaN values
df = df.fillna("")

# Convert citations to numeric
df["cited_by_count"] = pd.to_numeric(
    df["cited_by_count"],
    errors="coerce"
).fillna(0)

# Convert year to numeric
df["publication_year"] = pd.to_numeric(
    df["publication_year"],
    errors="coerce"
).fillna(0)


@publications_bp.route("/publications", methods=["GET"])
def publications():

    # -----------------------
    # Query Parameters
    # -----------------------

    page = request.args.get("page", default=1, type=int)

    per_page = request.args.get(
        "per_page",
        default=20,
        type=int
    )

    search = request.args.get(
        "search",
        default="",
        type=str
    ).lower()

    sort_by = request.args.get(
        "sort_by",
        default="newest",
        type=str
    )

    filtered_df = df.copy()

    # -----------------------
    # Search
    # -----------------------

    if search:

        filtered_df = filtered_df[
            filtered_df["title"]
            .astype(str)
            .str.lower()
            .str.contains(search, na=False)
        ]

    # -----------------------
    # Sorting
    # -----------------------

    if sort_by == "newest":

        filtered_df = filtered_df.sort_values(
            by="publication_year",
            ascending=False
        )

    elif sort_by == "oldest":

        filtered_df = filtered_df.sort_values(
            by="publication_year",
            ascending=True
        )

    elif sort_by == "citations_desc":

        filtered_df = filtered_df.sort_values(
            by="cited_by_count",
            ascending=False
        )

    elif sort_by == "citations_asc":

        filtered_df = filtered_df.sort_values(
            by="cited_by_count",
            ascending=True
        )

    elif sort_by == "title_asc":

        filtered_df = filtered_df.sort_values(
            by="title",
            ascending=True
        )

    elif sort_by == "title_desc":

        filtered_df = filtered_df.sort_values(
            by="title",
            ascending=False
        )

    # -----------------------
    # Pagination
    # -----------------------

    total_records = len(filtered_df)

    total_pages = (
        total_records + per_page - 1
    ) // per_page

    start = (page - 1) * per_page

    end = start + per_page

    paginated_df = filtered_df.iloc[start:end]

    # -----------------------
    # Response
    # -----------------------

    return jsonify({

        "page": page,

        "per_page": per_page,

        "total_records": total_records,

        "total_pages": total_pages,

        "data": paginated_df.to_dict(
            orient="records"
        )

    })