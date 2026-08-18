from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db

router = APIRouter(prefix="/commercialization", tags=["Commercialization Pathways"])

@router.get("/pathways")
def get_commercialization_pathways(
    domain: str = Query("Artificial Intelligence", description="Research domain"),
    db: Session = Depends(get_db)
):
    return {
        "domain": domain,
        "recommended_pathways": [
            {
                "pathway": "IP Patent Licensing & University Tech Transfer",
                "feasibility_score": 88.5,
                "target_partners": ["Siemens Healthineers", "GE Healthcare", "Philips BioTech"],
                "description": "High patent novelty indicates immediate licensing appeal to enterprise medical imaging vendors."
            },
            {
                "pathway": "Spin-off Venture & Accelerator Seed Funding",
                "feasibility_score": 82.0,
                "target_partners": ["Y Combinator Bio", "NSF I-Corps Accelerator"],
                "description": "Strong product market fit suitable for pre-seed venture capital funding."
            },
            {
                "pathway": "SBIR / STTR Phase I Grant Application",
                "feasibility_score": 94.0,
                "target_partners": ["National Science Foundation", "National Institutes of Health"],
                "description": "Non-dilutive funding up to $275,000 to reach prototype validation."
            }
        ]
    }
