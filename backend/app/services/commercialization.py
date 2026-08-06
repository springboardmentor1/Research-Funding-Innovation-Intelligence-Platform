"""
Commercialization Recommendation Module (spec section 8):
  - Productization, licensing, startup creation, industry partnership recommendations
"""


def generate_recommendations(score_result: dict) -> list[dict]:
    breakdown = score_result["breakdown"]
    recs = []

    research_novelty = breakdown["research_novelty"]["score"]
    patent_strength = breakdown["patent_strength"]["score"]
    technology_maturity = breakdown["technology_maturity"]["score"]
    market_potential = breakdown["market_potential"]["score"]
    funding_relevance = breakdown["funding_relevance"]["score"]

    if research_novelty >= 70 and patent_strength < 40:
        recs.append({
            "category": "Productization",
            "recommendation": "File a provisional patent before further publication or disclosure.",
            "rationale": f"Research novelty is high ({research_novelty}/100) but patent coverage in this domain is thin ({patent_strength}/100) - protect the IP early.",
        })

    if technology_maturity >= 75:
        recs.append({
            "category": "Licensing",
            "recommendation": "Explore licensing this technology to established players in the space.",
            "rationale": f"The technology domain is classified as '{score_result['maturity_stage']}' (maturity score {technology_maturity}/100), indicating existing commercial adoption and licensing demand.",
        })

    if market_potential >= 60 and funding_relevance >= 60:
        recs.append({
            "category": "Startup Creation",
            "recommendation": "Consider founding a startup around this research; funding and market signals are both strong.",
            "rationale": f"Market potential ({market_potential}/100) and funding relevance ({funding_relevance}/100) are both high, suggesting investor and grant appetite.",
        })

    if funding_relevance >= 50 and market_potential < 60:
        recs.append({
            "category": "Industry Partnership",
            "recommendation": "Pursue an industry-sponsored research partnership rather than an independent venture.",
            "rationale": f"Funding relevance is solid ({funding_relevance}/100) but broader market signal is limited ({market_potential}/100) - a partner can de-risk commercialization.",
        })

    if not recs:
        recs.append({
            "category": "Productization",
            "recommendation": "Continue building research and patent evidence before pursuing commercialization.",
            "rationale": f"Current innovation score ({score_result['innovation_score']}/100) is below the threshold where commercialization paths show a clear advantage.",
        })

    return recs
