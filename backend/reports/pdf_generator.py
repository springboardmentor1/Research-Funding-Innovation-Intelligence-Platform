"""
PDF Report Generator.

Uses ReportLab to create styled PDF reports for:
  - Funding opportunities
  - Research trends
  - Patent analysis
  - Innovation scoring
  - Commercialization recommendations
"""

import io
from datetime import datetime
from typing import List, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
)


# ── Styling ───────────────────────────────────────────────────────────────────

BRAND_COLOR = colors.HexColor("#6366f1")
SUCCESS_COLOR = colors.HexColor("#10b981")
HEADER_BG = colors.HexColor("#1e293b")
ROW_ALT_BG = colors.HexColor("#f8fafc")
BORDER_COLOR = colors.HexColor("#e2e8f0")


def _get_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=BRAND_COLOR,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=16,
    ))
    styles.add(ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=BRAND_COLOR,
        spaceBefore=14,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "CellText",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
    ))
    return styles


def _standard_table_style():
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ROW_ALT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ])


def _build_header(styles, title: str) -> list:
    elements = []
    elements.append(Paragraph(title, styles["ReportTitle"]))
    elements.append(Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles["ReportSubtitle"],
    ))
    elements.append(HRFlowable(
        width="100%", thickness=1, color=BRAND_COLOR, spaceAfter=12
    ))
    return elements


# ── Report Generators ─────────────────────────────────────────────────────────


