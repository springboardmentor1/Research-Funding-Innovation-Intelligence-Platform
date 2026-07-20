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

    df = pd.read_csv(FUNDING)

    data = [[
        "Project",
        "Organization",
        "PI",
        "Year",
        "Award"
    ]]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["project_title"])[:35],
            str(row["organization"])[:20],
            str(row["principal_investigator"])[:18],
            row["fiscal_year"],
            row["award_amount"]
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

    df = pd.read_csv(PATENTS)

    data = [[
        "Patent",
        "Number",
        "Inventor",
        "Country"
    ]]

    for _, row in df.head(30).iterrows():

        data.append([
            str(row["patent_title"])[:35],
            row["patent_number"],
            str(row["inventor"])[:20],
            row["country"]
        ])

    output = "../datasets/patents_report.pdf"

    create_pdf(data, output)

    return send_file(
        output,
        as_attachment=True
    )