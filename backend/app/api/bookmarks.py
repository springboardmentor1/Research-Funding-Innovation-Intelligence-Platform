from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bookmark

router = APIRouter(tags=["Bookmarks"])


class BookmarkRequest(BaseModel):
    title: str
    authors: str
    year: str
    abstract: str
    url: str


@router.post("/bookmarks")
def save_bookmark(bookmark: BookmarkRequest, db: Session = Depends(get_db)):

    existing = db.query(Bookmark).filter(
        Bookmark.title == bookmark.title
    ).first()

    if existing:
        return {
            "message": "Paper already bookmarked."
        }

    new_bookmark = Bookmark(
        title=bookmark.title,
        authors=bookmark.authors,
        year=bookmark.year,
        abstract=bookmark.abstract,
        url=bookmark.url
    )

    db.add(new_bookmark)
    db.commit()
    db.refresh(new_bookmark)

    return {
        "message": "Paper bookmarked successfully."
    }


@router.get("/bookmarks")
def get_bookmarks(db: Session = Depends(get_db)):
    return db.query(Bookmark).all()


@router.delete("/bookmarks")
def clear_bookmarks(db: Session = Depends(get_db)):

    db.query(Bookmark).delete()

    db.commit()

    return {
        "message": "All bookmarks removed."
    }