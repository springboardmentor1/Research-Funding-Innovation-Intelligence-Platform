import pandas as pd

df = pd.read_csv(
    "../datasets/patents/patents.csv",
    low_memory=False
)

print(df.columns.tolist())
print(df.head(1).to_dict(orient="records"))