import os
import json
import sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics.analyze_technology_intelligence import run_technology_intelligence, get_landscape_path

def run_verification():
    print("=============================================")
    print("TECHNOLOGY INTELLIGENCE ENGINE")
    print("=============================================")

    # 1. Patent Landscape Loaded check
    try:
        landscape_path = get_landscape_path()
        if not landscape_path or not os.path.exists(landscape_path):
            # Attempt to run intelligence which will auto-generate landscape if needed
            run_technology_intelligence()
            landscape_path = get_landscape_path()
            if not landscape_path or not os.path.exists(landscape_path):
                print("\n[FAIL] Patent Landscape Outputs Not Found")
                sys.exit(1)
        print("\n[OK] Patent Landscape Loaded")
    except Exception as e:
        print(f"\n[FAIL] Error loading patent landscape: {e}")
        sys.exit(1)

    # Execute Technology Intelligence Engine
    try:
        run_technology_intelligence()
    except Exception as e:
        print(f"\n[FAIL] Error executing Technology Intelligence Engine: {e}")
        sys.exit(1)

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    intelligence_json_path = os.path.join(outputs_dir, "technology_intelligence.json")
    dashboard_json_path = os.path.join(outputs_dir, "technology_dashboard.json")
    summary_csv_path = os.path.join(outputs_dir, "technology_summary.csv")

    if not os.path.exists(intelligence_json_path):
        print("\n[FAIL] technology_intelligence.json not found")
        sys.exit(1)

    with open(intelligence_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2. Technology Maturity check
    if "technology_maturity" in data and len(data["technology_maturity"]) > 0:
        print("\n[OK] Technology Maturity Generated")
    else:
        print("\n[FAIL] Technology Maturity empty or missing")
        sys.exit(1)

    # 3. Emerging Technologies check
    if "emerging_technologies" in data and len(data["emerging_technologies"]) > 0:
        print("\n[OK] Emerging Technologies Identified")
    else:
        print("\n[FAIL] Emerging Technologies empty or missing")
        sys.exit(1)

    # 4. Innovation Momentum check
    if "innovation_momentum" in data and len(data["innovation_momentum"]) > 0:
        print("\n[OK] Innovation Momentum Calculated")
    else:
        print("\n[FAIL] Innovation Momentum empty or missing")
        sys.exit(1)

    # 5. Technology Convergence check
    if "technology_convergence" in data and len(data["technology_convergence"]) > 0:
        print("\n[OK] Technology Convergence Generated")
    else:
        print("\n[FAIL] Technology Convergence empty or missing")
        sys.exit(1)

    # 6. Adoption Trends check
    if "adoption_trends" in data and len(data["adoption_trends"]) > 0:
        print("\n[OK] Adoption Trends Generated")
    else:
        print("\n[FAIL] Adoption Trends empty or missing")
        sys.exit(1)

    # 7. Dashboard Data check
    if os.path.exists(dashboard_json_path):
        with open(dashboard_json_path, "r", encoding="utf-8") as f:
            dash_data = json.load(f)
        if "summary_kpis" in dash_data and "maturity_distribution_chart" in dash_data and "momentum_radar" in dash_data:
            print("\n[OK] Dashboard Data Generated")
        else:
            print("\n[FAIL] technology_dashboard.json schema invalid")
            sys.exit(1)
    else:
        print("\n[FAIL] technology_dashboard.json not found")
        sys.exit(1)

    # 8. Summary CSV check
    if os.path.exists(summary_csv_path):
        summary_df = pd.read_csv(summary_csv_path)
        required_cols = ["Technology_Domain", "Maturity_Status", "Innovation_Momentum", "Growth_Percentage", "Geographic_Spread_Count", "Top_Assignee", "Strategic_Recommendation"]
        if not summary_df.empty and all(col in summary_df.columns for col in required_cols):
            print("\n[OK] Summary CSV Generated")
        else:
            print("\n[FAIL] technology_summary.csv is empty or missing required columns")
            sys.exit(1)
    else:
        print("\n[FAIL] technology_summary.csv not found")
        sys.exit(1)

    print("\n=============================================")
    print("\nVerification completed successfully.")

if __name__ == "__main__":
    run_verification()
