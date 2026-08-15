from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.auth_service import get_current_user
from app.models.user import User
import random

router = APIRouter(prefix="/innovation", tags=["Innovation Intelligence"])


class InnovationScore(BaseModel):
    id: str
    name: str
    category: str   # healthcare, energy, materials, computing, biotech, other
    commercialization_score: int   # 0-100
    market_readiness: int
    ip_strength: int
    team_score: int
    market_size_b: float
    time_to_market_years: float
    description: str
    tags: List[str]


class IdeaEvalRequest(BaseModel):
    title: str
    description: str
    category: str
    market_size_estimate: Optional[float] = None


class IdeaEvalResponse(BaseModel):
    title: str
    commercialization_score: int
    market_readiness: int
    ip_strength: int
    recommendation: str
    strengths: List[str]
    risks: List[str]


INNOVATION_SCORES_DATA = [
    InnovationScore(id="1", name="Non-invasive Glucose Monitoring", category="healthcare",
                    commercialization_score=94, market_readiness=88, ip_strength=91, team_score=90,
                    market_size_b=18.6, time_to_market_years=1.5,
                    description="Wearable sensor using near-infrared spectroscopy to continuously track glucose without needles.",
                    tags=["medtech", "wearables", "diabetes"]),
    InnovationScore(id="2", name="Solid State Battery Tech", category="energy",
                    commercialization_score=89, market_readiness=78, ip_strength=85, team_score=87,
                    market_size_b=12.4, time_to_market_years=3.0,
                    description="Next-gen solid electrolyte batteries offering 3x energy density over lithium-ion.",
                    tags=["energy", "EVs", "storage"]),
    InnovationScore(id="3", name="Carbon Capture Materials", category="materials",
                    commercialization_score=82, market_readiness=71, ip_strength=80, team_score=78,
                    market_size_b=6.8, time_to_market_years=4.0,
                    description="Novel MOF-based sorbents for direct air capture with 60% lower energy cost.",
                    tags=["climate", "materials", "sustainability"]),
    InnovationScore(id="4", name="AI-Powered Drug Discovery", category="biotech",
                    commercialization_score=91, market_readiness=83, ip_strength=88, team_score=95,
                    market_size_b=45.2, time_to_market_years=2.5,
                    description="LLM-guided protein folding analysis to identify novel drug candidates 10x faster.",
                    tags=["AI", "pharma", "proteins"]),
    InnovationScore(id="5", name="Neuromorphic Edge Chips", category="computing",
                    commercialization_score=76, market_readiness=62, ip_strength=79, team_score=82,
                    market_size_b=3.1, time_to_market_years=5.0,
                    description="Brain-inspired chips for ultra-low-power AI inference at the edge.",
                    tags=["semiconductors", "AI", "IoT"]),
    InnovationScore(id="6", name="Precision Fermentation Proteins", category="biotech",
                    commercialization_score=85, market_readiness=80, ip_strength=73, team_score=84,
                    market_size_b=8.9, time_to_market_years=2.0,
                    description="Microbial production of animal proteins with 95% less land and water use.",
                    tags=["foodtech", "sustainability", "biotech"]),
    InnovationScore(id="7", name="Quantum Error Correction", category="computing",
                    commercialization_score=68, market_readiness=45, ip_strength=88, team_score=91,
                    market_size_b=1.4, time_to_market_years=7.0,
                    description="Surface code algorithms enabling fault-tolerant quantum computation.",
                    tags=["quantum", "computing", "research"]),
    InnovationScore(id="8", name="CRISPR Plant Engineering", category="biotech",
                    commercialization_score=87, market_readiness=76, ip_strength=82, team_score=79,
                    market_size_b=5.3, time_to_market_years=3.5,
                    description="Precise crop genome editing for drought resistance and yield enhancement.",
                    tags=["agritech", "CRISPR", "food security"]),
]


@router.get("/scores", response_model=List[InnovationScore])
def get_innovation_scores(
    category: Optional[str] = None,
    min_score: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Get innovation scores for all tracked opportunities."""
    data = INNOVATION_SCORES_DATA
    if category and category != "all":
        data = [d for d in data if d.category == category]
    data = [d for d in data if d.commercialization_score >= min_score]
    return sorted(data, key=lambda x: x.commercialization_score, reverse=True)


@router.post("/evaluate", response_model=IdeaEvalResponse)
def evaluate_idea(
    idea: IdeaEvalRequest,
    current_user: User = Depends(get_current_user)
):
    """Evaluate an innovation idea and return an AI-powered score."""
    # Simulated AI scoring based on description length and category
    base = 55 + (len(idea.description) % 30)
    comm_score = min(99, base + random.randint(0, 15))
    market_score = min(99, base - 5 + random.randint(0, 20))
    ip_score = min(99, base + random.randint(-10, 20))

    strengths_pool = [
        "Strong market timing with emerging demand",
        "Novel IP position with defensible moat",
        "Large addressable market with clear entry point",
        "Aligns with regulatory tailwinds",
        "Cross-industry application potential",
        "Capital-efficient business model"
    ]
    risks_pool = [
        "Long development timeline expected",
        "High capital requirement for scale-up",
        "Regulatory approval pathway unclear",
        "Competitive incumbents with deep pockets",
        "Talent scarcity in the required domain",
        "Technology maturity still at TRL 3-4"
    ]

    return IdeaEvalResponse(
        title=idea.title,
        commercialization_score=comm_score,
        market_readiness=market_score,
        ip_strength=ip_score,
        recommendation="Promising" if comm_score >= 70 else "Needs Development",
        strengths=random.sample(strengths_pool, 3),
        risks=random.sample(risks_pool, 2)
    )


@router.get("/categories")
def get_categories(current_user: User = Depends(get_current_user)):
    """Get list of innovation categories with counts."""
    categories = {}
    for item in INNOVATION_SCORES_DATA:
        categories[item.category] = categories.get(item.category, 0) + 1
    return [{"category": k, "count": v} for k, v in categories.items()]
