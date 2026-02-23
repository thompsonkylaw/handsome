from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

import models
import schemas
from database import engine, get_db
import logging
import sys

# Configure logging to show up in Railway logs - v2
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout,
    force=True
)
logger = logging.getLogger(__name__)
logger.info("Starting Handsome OALA API application...")

# Create tables automatically (for simple apps)
try:
    logger.info(f"Attempting to connect to database and create tables...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully!")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")
    # We don't raise here so the app can at least start and return 500s instead of crashing
    # allowing us to see the logs

app = FastAPI(title="Handsome OALA API")

# Configure CORS
# allowing all origins for development to prevent OPTIONS 400/403 errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response

@app.get("/")
def read_root():
    return {"message": "Handsome OALA API is running"}

@app.post("/assessments/", response_model=schemas.AssessmentResponse)
def create_assessment(assessment: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    try:
        
        logger.info(f"Creating assessment for user_email: {assessment.user_email}")
        
        # Try to get phone from submission_data if not provided
        user_phone = assessment.user_phone
        if not user_phone and assessment.submission_data:
            # Assuming structure is {p1: {phone: "..."}}
            p1 = assessment.submission_data.get("p1")
            if p1 and isinstance(p1, dict):
                user_phone = p1.get("phone")

        db_assessment = models.Assessment(
            user_email=assessment.user_email,
            primary_name=assessment.primary_name,
            user_phone=user_phone,
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
        
        logger.info(f"Successfully created assessment with ID: {db_assessment.id}")
        return db_assessment
    except Exception as e:
        logger.error(f"Failed to create assessment: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/assessments/", response_model=List[schemas.AssessmentResponse])
def read_assessments(
    skip: int = 0, 
    limit: int = 100, 
    user_email: Optional[str] = None, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Assessment)
    if user_email:
        query = query.filter(models.Assessment.user_email == user_email)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Assessment.primary_name.ilike(search_term),
                models.Assessment.user_phone.ilike(search_term)
            )
        )
    
    assessments = query.order_by(models.Assessment.created_at.desc()).offset(skip).limit(limit).all()
    return assessments

@app.get("/assessments/{assessment_id}", response_model=schemas.AssessmentResponse)
def read_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


# ─── OnePageInsurance endpoints ───────────────────────────────────────────────

@app.post("/one-page-insurance/", response_model=schemas.OnePageInsuranceResponse)
def save_one_page_insurance(data: schemas.OnePageInsuranceCreate, db: Session = Depends(get_db)):
    """Upsert: if user_email + client_name already exists, update it; otherwise create new."""
    try:
        logger.info(f"Saving onePageInsurance for user_email={data.user_email}, client={data.client_name}")
        existing = db.query(models.OnePageInsurance).filter(
            models.OnePageInsurance.user_email == data.user_email,
            models.OnePageInsurance.client_name == data.client_name,
        ).first()

        if existing:
            existing.client_phone = data.client_phone
            existing.client_whatsapp = data.client_whatsapp
            existing.client_email = data.client_email
            existing.client_type = data.client_type
            existing.plans_data = data.plans_data
            import datetime
            existing.updated_at = datetime.datetime.utcnow()
            db.commit()
            db.refresh(existing)
            logger.info(f"Updated onePageInsurance id={existing.id}")
            return existing
        else:
            record = models.OnePageInsurance(
                user_email=data.user_email,
                client_name=data.client_name,
                client_phone=data.client_phone,
                client_whatsapp=data.client_whatsapp,
                client_email=data.client_email,
                client_type=data.client_type,
                plans_data=data.plans_data,
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            logger.info(f"Created onePageInsurance id={record.id}")
            return record
    except Exception as e:
        logger.error(f"Failed to save onePageInsurance: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/one-page-insurance/", response_model=List[schemas.OnePageInsuranceResponse])
def list_one_page_insurance(
    user_email: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.OnePageInsurance)
    if user_email:
        query = query.filter(models.OnePageInsurance.user_email == user_email)
    if search:
        query = query.filter(models.OnePageInsurance.client_name.ilike(f"%{search}%"))
    return query.order_by(models.OnePageInsurance.updated_at.desc()).offset(skip).limit(limit).all()


@app.get("/one-page-insurance/{record_id}", response_model=schemas.OnePageInsuranceResponse)
def get_one_page_insurance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.OnePageInsurance).filter(models.OnePageInsurance.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@app.delete("/one-page-insurance/{record_id}")
def delete_one_page_insurance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.OnePageInsurance).filter(models.OnePageInsurance.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted successfully"}
