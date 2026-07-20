from flask import Blueprint, jsonify, request
import pandas as pd

funding_bp = Blueprint("funding", __name__)

# Load dataset once
df = pd.read_csv("../datasets/funding/nih_funding.csv")
print("Funding records loaded:", len(df))

# Replace NaN values
df = df.fillna("")

# Convert numeric columns
if "award_amount" in df.columns:
    df["award_amount"] = pd.to_numeric(
        df["award_amount"],
        errors="coerce"
    ).fillna(0)

if "fiscal_year" in df.columns:
    df["fiscal_year"] = pd.to_numeric(
        df["fiscal_year"],
        errors="coerce"
    ).fillna(0)


@funding_bp.route("/funding", methods=["GET"])
def funding():

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)

    search = request.args.get(
        "search",
        default="",
        type=str
    ).lower()

    # IMPORTANT
    sort = request.args.get(
        "sort",
        default="newest",
        type=str
    )

    filtered_df = df.copy()

    # ---------------- SEARCH ----------------

    if search:
        filtered_df = filtered_df[
            filtered_df["project_title"]
            .astype(str)
            .str.lower()
            .str.contains(search, na=False)
        ]

    # ---------------- SORT ----------------

    if sort == "newest":
        filtered_df = filtered_df.sort_values(
            by="fiscal_year",
            ascending=False
        )

    elif sort == "oldest":
        filtered_df = filtered_df.sort_values(
            by="fiscal_year",
            ascending=True
        )

    elif sort == "amount_desc":
        filtered_df = filtered_df.sort_values(
            by="award_amount",
            ascending=False
        )

    elif sort == "amount_asc":
        filtered_df = filtered_df.sort_values(
            by="award_amount",
            ascending=True
        )

    elif sort == "title_asc":
        filtered_df = filtered_df.sort_values(
            by="project_title",
            ascending=True
        )

    elif sort == "title_desc":
        filtered_df = filtered_df.sort_values(
            by="project_title",
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