import os
import pandas as pd
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)

researchers = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "researchers.csv"))
grants = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "grants.csv"))
publications = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "publications.csv"))

print("Researchers:", len(researchers))
print("Grants:", len(grants))
print("Publications:", len(publications))

plt.figure(figsize=(6,4))
plt.bar(
    ["Researchers", "Grants", "Publications"],
    [len(researchers), len(grants), len(publications)]
)
plt.title("Research Platform Dashboard")
plt.ylabel("Count")
plt.show()