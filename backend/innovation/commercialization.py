"""
Commercialization Recommendation Engine.

Maps innovation scores to actionable commercialization recommendations:
  Score ≥ 85  → Commercialize       (Ready for market launch)
  70 – 84    → License              (License to industry partners)
  55 – 69    → Industry Collaboration (Seek partnerships)
  40 – 54    → Startup Potential     (Build a startup around it)
  < 40       → Continue Research     (More R&D needed)
"""

from typing import List, Dict, Any
from innovation.scoring import compute_innovation_scores


# ── Recommendation thresholds ─────────────────────────────────────────────────

RECOMMENDATIONS = [
    {"min": 85, "max": 100, "action": "Commercialize",          "color": "#10b981", "icon": "rocket",   "desc": "Ready for market launch — pursue direct commercialization or product development."},
    {"min": 70, "max": 84.9, "action": "License",               "color": "#6366f1", "icon": "handshake","desc": "Strong patent with licensing potential — partner with established industry players."},
    {"min": 55, "max": 69.9, "action": "Industry Collaboration", "color": "#f59e0b", "icon": "users",   "desc": "Promising technology — seek collaborative R&D partnerships with industry."},
    {"min": 40, "max": 54.9, "action": "Startup Potential",      "color": "#06b6d4", "icon": "lightbulb","desc": "Novel concept with startup potential — consider incubation or seed funding."},
    {"min": 0,  "max": 39.9, "action": "Continue Research",      "color": "#94a3b8", "icon": "flask",    "desc": "Early-stage innovation — continue research and development for maturation."},
]


def _get_recommendation(score: float) -> Dict[str, Any]:
    """Map a score to a recommendation."""
    for rec in RECOMMENDATIONS:
        if rec["min"] <= score <= rec["max"]:
            return {
                "action": rec["action"],
                "color": rec["color"],
                "icon": rec["icon"],
                "description": rec["desc"],
            }
    return {
        "action": "Continue Research",
        "color": "#94a3b8",
        "icon": "flask",
        "description": "Continue research and development.",
    }


def get_commercialization_recommendations() -> Dict[str, Any]:
    """
    Generate commercialization recommendations for all patents.

    Returns patents with their scores and recommended actions,
    plus a summary distribution of recommendation types.
    """
    scored = compute_innovation_scores()

    patents = []
    action_counts = {}

    for patent in scored:
        score = patent["innovation_score"]
        rec = _get_recommendation(score)

        patents.append({
            **patent,
            "recommendation": rec,
        })

        action = rec["action"]
        action_counts[action] = action_counts.get(action, 0) + 1

    # Build distribution summary
    distribution = []
    for rec in RECOMMENDATIONS:
        action = rec["action"]
        count = action_counts.get(action, 0)
        distribution.append({
            "action": action,
            "count": count,
            "percentage": round(count / len(patents) * 100, 1) if patents else 0,
            "color": rec["color"],
            "icon": rec["icon"],
        })

    # Top commercializable patents
    top_commercializable = [p for p in patents if p["recommendation"]["action"] == "Commercialize"][:10]

    return {
        "total_patents": len(patents),
        "patents": patents,
        "distribution": distribution,
        "top_commercializable": top_commercializable,
        "thresholds": [
            {"action": r["action"], "min_score": r["min"], "max_score": r["max"]}
            for r in RECOMMENDATIONS
        ],
    }
