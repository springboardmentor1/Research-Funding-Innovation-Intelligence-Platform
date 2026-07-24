import os
import json
import re
from collections import Counter, defaultdict
import pandas as pd
import numpy as np

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

def clean_string_list(val):
    if pd.isna(val) or not str(val).strip():
        return []
    raw_items = re.split(r'[;,]|\band\b', str(val))
    cleaned = [item.strip() for item in raw_items if item.strip() and item.strip().lower() not in ["unknown", "unknown assignee", "unknown inventors", "individual / unknown assignee", "no keywords"]]
    return cleaned

def load_or_generate_landscape():
    landscape_path = get_landscape_path()
    if landscape_path and os.path.exists(landscape_path):
        print(f"Loading Patent Landscape outputs from: {landscape_path}")
        with open(landscape_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    print("patent_landscape.json not found. Attempting automatic regeneration via analyze_patent_landscape...")
    try:
        from analytics.analyze_patent_landscape import analyze_landscape
        analyze_landscape()
        landscape_path = get_landscape_path()
        if landscape_path and os.path.exists(landscape_path):
            with open(landscape_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Failed to auto-regenerate patent landscape: {e}")
    
    raise FileNotFoundError("Unable to load or regenerate backend/outputs/patent_landscape.json")

def run_technology_intelligence():
    print("==================================================")
    print("STARTING TECHNOLOGY INTELLIGENCE ENGINE")
    print("==================================================")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.abspath(os.path.join(script_dir, "../outputs"))
    os.makedirs(outputs_dir, exist_ok=True)

    # 1. Load Patent Landscape outputs (Step 1)
    landscape_data = load_or_generate_landscape()
    tech_landscape = landscape_data.get("technology_landscape", {})

    # 2. Load Processed Dataset for deep metrics if available
    dataset_path = get_dataset_path()
    df = None
    if dataset_path and os.path.exists(dataset_path):
        print(f"Loading dataset for granular metric calculation: {dataset_path}")
        df = pd.read_csv(dataset_path)
        df["Filing_Year"] = pd.to_numeric(df["Filing_Date"].astype(str).str[:4], errors="coerce").fillna(0).astype(int)

    # Extract overall metrics & domain statistics
    total_patents_all = landscape_data.get("metadata", {}).get("total_patents_analyzed", 5000)
    
    # ----------------------------------------------------
    # Module A: Technology Maturity Assessment
    # ----------------------------------------------------
    print("Module A: Performing Technology Maturity Assessment...")
    technology_maturity = {}
    domain_growth_dict = {}

    for domain, d_info in tech_landscape.items():
        pat_count = d_info.get("total_patents", 0)
        share_pct = d_info.get("share_percentage", 0.0)
        base_trend = d_info.get("filing_trend", "Stable")
        
        # Calculate domain metrics from dataframe if available
        domain_df = df[df["Technology_Domain"] == domain] if df is not None and "Technology_Domain" in df.columns else None
        
        if domain_df is not None and not domain_df.empty:
            yearly_counts = domain_df[domain_df["Filing_Year"] > 0]["Filing_Year"].value_counts().sort_index()
            if len(yearly_counts) >= 2:
                recent_val = yearly_counts.iloc[-1]
                prev_val = yearly_counts.iloc[0]
                yoy_growth = round(((recent_val - prev_val) / max(1, prev_val)) * 100, 2)
            else:
                yoy_growth = 0.0
            recent_2yr_count = domain_df[domain_df["Filing_Year"] >= 2024].shape[0]
            recent_ratio = round((recent_2yr_count / max(1, len(domain_df))) * 100, 2)
        else:
            yoy_growth = 12.5 if base_trend == "Growing" else (-10.0 if base_trend == "Declining" else 2.0)
            recent_ratio = 30.0

        domain_growth_dict[domain] = yoy_growth

        # Maturity Classification Logic
        # Emerging: high recent filing ratio / growth with low/moderate overall volume
        # Growing: strong growth (>5%) and moderate to high volume
        # Mature: high volume, steady filing growth (-5% to 5%)
        # Declining: negative growth (<-5%)
        if recent_ratio > 35.0 and yoy_growth > 10.0 and share_pct <= 6.0:
            maturity_status = "Emerging"
        elif yoy_growth >= 5.0 or base_trend == "Growing":
            maturity_status = "Growing"
        elif yoy_growth < -5.0 or base_trend == "Declining":
            maturity_status = "Declining"
        else:
            maturity_status = "Mature"

        technology_maturity[domain] = {
            "maturity_status": maturity_status,
            "patent_volume": pat_count,
            "share_percentage": share_pct,
            "growth_rate_percentage": yoy_growth,
            "recent_filing_ratio": recent_ratio,
            "filing_activity_trend": base_trend,
            "indicators": {
                "volume_tier": "High" if pat_count >= 250 else ("Medium" if pat_count >= 150 else "Low"),
                "velocity": "Accelerating" if yoy_growth > 5 else ("Decelerating" if yoy_growth < -5 else "Steady"),
                "market_readiness": "High" if maturity_status in ["Growing", "Mature"] else "Early"
            }
        }

    # ----------------------------------------------------
    # Module B: Emerging Technology Detection
    # ----------------------------------------------------
    print("Module B: Detecting Emerging Technologies...")
    emerging_technologies_list = []

    for domain, m_info in technology_maturity.items():
        if m_info["maturity_status"] in ["Emerging", "Growing"]:
            domain_df = df[df["Technology_Domain"] == domain] if df is not None else None
            
            # Keyword frequency velocity
            keywords_freq = Counter()
            if domain_df is not None:
                for kw_str in domain_df["Keywords"].dropna():
                    keywords_freq.update(clean_string_list(kw_str))
            
            top_kw = [k for k, _ in keywords_freq.most_common(5)] if keywords_freq else tech_landscape[domain].get("top_keywords", [])
            
            # Assignee expansion
            assignee_count = domain_df["Assignee"].nunique() if domain_df is not None else 15
            
            emerging_technologies_list.append({
                "technology_name": domain,
                "maturity_stage": m_info["maturity_status"],
                "growth_percentage": m_info["growth_rate_percentage"],
                "patent_volume": m_info["patent_volume"],
                "keyword_velocity": top_kw[:4],
                "assignee_expansion_count": assignee_count,
                "top_ipc_cpc": tech_landscape[domain].get("top_ipc_cpc", "N/A"),
                "supporting_metrics": {
                    "recent_filing_ratio": m_info["recent_filing_ratio"],
                    "primary_country": tech_landscape[domain].get("top_country", "US"),
                    "key_assignee": tech_landscape[domain].get("top_assignee", "N/A")
                }
            })

    # Sort emerging technologies by growth percentage descending
    emerging_technologies_list.sort(key=lambda x: x["growth_percentage"], reverse=True)

    # ----------------------------------------------------
    # Module C: Innovation Momentum Analysis
    # ----------------------------------------------------
    print("Module C: Calculating Innovation Momentum...")
    innovation_momentum = {}

    # Calculate min/max for normalization
    growth_vals = [m_info["growth_rate_percentage"] for m_info in technology_maturity.values()]
    min_growth, max_growth = min(growth_vals), max(growth_vals)

    for domain, d_info in tech_landscape.items():
        domain_df = df[df["Technology_Domain"] == domain] if df is not None else None
        
        growth = domain_growth_dict.get(domain, 0.0)
        norm_growth = (growth - min_growth) / max(1.0, (max_growth - min_growth)) if max_growth != min_growth else 0.5
        
        if domain_df is not None:
            # Inventor activity
            inventors = set()
            for inv_str in domain_df["Inventors"].dropna():
                inventors.update(clean_string_list(inv_str))
            inv_count = len(inventors)
            
            # Assignee expansion
            assg_count = domain_df["Assignee"].nunique()
            
            # Geographic spread
            geo_count = domain_df["Country"].nunique()
        else:
            inv_count = int(d_info.get("total_patents", 100) * 0.4)
            assg_count = 12
            geo_count = 3

        # Weighted momentum score (0-100)
        # Growth: 35%, Assignees: 25%, Inventors: 20%, Geo Spread: 20%
        score_growth = norm_growth * 100 * 0.35
        score_assg = min(100, (assg_count / 30.0) * 100) * 0.25
        score_inv = min(100, (inv_count / 80.0) * 100) * 0.20
        score_geo = min(100, (geo_count / 10.0) * 100) * 0.20

        momentum_score = round(score_growth + score_assg + score_inv + score_geo, 1)
        momentum_score = min(100.0, max(10.0, momentum_score))

        if momentum_score >= 60.0:
            momentum_level = "High"
        elif momentum_score >= 35.0:
            momentum_level = "Medium"
        else:
            momentum_level = "Low"

        innovation_momentum[domain] = {
            "momentum_score": momentum_score,
            "momentum_level": momentum_level,
            "patent_growth_rate": growth,
            "inventor_activity_count": inv_count,
            "assignee_count": assg_count,
            "geographic_spread_count": geo_count,
            "breakdown": {
                "growth_factor": round(score_growth, 1),
                "assignee_factor": round(score_assg, 1),
                "inventor_factor": round(score_inv, 1),
                "geographic_factor": round(score_geo, 1)
            }
        }

    # ----------------------------------------------------
    # Module D: Technology Convergence Analysis
    # ----------------------------------------------------
    print("Module D: Analyzing Technology Convergence...")
    
    # Pre-defined domain convergence mappings & keyword co-occurrence logic
    convergence_candidates = [
        {
            "domain_a": "Artificial Intelligence",
            "domain_b": "Internet of Things",
            "converged_concept": "AIoT (Artificial Intelligence of Things)",
            "synergy_description": "Integration of machine learning algorithms into connected IoT sensor networks for real-time edge intelligence.",
            "applications": ["Smart Cities", "Industrial Automation", "Autonomous Monitoring"]
        },
        {
            "domain_a": "Artificial Intelligence",
            "domain_b": "Biotechnology",
            "converged_concept": "Bio-AI & Computational Genomics",
            "synergy_description": "Applying deep learning to protein folding, genomic sequencing, and automated drug discovery.",
            "applications": ["Precision Medicine", "Drug Discovery", "Synthetic Biology"]
        },
        {
            "domain_a": "Quantum Computing",
            "domain_b": "Cybersecurity",
            "converged_concept": "Post-Quantum Cryptography & Quantum Security",
            "synergy_description": "Development of quantum-resistant encryption algorithms and quantum key distribution systems.",
            "applications": ["Financial Security", "Government Communications", "Cloud Encryption"]
        },
        {
            "domain_a": "Autonomous Vehicles",
            "domain_b": "Robotics",
            "converged_concept": "Autonomous Mobile Robotics (AMR)",
            "synergy_description": "Convergence of vehicle path planning with robotic manipulation for automated logistics.",
            "applications": ["Warehouse Automation", "Last-Mile Delivery", "Smart Mining"]
        },
        {
            "domain_a": "Blockchain",
            "domain_b": "Cybersecurity",
            "converged_concept": "Decentralized Zero-Trust Security",
            "synergy_description": "Immutable ledger protocols combined with cryptographic identity verification to prevent cyber breaches.",
            "applications": ["Identity Management", "Supply Chain Verification", "Secured FinTech"]
        },
        {
            "domain_a": "Renewable Energy",
            "domain_b": "Cloud Computing",
            "converged_concept": "Smart Grid Energy Analytics",
            "synergy_description": "Cloud-hosted predictive analytics for dynamic grid load balancing and solar/wind yield optimization.",
            "applications": ["Smart Power Grids", "EV Charging Networks", "Energy Storage Optimization"]
        }
    ]

    technology_convergence = []

    for item in convergence_candidates:
        dom_a = item["domain_a"]
        dom_b = item["domain_b"]
        
        # Calculate overlap strength using domain patent volumes & momentum
        vol_a = tech_landscape.get(dom_a, {}).get("total_patents", 200)
        vol_b = tech_landscape.get(dom_b, {}).get("total_patents", 200)
        mom_a = innovation_momentum.get(dom_a, {}).get("momentum_score", 50.0)
        mom_b = innovation_momentum.get(dom_b, {}).get("momentum_score", 50.0)

        shared_keywords = list(set(tech_landscape.get(dom_a, {}).get("top_keywords", []) + tech_landscape.get(dom_b, {}).get("top_keywords", [])))[:5]
        
        co_occurrence_score = round((vol_a + vol_b) / (total_patents_all * 0.15) * 10, 2)
        co_occurrence_score = min(100.0, max(25.0, co_occurrence_score))

        synergy_momentum = round((mom_a + mom_b) / 2.0, 1)

        technology_convergence.append({
            "primary_domain": dom_a,
            "secondary_domain": dom_b,
            "converged_technology_name": item["converged_concept"],
            "co_occurrence_score": co_occurrence_score,
            "synergy_momentum": synergy_momentum,
            "shared_keywords": shared_keywords,
            "synergy_description": item["synergy_description"],
            "potential_applications": item["applications"]
        })

    technology_convergence.sort(key=lambda x: x["co_occurrence_score"], reverse=True)

    # ----------------------------------------------------
    # Module E: Technology Adoption Trends
    # ----------------------------------------------------
    print("Module E: Analyzing Technology Adoption Trends...")
    adoption_trends = {}

    for domain, d_info in tech_landscape.items():
        domain_df = df[df["Technology_Domain"] == domain] if df is not None else None
        
        if domain_df is not None:
            yearly_counts = domain_df[domain_df["Filing_Year"] > 0]["Filing_Year"].value_counts().sort_index().to_dict()
            yearly_timeline = [{"year": int(y), "filings": int(c)} for y, c in yearly_counts.items()]
            geo_adoption = domain_df["Country"].value_counts().to_dict()
            top_assignees_adoption = domain_df["Assignee"].value_counts().head(3).to_dict()
        else:
            yearly_timeline = [
                {"year": 2021, "filings": 35},
                {"year": 2022, "filings": 42},
                {"year": 2023, "filings": 48},
                {"year": 2024, "filings": 50},
                {"year": 2025, "filings": 25}
            ]
            geo_adoption = {"US": d_info.get("total_patents", 200)}
            top_assignees_adoption = {d_info.get("top_assignee", "Top Institute"): d_info.get("total_patents", 200)}

        maturity_st = technology_maturity[domain]["maturity_status"]
        if maturity_st == "Emerging":
            adoption_stage = "Early Adoption"
        elif maturity_st == "Growing":
            adoption_stage = "Early Majority"
        elif maturity_st == "Mature":
            adoption_stage = "Late Majority"
        else:
            adoption_stage = "Mainstream / Saturated"

        adoption_trends[domain] = {
            "adoption_stage": adoption_stage,
            "geographic_adoption": geo_adoption,
            "industry_adoption_leaders": top_assignees_adoption,
            "filing_timeline": yearly_timeline,
            "adoption_velocity": "High" if maturity_st in ["Emerging", "Growing"] else "Moderate"
        }

    # ----------------------------------------------------
    # Module F: Strategic Technology Insights
    # ----------------------------------------------------
    print("Module F: Generating Strategic Technology Insights...")
    strategic_insights = {}

    priority_counter = 1
    sorted_domains = sorted(
        tech_landscape.keys(),
        key=lambda d: (technology_maturity[d]["maturity_status"] in ["Growing", "Emerging"], innovation_momentum[d]["momentum_score"]),
        reverse=True
    )

    for domain in sorted_domains:
        maturity_st = technology_maturity[domain]["maturity_status"]
        mom_level = innovation_momentum[domain]["momentum_level"]
        mom_score = innovation_momentum[domain]["momentum_score"]
        growth_pct = technology_maturity[domain]["growth_rate_percentage"]

        if maturity_st == "Growing":
            status_desc = "Growing"
            recommendation = "High investment potential — Accelerate R&D funding, expand patent portfolio, and secure exclusive licensing rights."
            risk_level = "Medium"
            opportunity_score = round(min(98.0, 75.0 + (growth_pct * 0.5)), 1)
        elif maturity_st == "Emerging":
            status_desc = "Emerging"
            recommendation = "Monitor closely — High disruptive innovation potential. Initiate pilot R&D projects and monitor key patent filings."
            risk_level = "High"
            opportunity_score = round(min(95.0, 80.0 + (mom_score * 0.15)), 1)
        elif maturity_st == "Mature":
            status_desc = "Mature"
            recommendation = "Commercialization opportunity — Optimize operational efficiency, leverage established IP for cross-licensing, and focus on market expansion."
            risk_level = "Low"
            opportunity_score = round(min(85.0, 60.0 + (mom_score * 0.2)), 1)
        else: # Declining
            status_desc = "Declining"
            recommendation = "Strategic pivot / Divestment — Reallocate R&D capital towards emerging convergence technologies and optimize legacy IP enforcement."
            risk_level = "High"
            opportunity_score = round(max(30.0, 45.0 + (growth_pct * 0.5)), 1)

        strategic_insights[domain] = {
            "status": status_desc,
            "recommendation": recommendation,
            "risk_level": risk_level,
            "opportunity_score": opportunity_score,
            "priority_rank": priority_counter,
            "strategic_summary": f"{domain} is currently in the {status_desc} phase with {mom_level} momentum. Recommendation: {recommendation}"
        }
        priority_counter += 1

    # ----------------------------------------------------
    # Construction & Export of JSON Outputs
    # ----------------------------------------------------
    # 1. backend/outputs/technology_intelligence.json
    full_intelligence_data = {
        "metadata": {
            "total_patents_analyzed": total_patents_all,
            "unique_domains_analyzed": len(tech_landscape),
            "emerging_technologies_count": len(emerging_technologies_list),
            "convergence_pairs_identified": len(technology_convergence),
            "engine_status": "Active"
        },
        "technology_maturity": technology_maturity,
        "emerging_technologies": emerging_technologies_list,
        "innovation_momentum": innovation_momentum,
        "technology_convergence": technology_convergence,
        "adoption_trends": adoption_trends,
        "strategic_insights": strategic_insights
    }

    intelligence_json_path = os.path.join(outputs_dir, "technology_intelligence.json")
    with open(intelligence_json_path, "w", encoding="utf-8") as f:
        json.dump(full_intelligence_data, f, indent=2)
    print(f"[OK] Saved technology_intelligence.json -> {intelligence_json_path}")

    # 2. backend/outputs/technology_dashboard.json (Optimized for frontend UI)
    maturity_counts = Counter([m["maturity_status"] for m in technology_maturity.values()])
    momentum_counts = Counter([m["momentum_level"] for m in innovation_momentum.values()])

    dashboard_data = {
        "summary_kpis": {
            "total_technology_domains": len(tech_landscape),
            "top_emerging_technology": emerging_technologies_list[0]["technology_name"] if emerging_technologies_list else "N/A",
            "high_momentum_domains_count": momentum_counts.get("High", 0),
            "emerging_technologies_count": maturity_counts.get("Emerging", 0) + maturity_counts.get("Growing", 0),
            "technology_convergence_hubs": len(technology_convergence),
            "primary_strategic_action": "Accelerate R&D in High-Momentum Emerging Technologies"
        },
        "maturity_distribution_chart": [
            {"status": "Emerging", "count": maturity_counts.get("Emerging", 0)},
            {"status": "Growing", "count": maturity_counts.get("Growing", 0)},
            {"status": "Mature", "count": maturity_counts.get("Mature", 0)},
            {"status": "Declining", "count": maturity_counts.get("Declining", 0)}
        ],
        "emerging_technology_leaderboard": [
            {
                "technology": t["technology_name"],
                "growth_percentage": t["growth_percentage"],
                "maturity_stage": t["maturity_stage"],
                "patent_volume": t["patent_volume"]
            }
            for t in emerging_technologies_list[:8]
        ],
        "momentum_radar": [
            {
                "domain": d,
                "momentum_score": m["momentum_score"],
                "momentum_level": m["momentum_level"],
                "patent_growth": m["patent_growth_rate"],
                "geographic_spread": m["geographic_spread_count"]
            }
            for d, m in innovation_momentum.items()
        ],
        "convergence_network": {
            "nodes": [{"id": d, "group": technology_maturity[d]["maturity_status"]} for d in tech_landscape.keys()],
            "links": [
                {
                    "source": c["primary_domain"],
                    "target": c["secondary_domain"],
                    "value": c["co_occurrence_score"],
                    "concept": c["converged_technology_name"]
                }
                for c in technology_convergence
            ]
        },
        "adoption_stages_breakdown": [
            {"domain": d, "stage": t["adoption_stage"], "velocity": t["adoption_velocity"]}
            for d, t in adoption_trends.items()
        ],
        "strategic_matrix": [
            {
                "domain": d,
                "status": s["status"],
                "momentum": innovation_momentum[d]["momentum_level"],
                "opportunity_score": s["opportunity_score"],
                "risk_level": s["risk_level"],
                "recommendation": s["recommendation"]
            }
            for d, s in strategic_insights.items()
        ]
    }

    dashboard_json_path = os.path.join(outputs_dir, "technology_dashboard.json")
    with open(dashboard_json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=2)
    print(f"[OK] Saved technology_dashboard.json -> {dashboard_json_path}")

    # 3. backend/outputs/technology_summary.csv
    summary_rows = []
    for domain in tech_landscape.keys():
        m_status = technology_maturity[domain]["maturity_status"]
        growth_pct = technology_maturity[domain]["growth_rate_percentage"]
        mom_level = innovation_momentum[domain]["momentum_level"]
        geo_spread = innovation_momentum[domain]["geographic_spread_count"]
        top_assignee = tech_landscape[domain].get("top_assignee", "N/A")
        rec = strategic_insights[domain]["recommendation"]

        summary_rows.append({
            "Technology_Domain": domain,
            "Maturity_Status": m_status,
            "Innovation_Momentum": mom_level,
            "Growth_Percentage": growth_pct,
            "Geographic_Spread_Count": geo_spread,
            "Top_Assignee": top_assignee,
            "Strategic_Recommendation": rec
        })

    summary_df = pd.DataFrame(summary_rows)
    summary_csv_path = os.path.join(outputs_dir, "technology_summary.csv")
    summary_df.to_csv(summary_csv_path, index=False)
    print(f"[OK] Saved technology_summary.csv -> {summary_csv_path}")

    print("==================================================")
    print("TECHNOLOGY INTELLIGENCE ENGINE COMPLETED")
    print("==================================================")

if __name__ == "__main__":
    run_technology_intelligence()
