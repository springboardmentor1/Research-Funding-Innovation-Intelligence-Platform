import pandas as pd
import os
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)

file_path = os.path.join(BASE_DIR, "..", "data", "patents.csv")

patents = pd.read_csv(file_path)

patents["Innovation Score"] = patents["Citations"] / 2

patents = patents.sort_values(by="Innovation Score", ascending=False)

print("\nInnovation Scores:\n")

print(patents[["Patent Title", "Technology", "Citations", "Innovation Score"]])
plt.figure(figsize=(8,5))

plt.bar(patents["Patent Title"], patents["Innovation Score"])

plt.title("Innovation Scores")
plt.xlabel("Patent Title")
plt.ylabel("Innovation Score")

plt.xticks(rotation=30)

plt.tight_layout()

plt.show()
