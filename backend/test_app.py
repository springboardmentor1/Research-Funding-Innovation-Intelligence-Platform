import pytest
from app.services.innovation_service import calculate_innovation_score

def test_innovation_scoring_formula():
    # Weighted Scoring Model:
    # Innovation Score = Novelty (30%) + Patent Strength (20%) + Tech Maturity (15%) + Market Potential (20%) + Funding Relevance (15%)
    # Inputs: 80, 75, 60, 85, 70
    # Expected: (80*0.3) + (75*0.2) + (60*0.15) + (85*0.2) + (70*0.15)
    #           24 + 15 + 9 + 17 + 10.5 = 75.5
    score, recs = calculate_innovation_score(80, 75, 60, 85, 70)
    assert score == 75.5
    assert len(recs) > 0
    # verify recommendations
    assert any("Startup Spin-off" in r for r in recs)
