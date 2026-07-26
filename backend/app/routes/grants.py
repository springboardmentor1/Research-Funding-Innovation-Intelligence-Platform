from fastapi import APIRouter, Query
from app.services.preprocessing import load_grants

router = APIRouter()

grants = load_grants()


@router.get("/grants")
def get_grants(keyword: str = Query(None)):

    result = grants

    if keyword:

        keyword = keyword.lower()

        mask = (
            grants["opportunity_title"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)

            |

            grants["summary_description"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)

            |

            grants["agency_name"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)

            |

            grants["funding_categories"]
            .astype(str)
            .str.lower()
            .str.contains(keyword, na=False)
        )

        result = grants[mask]

        print(f"Keyword: {keyword}")
        print(f"Matching Grants: {len(result)}")

    return {
        "count": len(result),
        "results": result.head(20).to_dict(orient="records")
    }