import os
import requests

# ----------------------------
# Configuration
# ----------------------------
OUTPUT_DIR = "datasets/patents"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "patents.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Sample patent dataset (GitHub raw file)
DATASET_URL = "https://raw.githubusercontent.com/selva86/datasets/master/Patent.csv"

print("Downloading patent dataset...")

try:
    response = requests.get(DATASET_URL, timeout=30)
    response.raise_for_status()

    with open(OUTPUT_FILE, "wb") as f:
        f.write(response.content)

    print(f"✅ Patent dataset saved to: {OUTPUT_FILE}")

except Exception as e:
    print(f"❌ Error: {e}")