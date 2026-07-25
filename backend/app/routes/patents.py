from fastapi import APIRouter
import pandas as pd

router = APIRouter()

patents = pd.read_excel("data/patents.xlsx")
patents = patents.fillna("")


@router.get("/patents")
def get_patents():
    return patents.head(10).to_dict(orient="records")