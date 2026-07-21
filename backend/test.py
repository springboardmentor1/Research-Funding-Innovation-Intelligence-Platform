import pandas as pd

df = pd.read_csv("../datasets/patents/patents.csv")

print(df.columns.tolist())