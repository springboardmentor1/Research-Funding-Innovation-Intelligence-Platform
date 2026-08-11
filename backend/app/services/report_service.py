from io import BytesIO

from sqlalchemy.orm import Session

from app.services.dashboard_service import get_dashboard
from app.utils.pdf_generator import PDFGenerator

from app.services.publication_service import (
    get_publication_summary,
    get_yearly_publication_trend,
    get_research_area_trend,
    get_journal_trend,
    get_publications,
)

def generate_dashboard_pdf(
    db: Session,
    user_id: int,
    user_name: str | None = None,
) -> BytesIO:
    """
    Generate a PDF report containing the authenticated
    user's complete dashboard information.

    Parameters:
        db:
            SQLAlchemy database session.

        user_id:
            ID of the authenticated user.

        user_name:
            Name of the authenticated user.

    Returns:
        BytesIO object containing the generated PDF.
    """

    # Get the existing dashboard data.
    dashboard_data = get_dashboard(
        db=db,
        user_id=user_id,
    )

    # Create the PDF generator.
    pdf_generator = PDFGenerator()

    # Generate the dashboard PDF.
    pdf_file = pdf_generator.generate_dashboard_report(
        dashboard_data=dashboard_data,
        user_name=user_name,
    )

    return pdf_file

def generate_publications_pdf(
    db: Session,
    user_id: int,
    user_name: str | None = None,
) -> BytesIO:
    """
    Generate a PDF report containing the authenticated
    user's publication information and analytics.

    Parameters:
        db:
            SQLAlchemy database session.

        user_id:
            ID of the authenticated user.

        user_name:
            Name of the authenticated user.

    Returns:
        BytesIO object containing the generated PDF.
    """

    # --------------------------------------------------------------
    # Publication Summary
    # --------------------------------------------------------------

    summary = get_publication_summary(
        db=db,
        user_id=user_id,
    )

    # --------------------------------------------------------------
    # Publication Trends
    # --------------------------------------------------------------

    yearly_trend = get_yearly_publication_trend(
        db=db,
        user_id=user_id,
    )

    research_area_trend = get_research_area_trend(
        db=db,
        user_id=user_id,
    )

    journal_trend = get_journal_trend(
        db=db,
        user_id=user_id,
    )

    # --------------------------------------------------------------
    # Publication Records
    # --------------------------------------------------------------

    publications = get_publications(
        db=db,
        user_id=user_id,
    )

    # --------------------------------------------------------------
    # Prepare Report Data
    # --------------------------------------------------------------

    report_data = {
        "summary": summary,
        "yearly_trend": yearly_trend,
        "research_area_trend": research_area_trend,
        "journal_trend": journal_trend,
        "publications": publications,
    }

    # --------------------------------------------------------------
    # Generate PDF
    # --------------------------------------------------------------

    pdf_generator = PDFGenerator()

    return pdf_generator.generate_publications_report(
        publication_data=report_data,
        user_name=user_name,
    )