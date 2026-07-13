from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from flask import Blueprint, jsonify, send_file
import pandas as pd
import csv

reports_bp = Blueprint("reports", __name__)


# ===========================
# Reports Summary API
# ===========================
@reports_bp.route("/reports")
def reports():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")
    funding = pd.read_csv("../datasets/funding/nih_funding.csv")
    patents = pd.read_csv("../datasets/patents/patents.csv")
    organizations = pd.read_csv("../datasets/organizations/organizations.csv")
    researchers = pd.read_csv("../datasets/researchers/researchers.csv")

    return jsonify({
        "publications": len(publications),
        "funding": len(funding),
        "patents": len(patents),
        "organizations": len(organizations),
        "researchers": len(researchers)
    })


# ===========================
# Download CSV API
# ===========================
@reports_bp.route("/reports/export")
def export_report():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")
    funding = pd.read_csv("../datasets/funding/nih_funding.csv")
    patents = pd.read_csv("../datasets/patents/patents.csv")
    organizations = pd.read_csv("../datasets/organizations/organizations.csv")
    researchers = pd.read_csv("../datasets/researchers/researchers.csv")

    filename = "report_summary.csv"

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow(["Module", "Count"])
        writer.writerow(["Publications", len(publications)])
        writer.writerow(["Funding", len(funding)])
        writer.writerow(["Patents", len(patents)])
        writer.writerow(["Organizations", len(organizations)])
        writer.writerow(["Researchers", len(researchers)])

    return send_file(filename, as_attachment=True)


@reports_bp.route("/reports/pdf")
def export_pdf():

    publications = pd.read_csv("../datasets/publications/openalex_cleaned.csv")
    funding = pd.read_csv("../datasets/funding/nih_funding.csv")
    patents = pd.read_csv("../datasets/patents/patents.csv")
    organizations = pd.read_csv("../datasets/organizations/organizations.csv")
    researchers = pd.read_csv("../datasets/researchers/researchers.csv")

    filename = "Research_Report.pdf"

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    elements = []

    elements.append(Paragraph("<b>Research Funding & Innovation Intelligence Platform</b>", styles["Title"]))

    elements.append(Paragraph("<br/>", styles["Normal"]))

    elements.append(Paragraph(f"Total Publications : {len(publications)}", styles["Heading2"]))
    elements.append(Paragraph(f"Total Funding Projects : {len(funding)}", styles["Heading2"]))
    elements.append(Paragraph(f"Total Patents : {len(patents)}", styles["Heading2"]))
    elements.append(Paragraph(f"Total Organizations : {len(organizations)}", styles["Heading2"]))
    elements.append(Paragraph(f"Total Researchers : {len(researchers)}", styles["Heading2"]))

    doc.build(elements)

    return send_file(filename, as_attachment=True)