def generate_funding_pdf(data: List[Dict[str, Any]]) -> bytes:
    """Generate a Funding Opportunities PDF report."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=30, bottomMargin=30)
    styles = _get_styles()
    elements = _build_header(styles, "Funding Opportunities Report")

    elements.append(Paragraph(
        f"Total Opportunities: {len(data)}", styles["SectionHeader"]
    ))

    if data:
        headers = ["Grant Name", "Organization", "Area", "Amount", "Deadline"]
        table_data = [headers]
        for row in data:
            table_data.append([
                Paragraph(str(row.get("Grant", "")), styles["CellText"]),
                str(row.get("Organization", "")),
                str(row.get("Area", "")),
                str(row.get("Amount", "")),
                str(row.get("Deadline", "")),
            ])

        table = Table(table_data, colWidths=[140, 100, 80, 70, 70])
        table.setStyle(_standard_table_style())
        elements.append(table)
    else:
        elements.append(Paragraph("No funding data available.", styles["Normal"]))

    doc.build(elements)
    return buf.getvalue()


def generate_research_pdf(trends: Dict[str, Any], keywords: List[Dict]) -> bytes:
    """Generate a Research Trends PDF report."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=30, bottomMargin=30)
    styles = _get_styles()
    elements = _build_header(styles, "Research Trends Report")

    # Summary
    total = trends.get("total_papers", 0)
    total_cit = trends.get("total_citations", 0)
    avg_cit = trends.get("avg_citations", 0)
    elements.append(Paragraph(
        f"Total Papers: {total} | Total Citations: {total_cit} | Avg Citations: {avg_cit}",
        styles["SectionHeader"],
    ))

    # Yearly trends
    trend_list = trends.get("trends", [])
    if trend_list:
        elements.append(Spacer(1, 8))
        elements.append(Paragraph("Publication Trends by Year", styles["SectionHeader"]))
        headers = ["Year", "Papers", "Growth %"]
        table_data = [headers]
        for t in trend_list:
            table_data.append([
                str(t.get("year", "")),
                str(t.get("count", "")),
                f"{t.get('growth_pct', 0)}%",
            ])
        table = Table(table_data, colWidths=[100, 100, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    # Top keywords
    if keywords:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Top Research Keywords", styles["SectionHeader"]))
        headers = ["Keyword", "Count"]
        table_data = [headers]
        for kw in keywords[:15]:
            table_data.append([
                str(kw.get("keyword", "")),
                str(kw.get("count", "")),
            ])
        table = Table(table_data, colWidths=[200, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    doc.build(elements)
    return buf.getvalue()


def generate_patent_pdf(landscape: Dict[str, Any], trends: Dict[str, Any]) -> bytes:
    """Generate a Patent Analysis PDF report."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=30, bottomMargin=30)
    styles = _get_styles()
    elements = _build_header(styles, "Patent Analysis Report")

    total = landscape.get("total_patents", 0)
    total_tech = landscape.get("total_technologies", 0)
    total_countries = landscape.get("total_countries", 0)
    elements.append(Paragraph(
        f"Total Patents: {total} | Technologies: {total_tech} | Countries: {total_countries}",
        styles["SectionHeader"],
    ))

    # By technology
    by_tech = landscape.get("by_technology", [])
    if by_tech:
        elements.append(Spacer(1, 8))
        elements.append(Paragraph("Patents by Technology", styles["SectionHeader"]))
        table_data = [["Technology", "Count"]]
        for item in by_tech[:15]:
            table_data.append([str(item.get("Technology", "")), str(item.get("count", ""))])
        table = Table(table_data, colWidths=[250, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    # Trends
    trend_list = trends.get("trends", [])
    if trend_list:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Patent Filing Trends", styles["SectionHeader"]))
        table_data = [["Year", "Patents", "Growth %"]]
        for t in trend_list:
            table_data.append([
                str(t.get("year", "")),
                str(t.get("count", "")),
                f"{t.get('growth_pct', 0)}%",
            ])
        table = Table(table_data, colWidths=[100, 100, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    # Top assignees
    by_assignee = landscape.get("by_assignee", [])
    if by_assignee:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Top Patent Assignees", styles["SectionHeader"]))
        table_data = [["Assignee", "Count"]]
        for item in by_assignee[:10]:
            table_data.append([str(item.get("Assignee", "")), str(item.get("count", ""))])
        table = Table(table_data, colWidths=[250, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    doc.build(elements)
    return buf.getvalue()


def generate_innovation_pdf(scores: Dict[str, Any], top_patents: List[Dict]) -> bytes:
    """Generate an Innovation Scoring PDF report."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=30, bottomMargin=30)
    styles = _get_styles()
    elements = _build_header(styles, "Innovation Intelligence Report")

    avg = scores.get("avg_score", 0)
    mx = scores.get("max_score", 0)
    mn = scores.get("min_score", 0)
    elements.append(Paragraph(
        f"Average Score: {avg} | Max: {mx} | Min: {mn}",
        styles["SectionHeader"],
    ))

    elements.append(Spacer(1, 6))
    elements.append(Paragraph("Scoring Weights", styles["Normal"]))
    elements.append(Paragraph(
        "Research Novelty: 30% | Patent Strength: 20% | "
        "Technology Maturity: 15% | Market Potential: 20% | Funding Relevance: 15%",
        styles["Normal"],
    ))

    if top_patents:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Top Innovations", styles["SectionHeader"]))
        table_data = [["Title", "Technology", "Score", "Year"]]
        for p in top_patents[:20]:
            table_data.append([
                Paragraph(str(p.get("title", "")), styles["CellText"]),
                str(p.get("technology", "")),
                str(p.get("innovation_score", "")),
                str(p.get("year", "")),
            ])
        table = Table(table_data, colWidths=[180, 100, 60, 60])
        table.setStyle(_standard_table_style())
        elements.append(table)

    # Distribution
    dist = scores.get("distribution", [])
    if dist:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Score Distribution", styles["SectionHeader"]))
        table_data = [["Range", "Count"]]
        for d in dist:
            table_data.append([str(d.get("range", "")), str(d.get("count", ""))])
        table = Table(table_data, colWidths=[150, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    doc.build(elements)
    return buf.getvalue()


def generate_commercialization_pdf(data: Dict[str, Any]) -> bytes:
    """Generate a Commercialization Report PDF."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=30, bottomMargin=30)
    styles = _get_styles()
    elements = _build_header(styles, "Commercialization Recommendations Report")

    elements.append(Paragraph(
        f"Total Patents Analyzed: {data.get('total_patents', 0)}", styles["SectionHeader"]
    ))

    # Distribution
    dist = data.get("distribution", [])
    if dist:
        elements.append(Paragraph("Recommendation Distribution", styles["SectionHeader"]))
        table_data = [["Action", "Count", "Percentage"]]
        for d in dist:
            table_data.append([
                str(d.get("action", "")),
                str(d.get("count", "")),
                f"{d.get('percentage', 0)}%",
            ])
        table = Table(table_data, colWidths=[150, 80, 80])
        table.setStyle(_standard_table_style())
        elements.append(table)

    # Top commercializable
    top = data.get("top_commercializable", [])
    if top:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Top Commercializable Patents", styles["SectionHeader"]))
        table_data = [["Title", "Technology", "Score", "Action"]]
        for p in top[:15]:
            rec = p.get("recommendation", {})
            table_data.append([
                Paragraph(str(p.get("title", "")), styles["CellText"]),
                str(p.get("technology", "")),
                str(p.get("innovation_score", "")),
                str(rec.get("action", "")),
            ])
        table = Table(table_data, colWidths=[170, 100, 60, 100])
        table.setStyle(_standard_table_style())
        elements.append(table)

    doc.build(elements)
    return buf.getvalue()
