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

# Schema for updating a record (all fields optional)
class AssessmentUpdate(BaseModel):
    primary_name: Optional[str] = None
    user_phone: Optional[str] = None
    secondary_name: Optional[str] = None
    is_married: Optional[bool] = None
    total_asset_value: Optional[float] = None
    total_income_value: Optional[float] = None
    is_eligible: Optional[bool] = None
    submission_data: Optional[Dict[str, Any]] = None

# Schema for reading a record (includes ID and timestamp)
class AssessmentResponse(AssessmentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- UserSettings schemas ---
class UserSettingsUpdate(BaseModel):
    advisor_info: Optional[Dict[str, Any]] = None
    enabled_company_codes: Optional[List[str]] = None

class UserSettingsResponse(BaseModel):
    id: int
    user_email: str
    advisor_info: Optional[Dict[str, Any]] = None
    enabled_company_codes: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

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
