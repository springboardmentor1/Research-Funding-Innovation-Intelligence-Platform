import os
import json
import sys
import pandas as pd

# Add current directory to path if needed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics.analyze_patent_landscape import analyze_landscape, get_dataset_path

def run_verification():
    print("=============================================")
    print("PATENT LANDSCAPE ANALYSIS")
    print("=============================================")

    # 1. Dataset check
    try:
        dataset_path = get_dataset_path()
        if not os.path.exists(dataset_path):
            print("[FAIL] Patent Dataset Not Found")
            sys.exit(1)
        print("\n[OK] Patent Dataset Loaded")
    except Exception as e:
        print(f"[FAIL] Error loading patent dataset: {e}")
        sys.exit(1)

    # Execute landscape analysis
    try:
        analyze_landscape()
    except Exception as e:
        print(f"[FAIL] Error executing landscape analysis: {e}")
        sys.exit(1)

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    landscape_json_path = os.path.join(outputs_dir, "patent_landscape.json")
    dashboard_json_path = os.path.join(outputs_dir, "patent_landscape_dashboard.json")
    summary_csv_path = os.path.join(outputs_dir, "patent_landscape_summary.csv")

    # 2. Technology Landscape check
    if os.path.exists(landscape_json_path):
        with open(landscape_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if "technology_landscape" in data and len(data["technology_landscape"]) > 0:
            print("\n[OK] Technology Landscape Generated")
        else:
            print("\n[FAIL] Technology Landscape empty or missing")
            sys.exit(1)

        # 3. Geographic Analysis check
        if "geographic_distribution" in data and len(data["geographic_distribution"]) > 0:
            print("\n[OK] Geographic Analysis Completed")
        else:
            print("\n[FAIL] Geographic Analysis empty or missing")
            sys.exit(1)

        # 4. Technology Clusters check
        if "emerging_technology_clusters" in data and len(data["emerging_technology_clusters"]) > 0:
            print("\n[OK] Technology Clusters Generated")
        else:
            print("\n[FAIL] Technology Clusters empty or missing")
            sys.exit(1)

        # 5. Assignee Statistics check
        if "top_assignees" in data and len(data["top_assignees"]) > 0:
            print("\n[OK] Assignee Statistics Generated")
        else:
            print("\n[FAIL] Assignee Statistics empty or missing")
            sys.exit(1)
    else:
        print("\n[FAIL] patent_landscape.json not found")
        sys.exit(1)

    # 6. Dashboard Data check
    if os.path.exists(dashboard_json_path):
        with open(dashboard_json_path, "r", encoding="utf-8") as f:
            dash_data = json.load(f)
        if "summary_kpis" in dash_data and "domain_distribution_chart" in dash_data:
            print("\n[OK] Dashboard Data Generated")
        else:
            print("\n[FAIL] patent_landscape_dashboard.json schema invalid")
            sys.exit(1)
    else:
        print("\n[FAIL] patent_landscape_dashboard.json not found")
        sys.exit(1)

    # 7. Summary CSV check
    if os.path.exists(summary_csv_path):
        summary_df = pd.read_csv(summary_csv_path)
        if not summary_df.empty and "Domain" in summary_df.columns:
            print("\n[OK] Summary CSV Generated")
        else:
            print("\n[FAIL] patent_landscape_summary.csv is empty or invalid")
            sys.exit(1)
    else:
        print("\n[FAIL] patent_landscape_summary.csv not found")
        sys.exit(1)

    print("\n=============================================")
    print("\nVerification completed successfully.")

if __name__ == "__main__":
    run_verification()
