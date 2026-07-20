from flask import Blueprint, jsonify, request
import pandas as pd

organizations_bp = Blueprint("organizations", __name__)

# Load dataset once
df = pd.read_csv("../datasets/organizations/organizations.csv")

# Replace NaN values
df = df.fillna("")

# Convert numeric columns
if "works_count" in df.columns:
    df["works_count"] = pd.to_numeric(
        df["works_count"],
        errors="coerce"
    ).fillna(0)

if "cited_by_count" in df.columns:
    df["cited_by_count"] = pd.to_numeric(
        df["cited_by_count"],
        errors="coerce"
    ).fillna(0)


@organizations_bp.route("/organizations", methods=["GET"])
def organizations():

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)

    search = request.args.get(
        "search",
        default="",
        type=str
    ).lower()

    sort = request.args.get(
        "sort",
        default="works_desc",
        type=str
    )

    country = request.args.get(
        "country",
        default="",
        type=str
    )

    org_type = request.args.get(
        "type",
        default="",
        type=str
    )

    filtered_df = df.copy()

    # ---------------- SEARCH ----------------

    if search:
        filtered_df = filtered_df[
            filtered_df["organization_name"]
            .astype(str)
            .str.lower()
            .str.contains(search, na=False)
        ]

    # ---------------- COUNTRY FILTER ----------------

    if country:
        filtered_df = filtered_df[
            filtered_df["country"] == country
        ]

    # ---------------- TYPE FILTER ----------------

    if org_type:
        filtered_df = filtered_df[
            filtered_df["type"] == org_type
        ]

    # ---------------- SORT ----------------

    if sort == "works_desc":
        filtered_df = filtered_df.sort_values(
            by="works_count",
            ascending=False
        )

    elif sort == "works_asc":
        filtered_df = filtered_df.sort_values(
            by="works_count",
            ascending=True
        )

    elif sort == "citations_desc":
        filtered_df = filtered_df.sort_values(
            by="cited_by_count",
            ascending=False
        )

    elif sort == "citations_asc":
        filtered_df = filtered_df.sort_values(
            by="cited_by_count",
            ascending=True
        )

    elif sort == "name_asc":
        filtered_df = filtered_df.sort_values(
            by="organization_name",
            ascending=True
        )

    elif sort == "name_desc":
        filtered_df = filtered_df.sort_values(
            by="organization_name",
            ascending=False
        )

    # ---------------- PAGINATION ----------------

    total_records = len(filtered_df)

    total_pages = (
        total_records + per_page - 1
    ) // per_page

    start = (page - 1) * per_page
    end = start + per_page

    paginated_df = filtered_df.iloc[start:end]

    return jsonify({
        "page": page,
        "per_page": per_page,
        "total_records": total_records,
        "total_pages": total_pages,
        "data": paginated_df.to_dict(orient="records")
    })