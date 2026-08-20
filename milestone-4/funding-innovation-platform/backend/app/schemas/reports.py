"""Schemas for the Reports & Export System (Milestone 4, spec section 11)."""
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class ReportType(str, Enum):
    FUNDING = "funding"
    PATENT = "patent"
    RESEARCH_TREND = "research_trend"
    INNOVATION_INTELLIGENCE = "innovation_intelligence"
    COMMERCIALIZATION = "commercialization"


class ReportFormat(str, Enum):
    PDF = "pdf"
    EXCEL = "excel"


class ReportSection(BaseModel):
    """One section of a report. `kind='kv'` renders `rows` as a two-column
    key/value table (summary metrics); `kind='table'` renders `columns` +
    `rows` as a data table."""

    heading: str
    kind: str  # "kv" | "table"
    columns: list[str] = []
    rows: list[list[str]] = []


class ReportPayload(BaseModel):
    report_type: ReportType
    title: str
    generated_at: datetime
    sections: list[ReportSection]


class AvailableReport(BaseModel):
    report_type: ReportType
    title: str
    description: str
