import pandas as pd
import os

folder = "../datasets/patents/data"

files = [
    "2010.csv",
    "2011.csv",
    "2019.csv"
]

dfs = []

for file in files:
    path = os.path.join(folder, file)

    print("Loading", file)

    df = pd.read_csv(path, low_memory=False)

    dfs.append(df)

combined = pd.concat(dfs, ignore_index=True)

combined.to_csv(
    "../datasets/patents/patents.csv",
    index=False
)

print("Total patents:", len(combined))