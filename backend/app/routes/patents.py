from fastapi import APIRouter, Query
from app.services.preprocessing import load_patents

router = APIRouter()

patents = load_patents()


@router.get("/patents")
def get_patents(keyword: str = Query(None)):

    result = patents

    if keyword:

        keyword = keyword.lower()

        mask = (
            patents["title"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)

            |

            patents["assignee"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)

            |

            patents["inventor/author"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)
        )

        result = patents[mask]

        print(f"Keyword: {keyword}")
        print(f"Matching Patents: {len(result)}")

    return {
        "count": len(result),
        "results": result.head(20).to_dict(orient="records")
    }