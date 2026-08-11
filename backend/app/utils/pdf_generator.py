from io import BytesIO
from datetime import datetime
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

class PDFGenerator:
    """
    Reusable utility class for generating PDF reports.
    """

    def __init__(self):
        self.styles = getSampleStyleSheet()

        self.title_style = ParagraphStyle(
            "ReportTitle",
            parent=self.styles["Title"],
            alignment=TA_CENTER,
            fontSize=20,
            spaceAfter=10,
        )

        self.subtitle_style = ParagraphStyle(
            "ReportSubtitle",
            parent=self.styles["Normal"],
            alignment=TA_CENTER,
            fontSize=10,
            textColor=colors.grey,
            spaceAfter=20,
        )

        self.heading_style = ParagraphStyle(
            "ReportHeading",
            parent=self.styles["Heading2"],
            fontSize=14,
            spaceBefore=12,
            spaceAfter=8,
        )

        self.body_style = ParagraphStyle(
            "ReportBody",
            parent=self.styles["BodyText"],
            fontSize=9,
            leading=13,
        )

    # ------------------------------------------------------------------
    # Page Header / Footer
    # ------------------------------------------------------------------

    @staticmethod
    def _add_page_number(canvas, document):
        """
        Adds page number and footer to every page.
        """
        canvas.saveState()

        canvas.setFont("Helvetica", 8)

        canvas.drawString(
            20 * mm,
            10 * mm,
            "Research Funding & Innovation Intelligence Platform",
        )

        canvas.drawRightString(
            190 * mm,
            10 * mm,
            f"Page {document.page}",
        )

        canvas.restoreState()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _create_table(
        self,
        headers: list[str],
        rows: list[list[Any]],
        column_widths: list[float] | None = None,
    ) -> Table:
        """
        Creates a styled table for the PDF.
        """

        table_data = [headers]

        for row in rows:
            table_data.append(
                [
                    str(value) if value is not None else "-"
                    for value in row
                ]
            )

        table = Table(
            table_data,
            colWidths=column_widths,
            repeatRows=1,
        )

        table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#2F5597"),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey,
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.HexColor("#F2F2F2")],
                    ),
                ]
            )
        )

        return table

    # ------------------------------------------------------------------
    # Dashboard Report
    # ------------------------------------------------------------------

    def generate_dashboard_report(
        self,
        dashboard_data: dict[str, Any],
        user_name: str | None = None,
    ) -> BytesIO:
        """
        Generates a complete dashboard PDF report.

        Parameters:
            dashboard_data:
                Dashboard information returned by the dashboard service.

            user_name:
                Name of the authenticated user.

        Returns:
            BytesIO object containing the generated PDF.
        """

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
            title="Research Funding & Innovation Intelligence Report",
            author="Research Funding & Innovation Intelligence Platform",
        )

        story = []

        # --------------------------------------------------------------
        # Title
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "Research Funding & Innovation Intelligence Platform",
                self.title_style,
            )
        )

        story.append(
            Paragraph(
                "Executive Dashboard Report",
                self.subtitle_style,
            )
        )

        generated_date = datetime.now().strftime("%d-%m-%Y %H:%M")

        metadata_rows = [
            ["Generated On", generated_date],
            ["User", user_name or "N/A"],
        ]

        story.append(
            self._create_table(
                ["Report Information", "Value"],
                metadata_rows,
                column_widths=[60 * mm, 100 * mm],
            )
        )

        story.append(Spacer(1, 10))

        # --------------------------------------------------------------
        # Publication Summary
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "1. Publication Summary",
                self.heading_style,
            )
        )

        summary = dashboard_data.get("summary", {})

        if hasattr(summary, "model_dump"):
            summary = summary.model_dump()
        elif hasattr(summary, "dict"):
            summary = summary.dict()

        publication_rows = [
            ["Total Publications", summary.get("total_publications", 0)],
            ["Recent Publications", summary.get("recent_publications", 0)],
        ]

        story.append(
            self._create_table(
                ["Metric", "Value"],
                publication_rows,
                column_widths=[100 * mm, 60 * mm],
            )
        )

        # --------------------------------------------------------------
        # Funding Statistics
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "2. Funding Statistics",
                self.heading_style,
            )
        )

        funding_statistics = dashboard_data.get(
            "funding_statistics",
            {},
        )

        if hasattr(funding_statistics, "model_dump"):
            funding_statistics = funding_statistics.model_dump()
        elif hasattr(funding_statistics, "dict"):
            funding_statistics = funding_statistics.dict()

        funding_rows = [
            [str(key).replace("_", " ").title(), value]
            for key, value in funding_statistics.items()
        ]

        if funding_rows:
            story.append(
                self._create_table(
                    ["Funding Metric", "Value"],
                    funding_rows,
                    column_widths=[100 * mm, 60 * mm],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No funding statistics available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Recommendation Summary
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "3. Recommendation Summary",
                self.heading_style,
            )
        )

        recommendation_summary = dashboard_data.get(
            "recommendation_summary",
            {},
        )

        if hasattr(recommendation_summary, "model_dump"):
            recommendation_summary = recommendation_summary.model_dump()
        elif hasattr(recommendation_summary, "dict"):
            recommendation_summary = recommendation_summary.dict()

        recommendation_rows = [
            [
                str(key).replace("_", " ").title(),
                value,
            ]
            for key, value in recommendation_summary.items()
        ]

        if recommendation_rows:
            story.append(
                self._create_table(
                    ["Recommendation Level", "Count"],
                    recommendation_rows,
                    column_widths=[100 * mm, 60 * mm],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No recommendation summary available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Patent Statistics
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "4. Patent Intelligence",
                self.heading_style,
            )
        )

        patent_statistics = dashboard_data.get(
            "patent_statistics",
            {},
        )

        if hasattr(patent_statistics, "model_dump"):
            patent_statistics = patent_statistics.model_dump()
        elif hasattr(patent_statistics, "dict"):
            patent_statistics = patent_statistics.dict()

        patent_rows = [
            [
                str(key).replace("_", " ").title(),
                value,
            ]
            for key, value in patent_statistics.items()
        ]

        if patent_rows:
            story.append(
                self._create_table(
                    ["Patent Metric", "Value"],
                    patent_rows,
                    column_widths=[100 * mm, 60 * mm],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No patent statistics available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Technology Analytics
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "5. Technology Intelligence",
                self.heading_style,
            )
        )

        technology_data = dashboard_data.get(
            "patent_technology",
            [],
        )

        if isinstance(technology_data, dict):
            technology_rows = [
                [
                    str(key).replace("_", " ").title(),
                    value,
                ]
                for key, value in technology_data.items()
            ]

            story.append(
                self._create_table(
                    ["Technology Metric", "Value"],
                    technology_rows,
                    column_widths=[100 * mm, 60 * mm],
                )
            )

        elif technology_data:
            technology_rows = []

            for item in technology_data:
                if hasattr(item, "model_dump"):
                    item = item.model_dump()
                elif hasattr(item, "dict"):
                    item = item.dict()

                technology_rows.append(
                    [
                        item.get("technology_area", "-"),
                        item.get("patent_count", 0),
                    ]
                )

            story.append(
                self._create_table(
                    ["Technology Area", "Patent Count"],
                    technology_rows,
                    column_widths=[100 * mm, 60 * mm],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No technology analytics available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Final Summary
        # --------------------------------------------------------------

        story.append(Spacer(1, 15))

        story.append(
            Paragraph(
                "Report Summary",
                self.heading_style,
            )
        )

        story.append(
            Paragraph(
                "This report provides an overview of research publications, "
                "funding opportunities, recommendations, patent activity, "
                "and technology intelligence available in the platform.",
                self.body_style,
            )
        )

        # --------------------------------------------------------------
        # Build PDF
        # --------------------------------------------------------------

        document.build(
            story,
            onFirstPage=self._add_page_number,
            onLaterPages=self._add_page_number,
        )

        buffer.seek(0)

        return buffer
        # ------------------------------------------------------------------
    # Publications Report
    # ------------------------------------------------------------------

    def generate_publications_report(
        self,
        publication_data: dict[str, Any],
        user_name: str | None = None,
    ) -> BytesIO:
        """
        Generates a PDF report containing publication records
        and publication analytics.
        """

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
            title="Publications Report",
            author=(
                "Research Funding & Innovation "
                "Intelligence Platform"
            ),
        )

        story = []

        # --------------------------------------------------------------
        # Title
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "Research Funding & Innovation Intelligence Platform",
                self.title_style,
            )
        )

        story.append(
            Paragraph(
                "Publications Report",
                self.subtitle_style,
            )
        )

        generated_date = datetime.now().strftime(
            "%d-%m-%Y %H:%M"
        )

        metadata_rows = [
            ["Generated On", generated_date],
            ["User", user_name or "N/A"],
        ]

        story.append(
            self._create_table(
                ["Report Information", "Value"],
                metadata_rows,
                column_widths=[
                    60 * mm,
                    100 * mm,
                ],
            )
        )

        story.append(Spacer(1, 10))

        # --------------------------------------------------------------
        # Publication Summary
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "1. Publication Summary",
                self.heading_style,
            )
        )

        summary = publication_data.get(
            "summary",
            {},
        )

        if hasattr(summary, "model_dump"):
            summary = summary.model_dump()
        elif hasattr(summary, "dict"):
            summary = summary.dict()

        summary_rows = [
            [
                str(key).replace("_", " ").title(),
                value,
            ]
            for key, value in summary.items()
        ]

        if summary_rows:
            story.append(
                self._create_table(
                    ["Metric", "Value"],
                    summary_rows,
                    column_widths=[
                        100 * mm,
                        60 * mm,
                    ],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No publication summary available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Yearly Publication Trend
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "2. Yearly Publication Trend",
                self.heading_style,
            )
        )

        yearly_trend = publication_data.get(
            "yearly_trend",
            [],
        )

        yearly_rows = []

        for item in yearly_trend:
            if hasattr(item, "model_dump"):
                item = item.model_dump()
            elif hasattr(item, "dict"):
                item = item.dict()

            yearly_rows.append(
                [
                    item.get("year", "-"),
                    item.get("count", 0),
                ]
            )

        if yearly_rows:
            story.append(
                self._create_table(
                    ["Year", "Publication Count"],
                    yearly_rows,
                    column_widths=[
                        80 * mm,
                        80 * mm,
                    ],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No yearly publication trend available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Research Area Trend
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "3. Research Area Distribution",
                self.heading_style,
            )
        )

        research_area_trend = publication_data.get(
            "research_area_trend",
            [],
        )

        research_area_rows = []

        for item in research_area_trend:
            if hasattr(item, "model_dump"):
                item = item.model_dump()
            elif hasattr(item, "dict"):
                item = item.dict()

            research_area_rows.append(
                [
                    item.get("research_area", "-"),
                    item.get("count", 0),
                ]
            )

        if research_area_rows:
            story.append(
                self._create_table(
                    ["Research Area", "Publication Count"],
                    research_area_rows,
                    column_widths=[
                        100 * mm,
                        60 * mm,
                    ],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No research area data available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Journal Trend
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "4. Journal Distribution",
                self.heading_style,
            )
        )

        journal_trend = publication_data.get(
            "journal_trend",
            [],
        )

        journal_rows = []

        for item in journal_trend:
            if hasattr(item, "model_dump"):
                item = item.model_dump()
            elif hasattr(item, "dict"):
                item = item.dict()

            journal_rows.append(
                [
                    item.get("journal", "-"),
                    item.get("count", 0),
                ]
            )

        if journal_rows:
            story.append(
                self._create_table(
                    ["Journal", "Publication Count"],
                    journal_rows,
                    column_widths=[
                        100 * mm,
                        60 * mm,
                    ],
                )
            )
        else:
            story.append(
                Paragraph(
                    "No journal data available.",
                    self.body_style,
                )
            )

                # --------------------------------------------------------------
        # Publication Records
        # --------------------------------------------------------------

        story.append(
            Paragraph(
                "5. Publication Records",
                self.heading_style,
            )
        )

        publications = publication_data.get(
            "publications",
            [],
        )

        publication_rows = []

        for publication in publications:

            # SQLAlchemy Publication model
            title = getattr(
                publication,
                "title",
                "-",
            )

            journal = getattr(
                publication,
                "journal",
                "-",
            )

            publication_date = getattr(
                publication,
                "publication_date",
                None,
            )

            research_area = getattr(
                publication,
                "research_area",
                "-",
            )

            doi = getattr(
                publication,
                "doi",
                "-",
            )

            # Format publication date
            if publication_date is not None:
                if hasattr(publication_date, "strftime"):
                    publication_date = publication_date.strftime(
                        "%d-%m-%Y"
                    )
                else:
                    publication_date = str(
                        publication_date
                    )
            else:
                publication_date = "-"

            # Handle empty DOI
            if not doi:
                doi = "-"

            publication_rows.append(
                [
                    str(title),
                    str(journal),
                    str(publication_date),
                    str(research_area),
                    str(doi),
                ]
            )

        if publication_rows:

            story.append(
                self._create_table(
                    [
                        "Title",
                        "Journal",
                        "Date",
                        "Research Area",
                        "DOI",
                    ],
                    publication_rows,
                    column_widths=[
                        38 * mm,
                        30 * mm,
                        23 * mm,
                        32 * mm,
                        37 * mm,
                    ],
                )
            )

        else:

            story.append(
                Paragraph(
                    "No publication records available.",
                    self.body_style,
                )
            )

        # --------------------------------------------------------------
        # Report Summary
        # --------------------------------------------------------------

        story.append(Spacer(1, 15))

        story.append(
            Paragraph(
                "Report Summary",
                self.heading_style,
            )
        )

        story.append(
            Paragraph(
                "This report provides an overview of the "
                "authenticated user's publications, publication "
                "trends, research areas, journals, and publication "
                "records.",
                self.body_style,
            )
        )

        # --------------------------------------------------------------
        # Build PDF
        # --------------------------------------------------------------

        document.build(
            story,
            onFirstPage=self._add_page_number,
            onLaterPages=self._add_page_number,
        )

        buffer.seek(0)

        return buffer