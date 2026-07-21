from flask import Blueprint, jsonify, send_file
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

reports_bp = Blueprint("reports", __name__)

PUBLICATIONS = "../datasets/publications/openalex_cleaned.csv"
FUNDING = "../datasets/funding/nih_funding.csv"
PATENTS = "../datasets/patents/patents.csv"
ORGANIZATIONS = "../datasets/organizations/organizations.csv"
RESEARCHERS = "../datasets/researchers/researchers.csv"


# ---------------------------------------------------
# Helper Function
# ---------------------------------------------------

def create_pdf(data, filename):
    doc = SimpleDocTemplate(filename, pagesize=letter)

    table = Table(data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("GRID", (0,0), (-1,-1), 1, colors.grey),
        ("BACKGROUND", (0,1), (-1,-1), colors.beige),
        ("BOTTOMPADDING", (0,0), (-1,0), 12),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ]))

    doc.build([table])


# ---------------------------------------------------
# Dashboard Summary
# ---------------------------------------------------

@reports_bp.route("/reports")
def reports():

    publications = pd.read_csv(PUBLICATIONS)
    funding = pd.read_csv(FUNDING)
    patents = pd.read_csv(PATENTS)
    organizations = pd.read_csv(ORGANIZATIONS)
    researchers = pd.read_csv(RESEARCHERS)

    return jsonify({
        "publications": len(publications),
        "funding": len(funding),
        "patents": len(patents),
        "organizations": len(organizations),
        "researchers": len(researchers)
    })


# ---------------------------------------------------
# Dashboard Summary CSV
# ---------------------------------------------------

@reports_bp.route("/reports/export")
def export_summary_csv():

    publications = pd.read_csv(PUBLICATIONS)
    funding = pd.read_csv(FUNDING)
    patents = pd.read_csv(PATENTS)
    organizations = pd.read_csv(ORGANIZATIONS)
    researchers = pd.read_csv(RESEARCHERS)

    summary = pd.DataFrame({
        "Dataset": [
            "Publications",
            "Funding",
            "Patents",
            "Organizations",
            "Researchers"
        ],
        "Records": [
            len(publications),
            len(funding),
            len(patents),
            len(organizations),
            len(researchers)
        ]
    })

    output = "../datasets/research_summary.csv"

    summary.to_csv(output, index=False)

    return send_file(
        output,
        as_attachment=True
    )


# ---------------------------------------------------
# Dashboard Summary PDF
# ---------------------------------------------------

@reports_bp.route("/reports/pdf")
def export_summary_pdf():

    publications = pd.read_csv(PUBLICATIONS)
    funding = pd.read_csv(FUNDING)
    patents = pd.read_csv(PATENTS)
    organizations = pd.read_csv(ORGANIZATIONS)
    researchers = pd.read_csv(RESEARCHERS)

    data = [
        ["Dataset", "Records"],
        ["Publications", len(publications)],
        ["Funding", len(funding)],
        ["Patents", len(patents)],
        ["Organizations", len(organizations)],
        ["Researchers", len(researchers)],
    ]

    output = "../datasets/research_summary.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )


# ---------------------------------------------------
# Publications CSV
# ---------------------------------------------------

@reports_bp.route("/reports/publications/csv")
def publications_csv():

    df = pd.read_csv(PUBLICATIONS)

    output = "../datasets/publications_export.csv"

    df.to_csv(output, index=False)

    return send_file(
        output,
        as_attachment=True
    )


# ---------------------------------------------------
# Publications PDF
# ---------------------------------------------------

@reports_bp.route("/reports/publications/pdf")
def publications_pdf():

    df = pd.read_csv(PUBLICATIONS)

    data = [
        [
            "Title",
            "Year",
            "Citations",
            "Type"
        ]
    ]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["title"])[:45],
            row["publication_year"],
            row["cited_by_count"],
            row["type"]
        ])

    output = "../datasets/publications_report.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )

# ---------------------------------------------------
# Funding CSV
# ---------------------------------------------------

@reports_bp.route("/reports/funding/csv")
def funding_csv():

    df = pd.read_csv(FUNDING)

    output = "../datasets/funding_export.csv"

    df.to_csv(output, index=False)

    return send_file(
        output,
        as_attachment=True
    )


# ---------------------------------------------------
# Funding PDF
# ---------------------------------------------------

@reports_bp.route("/reports/funding/pdf")
def funding_pdf():

    df = pd.read_csv(
        FUNDING,
        low_memory=False
    ).fillna("")

    data = [[
        "Project",
        "Organization",
        "Contact PI",
        "Year",
        "Award"
    ]]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["project_title"])[:35],
            str(row["organization.org_name"])[:22],
            str(row["contact_pi_name"])[:20],
            str(row["fiscal_year"]),
            str(row["award_amount"])
        ])

    output = "../datasets/funding_report.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )


# ---------------------------------------------------
# Patents CSV
# ---------------------------------------------------

@reports_bp.route("/reports/patents/csv")
def patents_csv():

    df = pd.read_csv(PATENTS)

    output = "../datasets/patents_export.csv"

    df.to_csv(output, index=False)

    return send_file(
        output,
        as_attachment=True
    )


# ---------------------------------------------------
# Patents PDF
# ---------------------------------------------------

@reports_bp.route("/reports/patents/pdf")
def patents_pdf():

    df = pd.read_csv(
        PATENTS,
        low_memory=False
    ).fillna("")

    data = [[
        "Title",
        "Publication No",
        "Inventor",
        "Applicant Country"
    ]]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["Title"])[:40],
            str(row["Publication Number"]),
            str(row["Inventor Name"])[:25],
            str(row["Applicant Country"]).replace("#", "")
        ])

    output = "../datasets/patents_report.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )
# ---------------------------------------------------
# Organizations CSV
# ---------------------------------------------------

@reports_bp.route("/reports/organizations/csv")
def organizations_csv():

    df = pd.read_csv(ORGANIZATIONS)

    output = "../datasets/organizations_export.csv"

    df.to_csv(output, index=False)

    return send_file(
        output,
        as_attachment=True
    )
# ---------------------------------------------------
# Organizations PDF
# ---------------------------------------------------

@reports_bp.route("/reports/organizations/pdf")
def organizations_pdf():

    df = pd.read_csv(ORGANIZATIONS).fillna("")

    data = [[
        "Organization",
        "Country",
        "Type",
        "City",
        "Works",
        "Citations"
    ]]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["organization_name"])[:35],
            str(row["country"]),
            str(row["type"]),
            str(row["city"])[:20],
            f'{int(row["works_count"]):,}',
            f'{int(row["cited_by_count"]):,}'
        ])

    output = "../datasets/organizations_report.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )
# ---------------------------------------------------
# Researchers CSV
# ---------------------------------------------------

@reports_bp.route("/reports/researchers/csv")
def researchers_csv():

    df = pd.read_csv(RESEARCHERS)

    output = "../datasets/researchers_export.csv"

    df.to_csv(output, index=False)

    return send_file(
        output,
        as_attachment=True
    )
# ---------------------------------------------------
# Researchers PDF
# ---------------------------------------------------

@reports_bp.route("/reports/researchers/pdf")
def researchers_pdf():

    df = pd.read_csv(RESEARCHERS).fillna("")

    data = [[
        "Researcher",
        "Institution",
        "Country",
        "Works",
        "Citations"
    ]]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["researcher_name"])[:30],
            str(row["institution"])[:28],
            str(row["country"]),
            f'{int(row["works_count"]):,}',
            f'{int(row["cited_by_count"]):,}'
        ])

    output = "../datasets/researchers_report.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )