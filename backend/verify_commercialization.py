import os
import json
import sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics.analyze_commercialization_recommendations import run_commercialization_recommendations, get_scores_path

def run_verification():
    print("=============================================")
    print("COMMERCIALIZATION RECOMMENDATIONS")
    print("=============================================")

    # 1. Innovation Scores Loaded check
    try:
        scores_path = get_scores_path()
        if not scores_path or not os.path.exists(scores_path):
            run_commercialization_recommendations()
            scores_path = get_scores_path()
            if not scores_path or not os.path.exists(scores_path):
                print("\n[FAIL] Innovation Scores Outputs Not Found")
                sys.exit(1)
        print("\n[OK] Innovation Scores Loaded")
    except Exception as e:
        print(f"\n[FAIL] Error loading innovation scores: {e}")
        sys.exit(1)

    # Execute Commercialization Recommendations Workflow
    try:
        run_commercialization_recommendations()
    except Exception as e:
        print(f"\n[FAIL] Error executing Commercialization Recommendations Workflow: {e}")
        sys.exit(1)

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    recs_json_path = os.path.join(outputs_dir, "commercialization_recommendations.json")
    dashboard_json_path = os.path.join(outputs_dir, "commercialization_dashboard.json")
    summary_csv_path = os.path.join(outputs_dir, "commercialization_summary.csv")

    if not os.path.exists(recs_json_path):
        print("\n[FAIL] commercialization_recommendations.json not found")
        sys.exit(1)

    with open(recs_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2. Commercialization Strategies check
    if "commercialization_strategies" in data and len(data["commercialization_strategies"]) > 0:
        print("\n[OK] Commercialization Strategies Generated")
    else:
        print("\n[FAIL] Commercialization Strategies empty or missing")
        sys.exit(1)

    # 3. Investment Recommendations check
    if "investment_recommendations" in data and len(data["investment_recommendations"]) > 0:
        print("\n[OK] Investment Recommendations Generated")
    else:
        print("\n[FAIL] Investment Recommendations empty or missing")
        sys.exit(1)

    # 4. Technology Transfer Readiness check
    if "technology_transfer_readiness" in data and len(data["technology_transfer_readiness"]) > 0:
        print("\n[OK] Technology Transfer Readiness Generated")
    else:
        print("\n[FAIL] Technology Transfer Readiness empty or missing")
        sys.exit(1)

    # 5. Partnership Recommendations check
    if "partnership_recommendations" in data and len(data["partnership_recommendations"]) > 0:
        print("\n[OK] Partnership Recommendations Generated")
    else:
        print("\n[FAIL] Partnership Recommendations empty or missing")
        sys.exit(1)

    # 6. Dashboard Data check
    if os.path.exists(dashboard_json_path):
        with open(dashboard_json_path, "r", encoding="utf-8") as f:
            dash_data = json.load(f)
        if "summary_kpis" in dash_data and "recommendations_leaderboard" in dash_data and "strategy_distribution" in dash_data:
            print("\n[OK] Dashboard Data Generated")
        else:
            print("\n[FAIL] commercialization_dashboard.json schema invalid")
            sys.exit(1)
    else:
        print("\n[FAIL] commercialization_dashboard.json not found")
        sys.exit(1)

    # 7. Summary CSV check
    if os.path.exists(summary_csv_path):
        summary_df = pd.read_csv(summary_csv_path)
        required_cols = [
            "Technology Domain",
            "Overall Innovation Score",
            "Commercialization Strategy",
            "Investment Priority",
            "Technology Transfer Readiness",
            "Partnership Recommendation",
            "Market Entry Strategy",
            "Timeline",
            "Executive Recommendation"
        ]
        if not summary_df.empty and all(col in summary_df.columns for col in required_cols):
            print("\n[OK] Summary CSV Generated")
        else:
            print("\n[FAIL] commercialization_summary.csv is empty or missing required columns")
            sys.exit(1)
    else:
        print("\n[FAIL] commercialization_summary.csv not found")
        sys.exit(1)

    print("\n=============================================")
    print("\nVerification completed successfully.")

if __name__ == "__main__":
    run_verification()
