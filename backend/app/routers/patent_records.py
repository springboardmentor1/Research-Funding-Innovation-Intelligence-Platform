from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.database import get_db
from app.models.patent import Patent
from app.models.user import User
from app.schemas.patent import PatentCreate, PatentUpdate, PatentResponse

router = APIRouter( prefix="/patent-records", tags=["Patent Records"] )

@router.post("/", response_model=PatentResponse)
def create_patent( patent: PatentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user) ):
    new_patent = Patent(user_id=current_user.id, **patent.model_dump())
    db.add(new_patent)
    db.commit()
    db.refresh(new_patent)
    return new_patent

@router.get("/", response_model=list[PatentResponse])
def get_patents( db: Session = Depends(get_db), current_user: User = Depends(get_current_user) ):
    return db.query(Patent).filter(Patent.user_id == current_user.id).all()

@router.put("/{patent_id}", response_model=PatentResponse)
def update_patent( patent_id: int, patent: PatentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user) ):
    patent_query = db.query(Patent).filter( Patent.id == patent_id, Patent.user_id == current_user.id )

    existing = patent_query.first()
    if not existing:
        raise HTTPException(status_code=404, detail="Patent not found")

    update_data = patent.model_dump(exclude_unset=True)
    patent_query.update(update_data)
    db.commit()

    return patent_query.first()

@router.delete("/{patent_id}")
def delete_patent( patent_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user) ):
    patent = db.query(Patent).filter( Patent.id == patent_id, Patent.user_id == current_user.id ).first()

    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")

    db.delete(patent)
    db.commit()

    return {"message": "Patent deleted successfully"}