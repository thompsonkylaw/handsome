from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Float
from database import Base
import datetime

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Searchable fields
    primary_name = Column(String, index=True)
    secondary_name = Column(String, nullable=True)
    is_married = Column(Boolean, default=False)
    
    # Result summary
    total_asset_value = Column(Float)
    total_income_value = Column(Float)
    is_eligible = Column(Boolean)
    
    # Full state dump for reloading the application
    # Using JSON column type allows flexible schema evolution without migration for simple apps
    submission_data = Column(JSON) 
