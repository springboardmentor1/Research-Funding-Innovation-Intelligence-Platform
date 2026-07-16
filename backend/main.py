import os
import datetime
from typing import List, Optional
import requests
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from pymongo import MongoClient

# --- CONFIGURATION & SECURITY ---
SECRET_KEY = "super_secret_key_change_in_production"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- DATABASE INITS (SQLAlchemy + PyMongo) ---
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/platform_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["data_lake"]

app = FastAPI(title="Research Funding & Innovation Intelligence Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SQL MODELS & SCHEMAS ---
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Researcher, Startup Founder, Innovation Manager, Admin
    domains = Column(Text, default="")
    keywords = Column(Text, default="")

Base.metadata.create_all(bind=engine)

class UserRegister(BaseModel):
    username: str
    password: str
    role: str

class ProfileUpdate(BaseModel):
    domains: str
    keywords: str

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- UTILITIES ---
def get_user(db: Session, username: str):
    return db.query(UserDB).filter(UserDB.username == username).first()

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError: raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user(db, username=username)
    if user is None: raise HTTPException(status_code=401, detail="User not found")
    return user

# --- AUTH ENDPOINTS ---
@app.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if get_user(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed = pwd_context.hash(user.password)
    db_user = UserDB(username=user.username, hashed_password=hashed, role=user.role)
    db.add(db_user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role}

# --- PROFILE WORKFLOWS ---
@app.get("/profile")
def read_profile(current_user: UserDB = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "role": current_user.role,
        "domains": current_user.domains,
        "keywords": current_user.keywords
    }

@app.put("/profile")
def update_profile(profile: ProfileUpdate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.domains = profile.domains
    current_user.keywords = profile.keywords
    db.commit()
    return {"message": "Profile updated successfully"}

# --- EXTERNAL DATASETS INTEGRATION ---
@app.get("/fetch-datasets")
def fetch_and_store_datasets(query: str, current_user: UserDB = Depends(get_current_user)):
    # 1. Fetch Academic Papers from OpenAlex API
    openalex_url = f"https://api.openalex.org/works?search={query}&per_page=3"
    papers = []
    try:
        r = requests.get(openalex_url, timeout=5).json()
        for item in r.get("results", []):
            papers.append({
                "title": item.get("title"),
                "publication_year": item.get("publication_year"),
                "doi": item.get("doi"),
                "type": "publication"
            })
    except Exception: pass

    # 2. Mock Patent Data Setup (Simulating external Google Patents/USPTO fields)
    mock_patents = [
        {"title": f"AI Method for Optimization in {query}", "assignee": "Innovation Corp", "filing_date": "2025-05-12", "type": "patent"},
        {"title": f"Distributed Ledger Systems for {query} Verification", "assignee": "Tech Labs Inc", "filing_date": "2026-02-20", "type": "patent"}
    ]

    # Save all ingested external records to MongoDB Data Lake
    all_records = papers + mock_patents
    if all_records:
        mongo_db["raw_intelligence"].insert_many(all_records)

    return {"message": f"Successfully ingested {len(all_records)} mixed records into MongoDB", "data": all_records}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)