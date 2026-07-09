from fastapi import APIRouter
import pandas as pd

router = APIRouter()

papers = pd.read_csv("data/arxiv_ai.csv")
papers = papers.fillna("")

@router.get("/papers")
def get_papers():
    return papers.head(10).to_dict(orient="records")