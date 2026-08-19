import os
import json
import re
from collections import Counter, defaultdict
import pandas as pd
import numpy as np

def get_intelligence_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(script_dir, "../outputs/technology_intelligence.json")),
        os.path.abspath(os.path.join(script_dir, "../../outputs/technology_intelligence.json")),
        os.path.abspath("outputs/technology_intelligence.json"),
        os.path.abspath("backend/outputs/technology_intelligence.json")
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def get_landscape_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(script_dir, "../outputs/patent_landscape.json")),
        os.path.abspath(os.path.join(script_dir, "../../outputs/patent_landscape.json")),
        os.path.abspath("outputs/patent_landscape.json"),
        os.path.abspath("backend/outputs/patent_landscape.json")
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def get_dataset_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(script_dir, "../../datasets/processed/patents/patents_processed.csv")),
        os.path.abspath(os.path.join(script_dir, "../datasets/processed/patents/patents_processed.csv")),
        os.path.abspath("datasets/processed/patents/patents_processed.csv"),
        os.path.abspath("../datasets/processed/patents/patents_processed.csv")
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def load_or_generate_intelligence():
    intel_path = get_intelligence_path()
    if intel_path and os.path.exists(intel_path):
        print(f"Loading Technology Intelligence outputs from: {intel_path}")
        with open(intel_path, "r", encoding="utf-8") as f:
            return json.load(f)

    print("technology_intelligence.json not found. Attempting fallback 1: run_technology_intelligence()...")
    try:
        from analytics.analyze_technology_intelligence import run_technology_intelligence
        run_technology_intelligence()
        intel_path = get_intelligence_path()
        if intel_path and os.path.exists(intel_path):
            with open(intel_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Fallback 1 failed: {e}")

    print("Attempting fallback 2: load patent_landscape.json and generate technology intelligence...")
    landscape_path = get_landscape_path()
    if not landscape_path or not os.path.exists(landscape_path):
        try:
            from analytics.analyze_patent_landscape import analyze_landscape
            analyze_landscape()
        except Exception as e:
            print(f"Failed to generate patent landscape: {e}")

    try:
        from analytics.analyze_technology_intelligence import run_technology_intelligence
        run_technology_intelligence()
        intel_path = get_intelligence_path()
        if intel_path and os.path.exists(intel_path):
            with open(intel_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Fallback 2 failed: {e}")

    raise FileNotFoundError("Unable to load or generate technology intelligence data across all fallback paths.")

def run_innovation_scoring():
    print("==================================================")
    print("STARTING INNOVATION SCORING WORKFLOW")
    print("==================================================")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.abspath(os.path.join(script_dir, "../outputs"))
    os.makedirs(outputs_dir, exist_ok=True)

    # 1. Load Technology Intelligence Data (Step 2)
    intel_data = load_or_generate_intelligence()

    tech_maturity = intel_data.get("technology_maturity", {})
    emerging_techs = intel_data.get("emerging_technologies", [])
    innovation_momentum = intel_data.get("innovation_momentum", {})
    tech_convergence = intel_data.get("technology_convergence", [])
    adoption_trends = intel_data.get("adoption_trends", {})
    tech_insights = intel_data.get("strategic_insights", {})

    all_domains = list(tech_maturity.keys())
    if not all_domains:
        raise ValueError("No technology domains found in technology intelligence input data.")

    # Build domain lookups for convergence
    convergence_map = defaultdict(float)
    for c in tech_convergence:
        p_dom = c.get("primary_domain")
        s_dom = c.get("secondary_domain")
        score = c.get("co_occurrence_score", 50.0)
        if p_dom:
            convergence_map[p_dom] = max(convergence_map[p_dom], score)
        if s_dom:
            convergence_map[s_dom] = max(convergence_map[s_dom], score)

    emerging_domain_set = {t["technology_name"] for t in emerging_techs}

    max_volume = max([m.get("patent_volume", 1) for m in tech_maturity.values()]) if tech_maturity else 1

    # Storage structures for modules A - F
    innovation_scores = {}
    commercialization_readiness = {}
    market_opportunities = {}
    technology_risk = {}
    overall_priority_list = []
    strategic_recommendations = {}

    for domain in all_domains:
        m_info = tech_maturity.get(domain, {})
        mom_info = innovation_momentum.get(domain, {})
        adopt_info = adoption_trends.get(domain, {})

        maturity_st = m_info.get("maturity_status", "Mature")
        growth_pct = m_info.get("growth_rate_percentage", 0.0)
        pat_volume = m_info.get("patent_volume", 100)
        mom_score = mom_info.get("momentum_score", 50.0)
        geo_spread = mom_info.get("geographic_spread_count", 3)
        assg_count = mom_info.get("assignee_count", 10)
        inv_count = mom_info.get("inventor_activity_count", 30)

        # ----------------------------------------------------
        # Module A: Innovation Score (0-100)
        # ----------------------------------------------------
        maturity_weights = {"Emerging": 90.0, "Growing": 95.0, "Mature": 75.0, "Declining": 35.0}
        mat_score = maturity_weights.get(maturity_status_val := maturity_st, 70.0)
        conv_score = convergence_map.get(domain, 40.0)
        vol_score = min(100.0, (pat_volume / max(1, max_volume)) * 100.0)
        emerging_bonus = 10.0 if domain in emerging_domain_set else 0.0

        # Weighted calculation: 35% Momentum, 25% Maturity, 20% Convergence, 15% Volume, 5% Bonus
        raw_innov_score = (0.35 * mom_score) + (0.25 * mat_score) + (0.20 * conv_score) + (0.15 * vol_score) + (0.05 * emerging_bonus)
        innov_score = round(min(99.0, max(15.0, raw_innov_score)), 1)

        if innov_score >= 85.0:
            innov_class = "Excellent"
        elif innov_score >= 70.0:
            innov_class = "Strong"
        elif innov_score >= 50.0:
            innov_class = "Moderate"
        else:
            innov_class = "Weak"

        innovation_scores[domain] = {
            "score": innov_score,
            "classification": innov_class,
            "components": {
                "momentum_score": mom_score,
                "maturity_score": mat_score,
                "convergence_strength": conv_score,
                "patent_volume_score": round(vol_score, 1),
                "emerging_bonus": emerging_bonus
            }
        }

        # ----------------------------------------------------
        # Module B: Commercialization Readiness Score (0-100)
        # ----------------------------------------------------
        readiness_mat_weights = {"Mature": 95.0, "Growing": 85.0, "Emerging": 50.0, "Declining": 40.0}
        mat_readiness = readiness_mat_weights.get(maturity_st, 65.0)

        adoption_st = adopt_info.get("adoption_stage", "Early Majority")
        adoption_weights = {
            "Mainstream / Saturated": 90.0,
            "Late Majority": 85.0,
            "Early Majority": 75.0,
            "Early Adoption": 45.0
        }
        adopt_readiness = adoption_weights.get(adoption_st, 70.0)
        assg_part_score = min(100.0, (assg_count / 25.0) * 100.0)

        # Weighted: 40% Maturity Readiness, 35% Adoption Readiness, 25% Assignee Participation
        raw_readiness_score = (0.40 * mat_readiness) + (0.35 * adopt_readiness) + (0.25 * assg_part_score)
        readiness_score = round(min(99.0, max(15.0, raw_readiness_score)), 1)

        if readiness_score >= 80.0:
            readiness_class = "Ready"
        elif readiness_score >= 65.0:
            readiness_class = "Nearly Ready"
        elif readiness_score >= 50.0:
            readiness_class = "Developing"
        else:
            readiness_class = "Early Research"

        commercialization_readiness[domain] = {
            "score": readiness_score,
            "classification": readiness_class,
            "components": {
                "maturity_readiness": mat_readiness,
                "adoption_stage_readiness": adopt_readiness,
                "assignee_participation_score": round(assg_part_score, 1)
            }
        }

        # ----------------------------------------------------
        # Module C: Market Opportunity Score (0-100)
        # ----------------------------------------------------
        # Growth factor (scaled -20% to +40%)
        norm_growth = min(100.0, max(0.0, ((growth_pct + 20.0) / 60.0) * 100.0))
        geo_score = min(100.0, (geo_spread / 10.0) * 100.0)
        emerging_velocity_score = 90.0 if domain in emerging_domain_set else (70.0 if maturity_st == "Growing" else 45.0)

        # Weighted: 40% Filing Growth, 35% Geographic Spread, 25% Emerging Velocity
        raw_opp_score = (0.40 * norm_growth) + (0.35 * geo_score) + (0.25 * emerging_velocity_score)
        opp_score = round(min(99.0, max(15.0, raw_opp_score)), 1)

        if opp_score >= 80.0:
            opp_level = "Very High"
        elif opp_score >= 65.0:
            opp_level = "High"
        elif opp_score >= 45.0:
            opp_level = "Medium"
        else:
            opp_level = "Low"

        market_opportunities[domain] = {
            "score": opp_score,
            "opportunity_level": opp_level,
            "components": {
                "growth_factor_score": round(norm_growth, 1),
                "geographic_spread_score": round(geo_score, 1),
                "emerging_velocity_score": emerging_velocity_score
            }
        }

        # ----------------------------------------------------
        # Module D: Technology Risk Score (0-100)
        # ----------------------------------------------------
        # Risk factors: Declining filing activity, weak momentum, low assignee participation
        growth_contraction_risk = 85.0 if growth_pct < -5.0 else (50.0 if growth_pct <= 0.0 else 15.0)
        weak_momentum_risk = 100.0 - mom_score
        low_participation_risk = max(0.0, 100.0 - (assg_count * 5.0))

        # Weighted: 40% Growth Contraction Risk, 35% Weak Momentum Risk, 25% Low Participation Risk
        raw_risk_score = (0.40 * growth_contraction_risk) + (0.35 * weak_momentum_risk) + (0.25 * low_participation_risk)
        risk_score = round(min(95.0, max(5.0, raw_risk_score)), 1)

        if risk_score > 65.0:
            risk_level = "High Risk"
        elif risk_score >= 35.0:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Low Risk"

        technology_risk[domain] = {
            "score": risk_score,
            "risk_level": risk_level,
            "components": {
                "growth_contraction_risk": growth_contraction_risk,
                "weak_momentum_risk": round(weak_momentum_risk, 1),
                "low_participation_risk": round(low_participation_risk, 1)
            }
        }

        # ----------------------------------------------------
        # Module E: Overall Innovation Priority
        # ----------------------------------------------------
        # Formula: 35% Innovation + 25% Readiness + 25% Opportunity + 15% (100 - Risk)
        inverse_risk = 100.0 - risk_score
        overall_score = round((0.35 * innov_score) + (0.25 * readiness_score) + (0.25 * opp_score) + (0.15 * inverse_risk), 1)

        if overall_score >= 80.0:
            inv_category = "Immediate Investment"
        elif overall_score >= 65.0:
            inv_category = "Strategic Monitoring"
        elif overall_score >= 50.0:
            inv_category = "Future Research"
        else:
            inv_category = "Low Priority"

        # ----------------------------------------------------
        # Module F: Strategic Recommendations
        # ----------------------------------------------------
        if inv_category == "Immediate Investment":
            rec_text = "Immediate Investment — High commercialization readiness and market demand. Scale R&D funding and secure market share."
        elif inv_category == "Strategic Monitoring":
            rec_text = "Strategic Monitoring — High potential growth domain. Monitor competitive patent filings and initiate targeted R&D pilots."
        elif inv_category == "Future Research":
            rec_text = "Commercialization Partnership — Medium maturity domain. Explore joint R&D partnerships, licensing, and technology transfers."
        else:
            rec_text = "Low Priority / Divestment — High technology risk or declining activity. Reallocate resources to high-momentum domains."

        overall_priority_list.append({
            "domain": domain,
            "overall_score": overall_score,
            "investment_category": inv_category,
            "innovation_score": innov_score,
            "readiness_score": readiness_score,
            "opportunity_score": opp_score,
            "risk_score": risk_score,
            "recommendation": rec_text
        })

    # Sort overall priorities descending by overall_score and assign ranks
    overall_priority_list.sort(key=lambda x: x["overall_score"], reverse=True)

    priority_rankings = {}
    for idx, item in enumerate(overall_priority_list, start=1):
        item["priority_rank"] = idx
        priority_rankings[item["domain"]] = {
            "overall_score": item["overall_score"],
            "priority_rank": idx,
            "investment_category": item["investment_category"]
        }
        strategic_recommendations[item["domain"]] = {
            "overall_score": item["overall_score"],
            "priority_rank": idx,
            "category": item["investment_category"],
            "recommendation": item["recommendation"]
        }

    # ----------------------------------------------------
    # Construction & Export of Outputs
    # ----------------------------------------------------

    # 1. backend/outputs/innovation_scores.json
    scoring_output_data = {
        "metadata": {
            "total_domains_scored": len(all_domains),
            "top_priority_domain": overall_priority_list[0]["domain"] if overall_priority_list else "N/A",
            "immediate_investment_count": len([x for x in overall_priority_list if x["investment_category"] == "Immediate Investment"]),
            "workflow_status": "Active"
        },
        "innovation_scores": innovation_scores,
        "commercialization_readiness": commercialization_readiness,
        "market_opportunities": market_opportunities,
        "technology_risk": technology_risk,
        "priority_rankings": priority_rankings,
        "strategic_recommendations": strategic_recommendations
    }

    scores_json_path = os.path.join(outputs_dir, "innovation_scores.json")
    with open(scores_json_path, "w", encoding="utf-8") as f:
        json.dump(scoring_output_data, f, indent=2)
    print(f"[OK] Saved innovation_scores.json -> {scores_json_path}")

    # 2. backend/outputs/innovation_dashboard.json (UI optimized payload)
    innov_class_counts = Counter([s["classification"] for s in innovation_scores.values()])
    readiness_class_counts = Counter([r["classification"] for r in commercialization_readiness.values()])
    inv_category_counts = Counter([x["investment_category"] for x in overall_priority_list])

    dashboard_data = {
        "summary_kpis": {
            "total_domains_evaluated": len(all_domains),
            "highest_scoring_domain": overall_priority_list[0]["domain"] if overall_priority_list else "N/A",
            "highest_overall_score": overall_priority_list[0]["overall_score"] if overall_priority_list else 0.0,
            "immediate_investment_count": inv_category_counts.get("Immediate Investment", 0),
            "ready_commercialization_count": readiness_class_counts.get("Ready", 0),
            "low_risk_domains_count": len([r for r in technology_risk.values() if r["risk_level"] == "Low Risk"])
        },
        "score_distribution_chart": [
            {"classification": "Excellent", "count": innov_class_counts.get("Excellent", 0)},
            {"classification": "Strong", "count": innov_class_counts.get("Strong", 0)},
            {"classification": "Moderate", "count": innov_class_counts.get("Moderate", 0)},
            {"classification": "Weak", "count": innov_class_counts.get("Weak", 0)}
        ],
        "investment_category_breakdown": [
            {"category": "Immediate Investment", "count": inv_category_counts.get("Immediate Investment", 0)},
            {"category": "Strategic Monitoring", "count": inv_category_counts.get("Strategic Monitoring", 0)},
            {"category": "Future Research", "count": inv_category_counts.get("Future Research", 0)},
            {"category": "Low Priority", "count": inv_category_counts.get("Low Priority", 0)}
        ],
        "priority_leaderboard": [
            {
                "rank": x["priority_rank"],
                "domain": x["domain"],
                "overall_score": x["overall_score"],
                "investment_category": x["investment_category"],
                "innovation_score": x["innovation_score"],
                "readiness_score": x["readiness_score"]
            }
            for x in overall_priority_list[:10]
        ],
        "radar_chart_data": [
            {
                "domain": x["domain"],
                "innovation_score": x["innovation_score"],
                "readiness_score": x["readiness_score"],
                "opportunity_score": x["opportunity_score"],
                "safety_score": round(100.0 - x["risk_score"], 1)
            }
            for x in overall_priority_list
        ],
        "risk_vs_opportunity_matrix": [
            {
                "domain": x["domain"],
                "market_opportunity": x["opportunity_score"],
                "technology_risk": x["risk_score"],
                "overall_score": x["overall_score"],
                "category": x["investment_category"]
            }
            for x in overall_priority_list
        ]
    }

    dash_json_path = os.path.join(outputs_dir, "innovation_dashboard.json")
    with open(dash_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=2)
    print(f"[OK] Saved innovation_dashboard.json -> {dash_json_path}")

    # 3. backend/outputs/innovation_summary.csv
    summary_rows = []
    for x in overall_priority_list:
        summary_rows.append({
            "Technology Domain": x["domain"],
            "Innovation Score": x["innovation_score"],
            "Readiness Score": x["readiness_score"],
            "Opportunity Score": x["opportunity_score"],
            "Risk Score": x["risk_score"],
            "Overall Score": x["overall_score"],
            "Priority Rank": x["priority_rank"],
            "Recommendation": x["recommendation"]
        })

    summary_df = pd.DataFrame(summary_rows)
    summary_csv_path = os.path.join(outputs_dir, "innovation_summary.csv")
    summary_df.to_csv(summary_csv_path, index=False)
    print(f"[OK] Saved innovation_summary.csv -> {summary_csv_path}")

    print("==================================================")
    print("INNOVATION SCORING WORKFLOW COMPLETED")
    print("==================================================")

if __name__ == "__main__":
    run_innovation_scoring()
