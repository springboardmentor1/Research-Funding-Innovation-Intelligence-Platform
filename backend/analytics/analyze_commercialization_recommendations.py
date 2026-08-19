import os
import json
from collections import Counter
import pandas as pd

def get_scores_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(script_dir, "../outputs/innovation_scores.json")),
        os.path.abspath(os.path.join(script_dir, "../../outputs/innovation_scores.json")),
        os.path.abspath("outputs/innovation_scores.json"),
        os.path.abspath("backend/outputs/innovation_scores.json")
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def load_or_generate_innovation_scores():
    scores_path = get_scores_path()
    if scores_path and os.path.exists(scores_path):
        print(f"Loading Innovation Scores from: {scores_path}")
        with open(scores_path, "r", encoding="utf-8") as f:
            return json.load(f)

    print("innovation_scores.json not found. Attempting fallback: run_innovation_scoring()...")
    try:
        from analytics.analyze_innovation_scoring import run_innovation_scoring
        run_innovation_scoring()
        scores_path = get_scores_path()
        if scores_path and os.path.exists(scores_path):
            with open(scores_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Fallback failed: {e}")

    raise FileNotFoundError("Unable to load or generate innovation scores across all fallback paths.")

def evaluate_commercialization_strategy(overall_score, readiness_score, opportunity_score, risk_score, innovation_score):
    if readiness_score >= 65 and overall_score >= 60 and risk_score <= 50:
        return "Immediate Market Launch"
    elif readiness_score >= 55 and opportunity_score >= 55:
        return "Licensing"
    elif opportunity_score >= 60 and risk_score > 50:
        return "Joint Venture"
    elif innovation_score >= 55 and readiness_score >= 45:
        return "Strategic Partnership"
    elif innovation_score >= 55 and readiness_score < 45:
        return "Startup Incubation"
    else:
        return "Continue Research & Development"

def evaluate_investment_priority(overall_score, opportunity_score, readiness_score, risk_score):
    inv_score = (0.35 * overall_score) + (0.35 * opportunity_score) + (0.20 * readiness_score) + (0.10 * max(0.0, 100.0 - risk_score))
    if inv_score >= 60.0:
        return "Very High Investment Priority", round(inv_score, 1)
    elif inv_score >= 50.0:
        return "High Investment Priority", round(inv_score, 1)
    elif inv_score >= 40.0:
        return "Medium Investment Priority", round(inv_score, 1)
    else:
        return "Low Investment Priority", round(inv_score, 1)

def evaluate_technology_transfer_readiness(readiness_score):
    if readiness_score >= 65.0:
        return "Ready for Technology Transfer"
    elif readiness_score >= 52.0:
        return "Pilot Deployment Recommended"
    elif readiness_score >= 40.0:
        return "Prototype Validation Required"
    else:
        return "Research Stage"

def evaluate_partnership_recommendation(domain, strategy, readiness_level, readiness_score, opportunity_score, risk_score, innovation_score):
    gov_domains = ["Smart Cities", "Cyber Security", "5G / 6G Communications", "Healthcare"]
    if domain in gov_domains and opportunity_score >= 50:
        return "Government Agencies"
    elif strategy in ["Immediate Market Launch", "Licensing"]:
        return "Industry"
    elif strategy == "Joint Venture":
        return "Venture Capital"
    elif strategy == "Startup Incubation":
        return "Incubators"
    elif readiness_level == "Research Stage" or (innovation_score >= 50 and readiness_score < 40):
        return "Universities"
    elif strategy == "Strategic Partnership":
        return "Industry"
    else:
        return "Research Labs"

def evaluate_timeline(readiness_score, risk_score):
    if readiness_score >= 65.0 and risk_score <= 45.0:
        return "0–1 Years"
    elif readiness_score >= 50.0:
        return "1–3 Years"
    elif readiness_score >= 35.0:
        return "3–5 Years"
    else:
        return "5+ Years"

def evaluate_market_entry(domain, opportunity_score, readiness_score, risk_score):
    gov_domains = ["Smart Cities", "Cyber Security", "5G / 6G Communications"]
    if opportunity_score >= 65.0 and readiness_score >= 55.0:
        return "International Expansion"
    elif domain in gov_domains or (opportunity_score >= 55.0 and risk_score > 50.0):
        return "Government Adoption"
    elif opportunity_score >= 50.0 and readiness_score >= 45.0:
        return "Enterprise Adoption"
    elif opportunity_score >= 45.0 and readiness_score >= 40.0:
        return "Domestic Market"
    else:
        return "Niche Market"

def evaluate_risk_mitigation(risk_score, opportunity_score, readiness_score):
    if risk_score > 60.0:
        return "High technology complexity detected: Conduct rigorous prototype testing and establish strict IP protections prior to scale-up."
    elif opportunity_score < 45.0:
        return "Market adoption barrier: Perform target user validation, pilot demonstrations, and competitive value proposition analysis."
    elif readiness_score < 45.0:
        return "Readiness gap: Collaborate with research institutions and industrial partners to accelerate TRL progression."
    else:
        return "Competitive market risk: Maintain fast innovation cycles, file key defensive patents, and align with strategic launch partners."

def generate_executive_recommendation(domain, overall_score, strategy, investment_priority, readiness, partnership, timeline, market_entry):
    return (
        f"{domain} (Overall Score: {overall_score}) is recommended for {strategy} with {investment_priority}. "
        f"The technology is currently at the {readiness} status with an estimated commercialization timeline of {timeline}. "
        f"Key execution steps include engaging {partnership} partners and pursuing an {market_entry} strategy."
    )

def run_commercialization_recommendations():
    print("==================================================")
    print("STARTING COMMERCIALIZATION RECOMMENDATIONS ENGINE")
    print("==================================================")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.abspath(os.path.join(script_dir, "../outputs"))
    os.makedirs(outputs_dir, exist_ok=True)

    # 1. Load Innovation Scores Data (Step 3)
    scoring_data = load_or_generate_innovation_scores()

    innovation_scores = scoring_data.get("innovation_scores", {})
    comm_readiness = scoring_data.get("commercialization_readiness", {})
    market_opps = scoring_data.get("market_opportunities", {})
    tech_risk = scoring_data.get("technology_risk", {})
    priority_rankings = scoring_data.get("priority_rankings", {})

    # Build domain map
    domain_map = {}

    if isinstance(priority_rankings, list):
        for p in priority_rankings:
            domain = p["domain"]
            domain_map[domain] = {
                "overall_score": p.get("overall_score", 50.0),
                "innovation_score": p.get("innovation_score", 50.0),
                "readiness_score": p.get("readiness_score", 50.0),
                "opportunity_score": p.get("opportunity_score", 50.0),
                "risk_score": p.get("risk_score", 50.0),
                "priority_rank": p.get("priority_rank", 1)
            }
    elif isinstance(priority_rankings, dict):
        for domain, p in priority_rankings.items():
            r_info = comm_readiness.get(domain, {})
            m_info = market_opps.get(domain, {})
            rk_info = tech_risk.get(domain, {})
            d_info = innovation_scores.get(domain, {})
            domain_map[domain] = {
                "overall_score": p.get("overall_score", 50.0),
                "innovation_score": d_info.get("score", 50.0),
                "readiness_score": r_info.get("score", 50.0),
                "opportunity_score": m_info.get("score", 50.0),
                "risk_score": rk_info.get("risk_score", 50.0),
                "priority_rank": p.get("priority_rank", 1)
            }

    # Ensure all domains present in innovation_scores are covered
    for domain, d_info in innovation_scores.items():
        if domain not in domain_map:
            r_info = comm_readiness.get(domain, {})
            m_info = market_opps.get(domain, {})
            rk_info = tech_risk.get(domain, {})
            domain_map[domain] = {
                "overall_score": round((d_info.get("score", 50.0) + r_info.get("score", 50.0) + m_info.get("score", 50.0) + (100 - rk_info.get("risk_score", 50.0))) / 4.0, 1),
                "innovation_score": d_info.get("score", 50.0),
                "readiness_score": r_info.get("score", 50.0),
                "opportunity_score": m_info.get("score", 50.0),
                "risk_score": rk_info.get("risk_score", 50.0),
                "priority_rank": 99
            }

    commercialization_strategies = {}
    investment_recommendations = {}
    technology_transfer_readiness = {}
    partnership_recommendations = {}
    commercialization_timelines = {}
    market_entry_strategies = {}
    risk_mitigations = {}
    executive_recommendations = {}

    domain_recommendations = {}
    summary_rows = []

    for domain, data in domain_map.items():
        overall_score = data["overall_score"]
        innovation_score = data["innovation_score"]
        readiness_score = data["readiness_score"]
        opportunity_score = data["opportunity_score"]
        risk_score = data["risk_score"]

        # Module A
        strategy = evaluate_commercialization_strategy(
            overall_score, readiness_score, opportunity_score, risk_score, innovation_score
        )
        commercialization_strategies[domain] = strategy

        # Module B
        inv_priority, inv_score = evaluate_investment_priority(
            overall_score, opportunity_score, readiness_score, risk_score
        )
        investment_recommendations[domain] = {
            "investment_priority": inv_priority,
            "composite_score": inv_score
        }

        # Module C
        readiness_level = evaluate_technology_transfer_readiness(readiness_score)
        technology_transfer_readiness[domain] = readiness_level

        # Module D
        partnership = evaluate_partnership_recommendation(
            domain, strategy, readiness_level, readiness_score, opportunity_score, risk_score, innovation_score
        )
        partnership_recommendations[domain] = partnership

        # Module E
        timeline = evaluate_timeline(readiness_score, risk_score)
        commercialization_timelines[domain] = timeline

        # Module F
        market_entry = evaluate_market_entry(domain, opportunity_score, readiness_score, risk_score)
        market_entry_strategies[domain] = market_entry

        # Module G
        risk_mitigation = evaluate_risk_mitigation(risk_score, opportunity_score, readiness_score)
        risk_mitigations[domain] = risk_mitigation

        # Module H
        executive_rec = generate_executive_recommendation(
            domain, overall_score, strategy, inv_priority, readiness_level, partnership, timeline, market_entry
        )
        executive_recommendations[domain] = executive_rec

        # Full domain summary item
        domain_recommendations[domain] = {
            "domain": domain,
            "overall_innovation_score": overall_score,
            "innovation_score": innovation_score,
            "readiness_score": readiness_score,
            "opportunity_score": opportunity_score,
            "risk_score": risk_score,
            "commercialization_strategy": strategy,
            "investment_priority": inv_priority,
            "technology_transfer_readiness": readiness_level,
            "partnership_recommendation": partnership,
            "timeline": timeline,
            "market_entry_strategy": market_entry,
            "risk_mitigation": risk_mitigation,
            "executive_recommendation": executive_rec
        }

        summary_rows.append({
            "Technology Domain": domain,
            "Overall Innovation Score": overall_score,
            "Commercialization Strategy": strategy,
            "Investment Priority": inv_priority,
            "Technology Transfer Readiness": readiness_level,
            "Partnership Recommendation": partnership,
            "Market Entry Strategy": market_entry,
            "Timeline": timeline,
            "Executive Recommendation": executive_rec
        })

    # Sort summary rows by Overall Innovation Score descending
    summary_rows = sorted(summary_rows, key=lambda x: x["Overall Innovation Score"], reverse=True)

    # 1. Save backend/outputs/commercialization_recommendations.json
    full_output_data = {
        "metadata": {
            "total_domains_evaluated": len(domain_map),
            "top_domain": summary_rows[0]["Technology Domain"] if summary_rows else "N/A",
            "workflow_status": "Active"
        },
        "commercialization_strategies": commercialization_strategies,
        "investment_recommendations": investment_recommendations,
        "technology_transfer_readiness": technology_transfer_readiness,
        "partnership_recommendations": partnership_recommendations,
        "commercialization_timelines": commercialization_timelines,
        "market_entry_strategies": market_entry_strategies,
        "risk_mitigations": risk_mitigations,
        "executive_recommendations": executive_recommendations,
        "domain_recommendations": domain_recommendations
    }

    recs_json_path = os.path.join(outputs_dir, "commercialization_recommendations.json")
    with open(recs_json_path, "w", encoding="utf-8") as f:
        json.dump(full_output_data, f, indent=2)
    print(f"[OK] Saved commercialization_recommendations.json -> {recs_json_path}")

    # 2. Save backend/outputs/commercialization_dashboard.json
    strategy_counts = Counter(commercialization_strategies.values())
    inv_counts = Counter([v["investment_priority"] for v in investment_recommendations.values()])
    readiness_counts = Counter(technology_transfer_readiness.values())
    partner_counts = Counter(partnership_recommendations.values())
    timeline_counts = Counter(commercialization_timelines.values())
    market_counts = Counter(market_entry_strategies.values())

    dashboard_data = {
        "summary_kpis": {
            "total_domains_evaluated": len(domain_map),
            "top_commercialization_domain": summary_rows[0]["Technology Domain"] if summary_rows else "N/A",
            "high_investment_priority_count": inv_counts.get("Very High Investment Priority", 0) + inv_counts.get("High Investment Priority", 0),
            "ready_for_transfer_count": readiness_counts.get("Ready for Technology Transfer", 0),
            "short_term_timeline_count": timeline_counts.get("0–1 Years", 0) + timeline_counts.get("1–3 Years", 0),
            "immediate_launch_count": strategy_counts.get("Immediate Market Launch", 0)
        },
        "strategy_distribution": [
            {"strategy": k, "count": v} for k, v in strategy_counts.items()
        ],
        "investment_priority_chart": [
            {"priority": k, "count": v} for k, v in inv_counts.items()
        ],
        "readiness_distribution": [
            {"readiness_level": k, "count": v} for k, v in readiness_counts.items()
        ],
        "partnership_summary": [
            {"partner_type": k, "count": v} for k, v in partner_counts.items()
        ],
        "timeline_distribution": [
            {"timeline": k, "count": v} for k, v in timeline_counts.items()
        ],
        "market_entry_distribution": [
            {"market_entry": k, "count": v} for k, v in market_counts.items()
        ],
        "recommendations_leaderboard": [
            {
                "rank": idx + 1,
                "domain": row["Technology Domain"],
                "overall_score": row["Overall Innovation Score"],
                "strategy": row["Commercialization Strategy"],
                "investment_priority": row["Investment Priority"],
                "readiness": row["Technology Transfer Readiness"],
                "partner": row["Partnership Recommendation"],
                "timeline": row["Timeline"],
                "executive_summary": row["Executive Recommendation"]
            }
            for idx, row in enumerate(summary_rows[:10])
        ]
    }

    dash_json_path = os.path.join(outputs_dir, "commercialization_dashboard.json")
    with open(dash_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=2)
    print(f"[OK] Saved commercialization_dashboard.json -> {dash_json_path}")

    # 3. Save backend/outputs/commercialization_summary.csv
    summary_df = pd.DataFrame(summary_rows)
    summary_csv_path = os.path.join(outputs_dir, "commercialization_summary.csv")
    summary_df.to_csv(summary_csv_path, index=False)
    print(f"[OK] Saved commercialization_summary.csv -> {summary_csv_path}")

    print("==================================================")
    print("COMMERCIALIZATION RECOMMENDATIONS ENGINE COMPLETED")
    print("==================================================")

if __name__ == "__main__":
    run_commercialization_recommendations()
