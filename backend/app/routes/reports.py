import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from app.services import report_service
from app.services.report_service import ReportRequest
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports & Analytics Generator"])

@router.get("/types")
def get_report_types(current_user: User = Depends(get_current_user)):
    """
    Retrieve available report categories and export formats.
    Requires JWT authentication.
    """
    return {
        "report_types": report_service.REPORT_TYPES,
        "supported_formats": ["pdf", "csv", "json"]
    }

@router.post("/generate")
def generate_report_api(
    request: ReportRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate an executive report in specified format (PDF, CSV, JSON).
    Saves output file in backend/reports/generated/ and returns unique report_id.
    Requires JWT authentication.
    """
    try:
        result = report_service.create_report(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )

@router.get("/download/{report_id}")
def download_report_api(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Download a previously generated report file by report_id from backend/reports/generated/.
    Requires JWT authentication.
    """
    filepath = report_service.get_report_file(report_id)
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report file for '{report_id}' was not found."
        )
    
    filename = os.path.basename(filepath)
    ext = filename.split(".")[-1].lower()
    
    media_type = "application/octet-stream"
    if ext == "pdf":
        media_type = "text/html"  # Rendered HTML/PDF viewable in browser or downloaded
    elif ext == "csv":
        media_type = "text/csv"
    elif ext == "json":
        media_type = "application/json"
        
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type=media_type
    )

@router.get("/list")
def list_reports_api(current_user: User = Depends(get_current_user)):
    """
    List all generated report files available in storage.
    Requires JWT authentication.
    """
    return {
        "reports": report_service.list_generated_reports()
    }
