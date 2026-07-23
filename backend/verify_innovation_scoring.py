import os
import json
import sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics.analyze_innovation_scoring import run_innovation_scoring, get_intelligence_path

def run_verification():
    print("=============================================")
    print("INNOVATION SCORING WORKFLOW")
    print("=============================================")

    # 1. Technology Intelligence Loaded check
    try:
        intel_path = get_intelligence_path()
        if not intel_path or not os.path.exists(intel_path):
            run_innovation_scoring()
            intel_path = get_intelligence_path()
            if not intel_path or not os.path.exists(intel_path):
                print("\n[FAIL] Technology Intelligence Outputs Not Found")
                sys.exit(1)
        print("\n[OK] Technology Intelligence Loaded")
    except Exception as e:
        print(f"\n[FAIL] Error loading technology intelligence: {e}")
        sys.exit(1)

    # Execute Innovation Scoring Workflow
    try:
        run_innovation_scoring()
    except Exception as e:
        print(f"\n[FAIL] Error executing Innovation Scoring Workflow: {e}")
        sys.exit(1)

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    scores_json_path = os.path.join(outputs_dir, "innovation_scores.json")
    dashboard_json_path = os.path.join(outputs_dir, "innovation_dashboard.json")
    summary_csv_path = os.path.join(outputs_dir, "innovation_summary.csv")

    if not os.path.exists(scores_json_path):
        print("\n[FAIL] innovation_scores.json not found")
        sys.exit(1)

    with open(scores_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2. Innovation Scores check
    if "innovation_scores" in data and len(data["innovation_scores"]) > 0:
        print("\n[OK] Innovation Scores Generated")
    else:
        print("\n[FAIL] Innovation Scores empty or missing")
        sys.exit(1)

    # 3. Commercialization Readiness check
    if "commercialization_readiness" in data and len(data["commercialization_readiness"]) > 0:
        print("\n[OK] Commercialization Readiness Calculated")
    else:
        print("\n[FAIL] Commercialization Readiness empty or missing")
        sys.exit(1)

    # 4. Market Opportunity Scores check
    if "market_opportunities" in data and len(data["market_opportunities"]) > 0:
        print("\n[OK] Market Opportunity Scores Generated")
    else:
        print("\n[FAIL] Market Opportunity Scores empty or missing")
        sys.exit(1)

    # 5. Technology Risk Scores check
    if "technology_risk" in data and len(data["technology_risk"]) > 0:
        print("\n[OK] Technology Risk Scores Generated")
    else:
        print("\n[FAIL] Technology Risk Scores empty or missing")
        sys.exit(1)

    # 6. Priority Rankings check
    if "priority_rankings" in data and len(data["priority_rankings"]) > 0:
        print("\n[OK] Priority Rankings Generated")
    else:
        print("\n[FAIL] Priority Rankings empty or missing")
        sys.exit(1)

    # 7. Dashboard Data check
    if os.path.exists(dashboard_json_path):
        with open(dashboard_json_path, "r", encoding="utf-8") as f:
            dash_data = json.load(f)
        if "summary_kpis" in dash_data and "priority_leaderboard" in dash_data and "radar_chart_data" in dash_data:
            print("\n[OK] Dashboard Data Generated")
        else:
            print("\n[FAIL] innovation_dashboard.json schema invalid")
            sys.exit(1)
    else:
        print("\n[FAIL] innovation_dashboard.json not found")
        sys.exit(1)

    # 8. Summary CSV check
    if os.path.exists(summary_csv_path):
        summary_df = pd.read_csv(summary_csv_path)
        required_cols = [
            "Technology Domain",
            "Innovation Score",
            "Readiness Score",
            "Opportunity Score",
            "Risk Score",
            "Overall Score",
            "Priority Rank",
            "Recommendation"
        ]
        if not summary_df.empty and all(col in summary_df.columns for col in required_cols):
            print("\n[OK] Summary CSV Generated")
        else:
            print("\n[FAIL] innovation_summary.csv is empty or missing required columns")
            sys.exit(1)
    else:
        print("\n[FAIL] innovation_summary.csv not found")
        sys.exit(1)

    print("\n=============================================")
    print("\nVerification completed successfully.")

if __name__ == "__main__":
    run_verification()
