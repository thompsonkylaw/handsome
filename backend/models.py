from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Float
from database import Base
import datetime

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Searchable fields
    user_email = Column(String, index=True)
    primary_name = Column(String, index=True)
    user_phone = Column(String, index=True)
    secondary_name = Column(String, nullable=True)
    is_married = Column(Boolean, default=False)
    
    # Result summary
    total_asset_value = Column(Float)
    total_income_value = Column(Float)
    is_eligible = Column(Boolean)
    
    # Full state dump for reloading the application
    # Using JSON column type allows flexible schema evolution without migration for simple apps
    submission_data = Column(JSON) 


class OnePageInsurance(Base):
    __tablename__ = "one_page_insurance"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Owner
    user_email = Column(String, index=True)

    # Client info
    client_name = Column(String, index=True)
    client_phone = Column(String, nullable=True)
    client_whatsapp = Column(String, nullable=True)
    client_email = Column(String, nullable=True)
    client_type = Column(String, nullable=True)

    # Full plan data as JSON
    plans_data = Column(JSON)
