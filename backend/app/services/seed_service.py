from sqlalchemy.orm import Session
from app.models.funding_opportunity import FundingOpportunity

def seed_funding_opportunities(db: Session):
    # Check if already seeded
    count = db.query(FundingOpportunity).count()
    if count > 0:
        return

    opportunities = [
        FundingOpportunity(
            title="NSF CAREER: Artificial Intelligence & Autonomous Systems Research",
            provider="National Science Foundation (NSF)",
            eligibility="AI, Machine Learning, Robotics, Computer Vision, Autonomous Systems",
            deadline="2026-10-15",
            amount="$500,000"
        ),
        FundingOpportunity(
            title="NIH Exploratory/Developmental Research Grant (R21)",
            provider="National Institutes of Health (NIH)",
            eligibility="Bioinformatics, Genomics, Health Tech, Cancer Diagnostics, Medical Imaging",
            deadline="2026-11-01",
            amount="$275,000"
        ),
        FundingOpportunity(
            title="Horizon Europe Clean Energy & Smart Grids Transition",
            provider="European Research Council (ERC)",
            eligibility="Clean Energy, Solar Energy, Renewable Batteries, Sustainability, Decarbonization",
            deadline="2026-09-30",
            amount="€1,200,000"
        ),
        FundingOpportunity(
            title="DARPA Next Generation Quantum Cryptography Grant",
            provider="Defense Advanced Research Projects Agency (DARPA)",
            eligibility="Quantum Computing, Cryptography, Supercomputing, Cyber Security",
            deadline="2026-12-05",
            amount="$850,000"
        ),
        FundingOpportunity(
            title="DeepTech Seed Innovation Accelerator",
            provider="Y-Combinator / Venture Innovation Fund",
            eligibility="Startup, Productization, Semiconductors, AI Applications, IoT, Advanced Hardware",
            deadline="2026-09-10",
            amount="$150,000"
        ),
        FundingOpportunity(
            title="Gates Foundation Transformative Global Health Award",
            provider="Gates Foundation",
            eligibility="Vaccines, Biology, Global Health, Epidemiology, Drug Discovery",
            deadline="2026-10-01",
            amount="$1,000,000"
        ),
        FundingOpportunity(
            title="IEEE Advanced Telecom and 6G Prototype Grant",
            provider="IEEE Innovation Council",
            eligibility="5G, 6G, Telecommunications, Wireless Networks, IoT Protocols",
            deadline="2026-11-20",
            amount="$350,000"
        )
    ]

    for opp in opportunities:
        db.add(opp)
    
    db.commit()
