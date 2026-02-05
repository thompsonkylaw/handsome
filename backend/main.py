from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Create tables automatically (for simple apps)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Handsome OALA API")

# Configure CORS for local React dev (port 5173 usually) and production
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Add your deployed frontend URL here later, e.g. https://handsome-oala.vercel.app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Handsome OALA API is running"}

@app.post("/assessments/", response_model=schemas.AssessmentResponse)
def create_assessment(assessment: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    db_assessment = models.Assessment(
        primary_name=assessment.primary_name,
        secondary_name=assessment.secondary_name,
        is_married=assessment.is_married,
        total_asset_value=assessment.total_asset_value,
        total_income_value=assessment.total_income_value,
        is_eligible=assessment.is_eligible,
        submission_data=assessment.submission_data
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@app.get("/assessments/", response_model=List[schemas.AssessmentResponse])
def read_assessments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    assessments = db.query(models.Assessment).order_by(models.Assessment.created_at.desc()).offset(skip).limit(limit).all()
    return assessments

@app.get("/assessments/{assessment_id}", response_model=schemas.AssessmentResponse)
def read_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment
