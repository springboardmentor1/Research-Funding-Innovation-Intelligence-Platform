def calculate_innovation_score(novelty: float, patent_strength: float, maturity: float, market_potential: float, funding_relevance: float) -> tuple[float, list[str]]:
    """
    Computes overall weighted Innovation Score:
    Innovation Score = Novelty (30%) + Patent Strength (20%) + Tech Maturity (15%) + Market Potential (20%) + Funding Relevance (15%)
    Also generates list of commercialization recommendations.
    """
    score = (
        (novelty * 0.30) +
        (patent_strength * 0.20) +
        (maturity * 0.15) +
        (market_potential * 0.20) +
        (funding_relevance * 0.15)
    )
    score = round(score, 2)

    recs = []
    if market_potential >= 75 and patent_strength >= 60:
        recs.append("Recommend Startup Spin-off: High market potential and solid IP coverage support raising venture backing.")
    
    if patent_strength >= 75:
        recs.append("Recommend Technology Licensing: Strong patent strength makes this a prime candidate for licensing to established enterprises.")
    
    if maturity < 50:
        recs.append("Recommend Proof-of-Concept Continuation: Low technology readiness suggests seeking university/national research council grants to build lab prototypes.")
    else:
        recs.append("Recommend Industry Partnership: Medium-to-high tech maturity enables joint prototype development with enterprise partners.")

    if funding_relevance >= 70:
        recs.append("High Grant Suitability: Align submission with direct government and accelerator funding opportunities discovered.")

    return score, recs
