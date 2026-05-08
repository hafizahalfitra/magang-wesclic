from pydantic import BaseModel
from typing import List, Optional

class EmployeeOut(BaseModel):
    id: int
    Nama: str
    Divisi_Encoded: int
    Jabatan_Encoded: int
    Gaji: float | None

    class Config:
        from_attributes = True

class PredictResponse(BaseModel):
    predicted_salary: int
    currency: str = "IDR"

class ForecastBreakdown(BaseModel):
    position: str
    count: int
    salary_per_person: int
    total_salary: int
    formatted_total_salary: str

class ForecastResponse(BaseModel):
    division: str
    current_month: int
    target_month: int
    forecast_period: int
    headcount: int
    breakdown: List[ForecastBreakdown]
    base_budget: int
    growth_rate: float
    estimated_total_budget: int
    formatted_total_budget: str
    insight: str

class UserResponse(BaseModel):
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
