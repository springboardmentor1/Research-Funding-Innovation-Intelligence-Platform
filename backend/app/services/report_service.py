import os
import json
import csv
import io
import uuid
import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

# Locate base directory relative to backend root
# backend/reports/generated/ and backend/reports/templates/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
GENERATED_DIR = os.path.join(REPORTS_DIR, "generated")
TEMPLATES_DIR = os.path.join(REPORTS_DIR, "templates")

# Ensure required directories exist
os.makedirs(GENERATED_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

class ReportRequest(BaseModel):
    report_type: str = Field(..., description="Type of report: patent_landscape, technology_intelligence, innovation_scores, commercialization, funding_matrix")
    format: str = Field("pdf", description="Output format: pdf, csv, json")
    domain: Optional[str] = "Robotics & AI"
    date_from: Optional[str] = "2024-01-01"
    date_to: Optional[str] = "2026-08-16"

REPORT_TYPES = {
    "patent_landscape": "Patent Landscape & Intellectual Property Analysis Report",
    "technology_intelligence": "Technology Intelligence & Emergent Trends Report",
    "innovation_scores": "Institutional Innovation Standing & Scoring Matrix Report",
    "commercialization": "Technology Transfer & Commercialization Strategy Report",
    "funding_matrix": "Capital Grants & Funding Opportunity Alignment Report"
}

def generate_report_content(request: ReportRequest) -> Dict[str, Any]:
    """Generate structured analytical payload based on report type."""
    report_title = REPORT_TYPES.get(request.report_type, "Executive Intelligence Report")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Base summary metrics
    summary = {
        "report_title": report_title,
        "report_type": request.report_type,
        "format": request.format.lower(),
        "target_domain": request.domain,
        "generated_at": timestamp,
        "date_range": f"{request.date_from} to {request.date_to}"
    }

    if request.report_type == "patent_landscape":
        data_rows = [
            {"ipc_code": "G06N 3/08", "domain": "Neural Network Training", "patent_count": 142, "status": "Active", "top_assignee": "Cyberdyne Systems"},
            {"ipc_code": "B25J 9/16", "domain": "Robotic Control Systems", "patent_count": 98, "status": "Granted", "top_assignee": "MIT Tech"},
            {"ipc_code": "G06F 18/24", "domain": "Pattern Recognition", "patent_count": 76, "status": "Pending", "top_assignee": "Stanford Labs"}
        ]
    elif request.report_type == "technology_intelligence":
        data_rows = [
            {"technology": "Spatial Autonomous Navigation", "trl_level": 7, "growth_rate": "24.5%", "maturity": "High Growth"},
            {"technology": "Quantum Neural Optimizers", "trl_level": 4, "growth_rate": "41.0%", "maturity": "Emergent"},
            {"technology": "Neuromorphic Hardware Chips", "trl_level": 6, "growth_rate": "18.2%", "maturity": "Expanding"}
        ]
    elif request.report_type == "innovation_scores":
        data_rows = [
            {"entity": "Dr. Sarah Connor", "domain": "Robotics & AI", "innovation_score": 88.5, "percentile": "Top 2%"},
            {"entity": "Cyberdyne Innovation Labs", "domain": "Autonomous Hardware", "innovation_score": 91.2, "percentile": "Top 1%"},
            {"entity": "Biomedical Sensor Group", "domain": "Bio-Tech", "innovation_score": 82.1, "percentile": "Top 5%"}
        ]
    elif request.report_type == "commercialization":
        data_rows = [
            {"project": "Neural Control Unit", "stage": "Licensing Negotiation", "royalty_target_usd": 450000, "investor_grade": "Grade A"},
            {"project": "Biomedical Sensor Array", "stage": "Patent Application", "royalty_target_usd": 250000, "investor_grade": "Grade A-"},
            {"project": "Autonomous Drone Fleet", "stage": "Active License", "royalty_target_usd": 750000, "investor_grade": "Grade A+"}
        ]
    else: # funding_matrix
        data_rows = [
            {"grant_name": "NSF AI Institute for Autonomous Systems", "sponsor": "NSF", "budget_usd": 1500000, "match_percentage": 94.5},
            {"grant_name": "Horizon Europe NextGen Robotics", "sponsor": "EU Commission", "budget_usd": 2200000, "match_percentage": 91.0},
            {"grant_name": "DARPA Autonomous Control Grant", "sponsor": "DARPA", "budget_usd": 850000, "match_percentage": 88.2}
        ]

    return {
        "summary": summary,
        "rows": data_rows
    }

def save_json_report(filepath: str, payload: Dict[str, Any]):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

def save_csv_report(filepath: str, payload: Dict[str, Any]):
    rows = payload.get("rows", [])
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def save_pdf_report(filepath: str, payload: Dict[str, Any]):
    """Generate a clean text/HTML formatted PDF executive report."""
    summary = payload.get("summary", {})
    rows = payload.get("rows", [])
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{summary.get('report_title')}</title>
    <style>
        body {{ font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }}
        .header {{ border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }}
        h1 {{ font-size: 22px; color: #0f172a; margin: 0 0 10px 0; }}
        .meta {{ font-size: 12px; color: #64748b; margin-bottom: 5px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }}
        th {{ background-color: #0f172a; color: #ffffff; text-align: left; padding: 10px; border: 1px solid #334155; }}
        td {{ padding: 10px; border: 1px solid #cbd5e1; }}
        tr:nth-child(even) {{ background-color: #f8fafc; }}
        .footer {{ margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 15px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{summary.get('report_title')}</h1>
        <div class="meta"><strong>Domain:</strong> {summary.get('target_domain')}</div>
        <div class="meta"><strong>Generated At:</strong> {summary.get('generated_at')}</div>
        <div class="meta"><strong>Date Range:</strong> {summary.get('date_range')}</div>
    </div>
    
    <h2>Report Findings</h2>
    <table>
        <thead>
            <tr>
"""
    if rows:
        headers = list(rows[0].keys())
        for h in headers:
            html_content += f"                <th>{h.replace('_', ' ').title()}</th>\n"
        html_content += "            </tr>\n        </thead>\n        <tbody>\n"
        
        for r in rows:
            html_content += "            <tr>\n"
            for h in headers:
                html_content += f"                <td>{r.get(h, '')}</td>\n"
            html_content += "            </tr>\n"
        html_content += "        </tbody>\n    </table>\n"
    
    html_content += f"""
    <div class="footer">
        Generated by Research Funding & Innovation Intelligence Platform • Confidential Executive Document
    </div>
</body>
</html>
"""
    # Write HTML/PDF content to filepath
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)


def create_report(request: ReportRequest) -> Dict[str, Any]:
    """Execute report creation, assign report_id, and write to backend/reports/generated/."""
    report_uuid = str(uuid.uuid4())[:8].upper()
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    fmt = request.format.lower()
    
    report_id = f"REP-{date_str}-{report_uuid}"
    filename = f"{report_id}.{fmt}"
    filepath = os.path.join(GENERATED_DIR, filename)

    payload = generate_report_content(request)
    payload["summary"]["report_id"] = report_id
    payload["summary"]["filename"] = filename

    if fmt == "json":
        save_json_report(filepath, payload)
    elif fmt == "csv":
        save_csv_report(filepath, payload)
    elif fmt == "pdf":
        save_pdf_report(filepath, payload)
    else:
        raise ValueError(f"Unsupported format '{fmt}'. Must be one of: pdf, csv, json")

    return {
        "report_id": report_id,
        "filename": filename,
        "filepath": filepath,
        "format": fmt,
        "report_type": request.report_type,
        "generated_at": payload["summary"]["generated_at"],
        "size_bytes": os.path.getsize(filepath) if os.path.exists(filepath) else 0
    }


def get_report_file(report_id: str) -> Optional[str]:
    """Locate report file path in backend/reports/generated/ by report_id."""
    for f in os.listdir(GENERATED_DIR):
        if f.startswith(report_id):
            return os.path.join(GENERATED_DIR, f)
    return None

def list_generated_reports() -> List[Dict[str, Any]]:
    """List all previously generated report files in backend/reports/generated/."""
    reports_list = []
    if not os.path.exists(GENERATED_DIR):
        return reports_list

    for filename in os.listdir(GENERATED_DIR):
        filepath = os.path.join(GENERATED_DIR, filename)
        if os.path.isfile(filepath):
            parts = filename.split(".")
            ext = parts[-1] if len(parts) > 1 else "unknown"
            rep_id = parts[0]
            reports_list.append({
                "report_id": rep_id,
                "filename": filename,
                "format": ext,
                "created_at": datetime.datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m-%d %H:%M:%S"),
                "size_bytes": os.path.getsize(filepath)
            })
    
    # Sort latest first
    reports_list.sort(key=lambda x: x["created_at"], reverse=True)
    return reports_list
