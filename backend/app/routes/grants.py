from fastapi import APIRouter
import pandas as pd

router = APIRouter()

grants = pd.read_csv("data/grants.csv")
grants = grants.fillna("")

@router.get("/grants")
def get_grants():
    return grants.head(10).to_dict(orient="records")