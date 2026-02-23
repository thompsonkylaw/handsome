from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Schema for creating a record
class AssessmentCreate(BaseModel):
    user_email: str
    primary_name: str
    user_phone: Optional[str] = None
    secondary_name: Optional[str] = None
    is_married: bool
    total_asset_value: float
    total_income_value: float
    is_eligible: bool
    submission_data: Dict[str, Any]

# Schema for reading a record (includes ID and timestamp)
class AssessmentResponse(AssessmentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- OnePageInsurance schemas ---
class OnePageInsuranceCreate(BaseModel):
    user_email: str
    client_name: str
    client_phone: Optional[str] = None
    client_whatsapp: Optional[str] = None
    client_email: Optional[str] = None
    client_type: Optional[str] = None
    plans_data: List[Dict[str, Any]]

class OnePageInsuranceResponse(OnePageInsuranceCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
