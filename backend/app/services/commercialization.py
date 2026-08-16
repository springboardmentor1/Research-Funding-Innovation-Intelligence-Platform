"""
Commercialization recommendation service (Module 8).

Given a research profile, suggest commercialization pathways: productization,
licensing, startup creation, or industry partnership.

WHY RULE-BASED, NOT ML
----------------------
There is no labelled training data for "which research should become a
startup vs a license". Inventing an ML model here would be theatre - a
classifier trained on nothing, dressed up to look sophisticated.

Instead this is a transparent rule engine driven by the SAME evidence the
innovation score already computes. Each pathway has an explicit condition,
so every recommendation can state exactly why it fired. For an internship
deliverable that is the honest and defensible choice, and it is trivially
explainable to a reviewer.

The rules read the five scored components:
    research_novelty      high  -> the science is fresh
    patent_strength       high  -> the IP is defensible
    technology_maturity   high  -> it is close to application
    market_potential      high  -> commercial interest exists
    funding_relevance     high  -> money is available now
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import ResearchProfile
from app.services import scoring

HIGH = 55        # a component at/above this is "strong"
MODERATE = 30    # at/above this is "present"


def _level(value: float) -> str:
    if value >= HIGH:
        return "high"
    if value >= MODERATE:
        return "moderate"
    return "low"


def recommend_commercialization(db: Session, profile: ResearchProfile) -> dict:
    score = scoring.compute_score(db, profile)
    comp = {k: v["value"] for k, v in score["components"].items()}

    novelty = comp["research_novelty"]
    patent = comp["patent_strength"]
    maturity = comp["technology_maturity"]
    market = comp["market_potential"]
    funding = comp["funding_relevance"]

    pathways = []

    # --- Startup creation ------------------------------------------------
    # Fresh science + real commercial interest = a venture opportunity.
    if novelty >= HIGH and market >= MODERATE:
        pathways.append({
            "pathway": "Startup Creation",
            "confidence": _level(min(novelty, market + 15)),
            "rationale": (
                f"High research novelty ({novelty}) indicates a differentiated "
                f"technical position, and commercial interest ({market}) shows a "
                f"receptive market. Novel science with market pull is the classic "
                f"venture profile."
            ),
            "next_steps": [
                "Validate the problem with 5-10 potential customers",
                "Assess freedom-to-operate against the patent landscape",
                "Seek pre-seed or grant funding to build a prototype",
            ],
        })

    # --- Licensing -------------------------------------------------------
    # Strong IP + mature tech, but you do not want to run a company.
    if patent >= HIGH and maturity >= MODERATE:
        pathways.append({
            "pathway": "Licensing / IP Monetization",
            "confidence": _level(min(patent, maturity + 15)),
            "rationale": (
                f"Strong patent position ({patent}) and technology maturity "
                f"({maturity}) mean the IP is both defensible and close to "
                f"application - attractive to license to an established player."
            ),
            "next_steps": [
                "Identify incumbents already patenting in this space",
                "Prepare an IP summary and claims chart",
                "Engage your institution's technology transfer office",
            ],
        })

    # --- Productization --------------------------------------------------
    # Mature tech + available funding = build it into a product now.
    if maturity >= HIGH and funding >= MODERATE:
        pathways.append({
            "pathway": "Productization",
            "confidence": _level(min(maturity, funding + 15)),
            "rationale": (
                f"High technology maturity ({maturity}) means the science is "
                f"application-ready, and available funding ({funding}) can "
                f"support development into a deployable product."
            ),
            "next_steps": [
                "Define a minimum viable product scope",
                "Apply to the matching open funding opportunities",
                "Build and pilot with an early adopter",
            ],
        })

    # --- Industry partnership -------------------------------------------
    # Market interest but IP or maturity not yet strong enough to go alone.
    if market >= HIGH and (patent < HIGH or maturity < HIGH):
        pathways.append({
            "pathway": "Industry Partnership",
            "confidence": _level(market),
            "rationale": (
                f"Strong commercial interest ({market}) with IP or maturity still "
                f"developing suggests partnering with an established firm to share "
                f"development risk and access their route to market."
            ),
            "next_steps": [
                "Map companies active in this technology area",
                "Propose a joint development or sponsored-research agreement",
                "Define IP ownership terms up front",
            ],
        })

    if not pathways:
        pathways.append({
            "pathway": "Continue Research",
            "confidence": "n/a",
            "rationale": (
                "No commercialization pathway meets its threshold yet. The "
                "measured signals suggest the work is at an earlier stage - "
                "focus on strengthening research output and IP before "
                "pursuing commercialization."
            ),
            "next_steps": [
                "Increase publication and citation footprint",
                "File provisional patents on novel methods",
                "Re-assess once the innovation score rises",
            ],
        })

    return {
        "profile_id": profile.id,
        "innovation_score": score["total_score"],
        "component_levels": {k: _level(v) for k, v in comp.items()},
        "pathways": pathways,
        "method": "transparent rule engine over scored components; "
                  "each pathway states the condition that fired it",
    }
