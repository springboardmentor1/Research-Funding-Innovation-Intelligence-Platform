from flask import Blueprint, jsonify, request
import pandas as pd

funding_bp = Blueprint("funding", __name__)


# =====================================================
# LOAD DATASET ONCE
# =====================================================

df = pd.read_csv(
    "../datasets/funding/nih_funding.csv",
    low_memory=False
)

print("Funding records loaded:", len(df))

df = df.fillna("")


# =====================================================
# CONVERT NUMERIC COLUMNS
# =====================================================

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


# =====================================================
# CREATE PROJECT URL
# =====================================================

def get_project_url(row):

    # -------------------------------------------------
    # 1. If dataset already contains a URL
    # -------------------------------------------------

    possible_url_columns = [
        "project_url",
        "project_link",
        "url",
        "link",
        "nih_url"
    ]

    for column in possible_url_columns:

        if column in row.index:

            value = str(row[column]).strip()

            if value and value.lower() not in ["nan", "none"]:

                if value.startswith("http://") or value.startswith("https://"):
                    return value


    # -------------------------------------------------
    # 2. Try using project number
    # -------------------------------------------------

    possible_project_columns = [
        "project_number",
        "project_num",
        "application_number",
        "core_project_num"
    ]

    for column in possible_project_columns:

        if column in row.index:

            project_number = str(row[column]).strip()

            if project_number and project_number.lower() not in [
                "nan",
                "none"
            ]:

                # NIH RePORTER project search
                return (
                    "https://reporter.nih.gov/search/"
                    + project_number
                )


    # -------------------------------------------------
    # 3. No URL available
    # -------------------------------------------------

    return ""


# =====================================================
# FUNDING API
# =====================================================

@funding_bp.route("/funding", methods=["GET"])
def funding():

    page = request.args.get(
        "page",
        1,
        type=int
    )

    per_page = request.args.get(
        "per_page",
        20,
        type=int
    )

    search = request.args.get(
        "search",
        "",
        type=str
    ).lower()

    sort = request.args.get(
        "sort",
        "newest",
        type=str
    )

    year = request.args.get(
        "year",
        "",
        type=str
    )

    organization = request.args.get(
        "organization",
        "",
        type=str
    )


    # =================================================
    # COPY DATAFRAME
    # =================================================

    filtered_df = df.copy()


    # =================================================
    # SEARCH
    # =================================================

    if search:

        filtered_df = filtered_df[

            filtered_df["project_title"]
            .astype(str)
            .str.lower()
            .str.contains(
                search,
                na=False
            )

            |

            filtered_df["organization"]
            .astype(str)
            .str.lower()
            .str.contains(
                search,
                na=False
            )

            |

            filtered_df["principal_investigator"]
            .astype(str)
            .str.lower()
            .str.contains(
                search,
                na=False
            )

        ]


    # =================================================
    # FISCAL YEAR FILTER
    # =================================================

    if year != "":

        filtered_df = filtered_df[
            filtered_df["fiscal_year"]
            .astype(str) == year
        ]


    # =================================================
    # ORGANIZATION FILTER
    # =================================================

    if organization != "":

        filtered_df = filtered_df[
            filtered_df["organization"] == organization
        ]


    # =================================================
    # SORTING
    # =================================================

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


    # =================================================
    # PAGINATION
    # =================================================

    total_records = len(filtered_df)

    total_pages = (
        total_records + per_page - 1
    ) // per_page

    start = (page - 1) * per_page

    end = start + per_page

    paginated_df = filtered_df.iloc[start:end].copy()


    # =================================================
    # ADD PROJECT URL
    # =================================================

    paginated_df["project_url"] = paginated_df.apply(
        get_project_url,
        axis=1
    )


    # =================================================
    # RESPONSE
    # =================================================

    return jsonify({

        "page": page,

        "per_page": per_page,

        "total_records": total_records,

        "total_pages": total_pages,

        "data": paginated_df.to_dict(
            orient="records"
        )

    })