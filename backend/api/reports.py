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


@reports_bp.route("/reports/export")
def export_csv():

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

    output_file = "../datasets/research_summary.csv"

    summary.to_csv(output_file, index=False)

    return send_file(
        output_file,
        as_attachment=True
    )


@reports_bp.route("/reports/pdf")
def export_pdf():

    publications = pd.read_csv(PUBLICATIONS)
    funding = pd.read_csv(FUNDING)
    patents = pd.read_csv(PATENTS)
    organizations = pd.read_csv(ORGANIZATIONS)
    researchers = pd.read_csv(RESEARCHERS)

    pdf_file = "../datasets/research_summary.pdf"

    doc = SimpleDocTemplate(pdf_file, pagesize=letter)

    data = [
        ["Dataset", "Number of Records"],
        ["Publications", len(publications)],
        ["Funding", len(funding)],
        ["Patents", len(patents)],
        ["Organizations", len(organizations)],
        ["Researchers", len(researchers)],
    ]

    table = Table(data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR",(0,0),(-1,0),colors.white),

        ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),

        ("GRID",(0,0),(-1,-1),1,colors.grey),

        ("BACKGROUND",(0,1),(-1,-1),colors.beige),

        ("BOTTOMPADDING",(0,0),(-1,0),12),

        ("ALIGN",(0,0),(-1,-1),"CENTER"),
    ]))

    doc.build([table])

    return send_file(
        pdf_file,
        as_attachment=True
    )