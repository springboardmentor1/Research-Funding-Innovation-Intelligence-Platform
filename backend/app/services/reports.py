"""
Reports & Export System (spec section 11):
  - Funding reports, patent reports, research trend reports, innovation intelligence reports
  - PDF export, Excel export (CSV, which opens natively in Excel/Sheets)
"""
import csv
import io
from datetime import datetime, timezone
from fpdf import FPDF


def funding_csv(opportunities: list) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Title", "Source", "Category", "Min Amount", "Max Amount", "Currency", "Eligible Roles"])
    for o in opportunities:
        writer.writerow([
            o.title, o.source, o.source_category,
            o.min_funding_amount or "", o.max_funding_amount or "", o.currency,
            ", ".join(o.eligible_roles or []),
        ])
    return buf.getvalue()


def patents_csv(patents: list) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Title", "Patent Number", "Assignee", "Filing Date", "Technology Domain", "Citation Count"])
    for p in patents:
        writer.writerow([
            p.title, p.patent_number or "", p.assignee,
            p.filing_date.isoformat() if p.filing_date else "",
            ", ".join(p.technology_domain or []), p.citation_count,
        ])
    return buf.getvalue()


class ReportPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, self.title_text, ln=True)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 6, f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", ln=True)
        self.set_text_color(0, 0, 0)
        self.ln(4)


def innovation_score_pdf(user_name: str, score_result: dict, recommendations: list[dict]) -> bytes:
    pdf = ReportPDF()
    pdf.title_text = f"Innovation Intelligence Report - {user_name}"
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, f"Domain: {score_result['domain']}  |  Maturity: {score_result['maturity_stage']}", ln=True)
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, f"Innovation Score: {score_result['innovation_score']} / 100", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "Score Breakdown", ln=True)
    pdf.set_font("Helvetica", "", 10)
    for key, comp in score_result["breakdown"].items():
        label = key.replace("_", " ").title()
        pdf.cell(0, 7, f"  {label}: {comp['score']} (weight {int(comp['weight'] * 100)}%)", ln=True)

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "Commercialization Recommendations", ln=True)
    pdf.set_font("Helvetica", "", 10)
    for rec in recommendations:
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "B", 10)
        pdf.multi_cell(pdf.epw, 6, f"[{rec['category']}] {rec['recommendation']}")
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(100, 100, 100)
        pdf.multi_cell(pdf.epw, 5, rec["rationale"])
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

    return bytes(pdf.output())
