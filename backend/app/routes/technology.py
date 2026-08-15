from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.models.user import User
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/technology", tags=["Technology Intelligence"])


class TechDomain(BaseModel):
    name: str
    trl: int          # 1-9 Technology Readiness Level
    maturity: str     # Emerging, Developing, Maturing, Mature
    market_size_b: float
    growth_rate: float
    color: str


class SectorAdoption(BaseModel):
    sector: str
    adoption_rate: float   # 0-100
    leaders: List[str]
    trend: str  # rising, stable, declining


TECH_MATURITY_DATA = [
    TechDomain(name="Quantum Computing", trl=4, maturity="Emerging", market_size_b=1.2, growth_rate=32.1, color="#6366f1"),
    TechDomain(name="Generative AI", trl=7, maturity="Maturing", market_size_b=43.8, growth_rate=48.5, color="#8b5cf6"),
    TechDomain(name="CRISPR Gene Editing", trl=5, maturity="Developing", market_size_b=3.5, growth_rate=22.8, color="#06b6d4"),
    TechDomain(name="Solid-State Batteries", trl=4, maturity="Emerging", market_size_b=0.8, growth_rate=41.3, color="#10b981"),
    TechDomain(name="Carbon Capture (DAC)", trl=3, maturity="Emerging", market_size_b=0.4, growth_rate=55.7, color="#f59e0b"),
    TechDomain(name="mRNA Therapeutics", trl=8, maturity="Mature", market_size_b=15.6, growth_rate=18.2, color="#ec4899"),
    TechDomain(name="Neuromorphic Computing", trl=3, maturity="Emerging", market_size_b=0.3, growth_rate=38.9, color="#f97316"),
    TechDomain(name="Edge AI", trl=6, maturity="Maturing", market_size_b=9.7, growth_rate=27.5, color="#14b8a6"),
    TechDomain(name="Autonomous Robotics", trl=6, maturity="Maturing", market_size_b=22.4, growth_rate=19.8, color="#a78bfa"),
    TechDomain(name="Spatial Computing", trl=5, maturity="Developing", market_size_b=5.1, growth_rate=35.6, color="#fb923c"),
    TechDomain(name="Bioprinting", trl=4, maturity="Emerging", market_size_b=1.8, growth_rate=24.3, color="#34d399"),
    TechDomain(name="Photonics & LiDAR", trl=7, maturity="Maturing", market_size_b=8.3, growth_rate=16.4, color="#60a5fa"),
]

SECTOR_ADOPTION_DATA = [
    SectorAdoption(sector="Healthcare & Biotech", adoption_rate=72, leaders=["Pfizer", "Moderna", "DeepMind Health"], trend="rising"),
    SectorAdoption(sector="Energy & CleanTech", adoption_rate=58, leaders=["Tesla", "Northvolt", "Carbon Clean"], trend="rising"),
    SectorAdoption(sector="Finance & FinTech", adoption_rate=85, leaders=["JPMorgan", "Stripe", "Palantir"], trend="stable"),
    SectorAdoption(sector="Manufacturing & Robotics", adoption_rate=63, leaders=["Fanuc", "ABB", "Symbotic"], trend="rising"),
    SectorAdoption(sector="Agriculture & FoodTech", adoption_rate=41, leaders=["John Deere", "Pivot Bio", "Ginkgo"], trend="rising"),
    SectorAdoption(sector="Transportation & Mobility", adoption_rate=54, leaders=["Waymo", "Tesla", "Aurora"], trend="stable"),
    SectorAdoption(sector="Education & EdTech", adoption_rate=38, leaders=["Coursera", "Duolingo", "Synthesis"], trend="rising"),
    SectorAdoption(sector="Defense & Aerospace", adoption_rate=67, leaders=["Lockheed", "DARPA", "Shield AI"], trend="stable"),
]


@router.get("/maturity", response_model=List[TechDomain])
def get_tech_maturity(current_user: User = Depends(get_current_user)):
    """Get technology maturity matrix data across key domains."""
    return TECH_MATURITY_DATA


@router.get("/adoption", response_model=List[SectorAdoption])
def get_sector_adoption(current_user: User = Depends(get_current_user)):
    """Get technology adoption rates by industry sector."""
    return SECTOR_ADOPTION_DATA


@router.get("/summary")
def get_tech_summary(current_user: User = Depends(get_current_user)):
    """High-level summary stats for technology intelligence."""
    return {
        "total_domains_tracked": len(TECH_MATURITY_DATA),
        "emerging_technologies": sum(1 for t in TECH_MATURITY_DATA if t.maturity == "Emerging"),
        "avg_growth_rate": round(sum(t.growth_rate for t in TECH_MATURITY_DATA) / len(TECH_MATURITY_DATA), 1),
        "highest_growth": max(TECH_MATURITY_DATA, key=lambda t: t.growth_rate).name,
        "sectors_tracked": len(SECTOR_ADOPTION_DATA),
    }
