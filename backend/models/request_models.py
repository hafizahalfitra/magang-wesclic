from pydantic import BaseModel, Field, model_validator

class EmployeeCreate(BaseModel):
    Nama: str = Field(..., min_length=1, max_length=120)
    Divisi_Encoded: int = Field(..., ge=0, le=5)
    Jabatan_Encoded: int = Field(..., ge=0, le=7)
    Gaji: float | None = Field(None, ge=0)

class EmployeeUpdate(BaseModel):
    Nama: str | None = Field(None, min_length=1, max_length=120)
    Divisi_Encoded: int | None = Field(None, ge=0, le=5)
    Jabatan_Encoded: int | None = Field(None, ge=0, le=7)
    Gaji: float | None = Field(None, ge=0)

class PredictRequest(BaseModel):
    umur: int = Field(..., ge=18, le=65)
    Divisi_Encoded: int = Field(..., ge=0, le=5)
    Jabatan_Encoded: int = Field(..., ge=0, le=7)

class ForecastRequest(BaseModel):
    division: str
    current_month: int = Field(..., ge=1, le=12)
    target_month: int = Field(..., ge=1, le=12)
    status: str
    junior_count: int = Field(0, ge=0)
    staff_count: int = Field(0, ge=0)
    spv_count: int = Field(0, ge=0)
    manager_count: int = Field(0, ge=0)

    @model_validator(mode='after')
    def validate_forecast(self):
        if self.target_month <= self.current_month:
            raise ValueError("target_month must be greater than current_month")
        
        total_count = self.junior_count + self.staff_count + self.spv_count + self.manager_count
        if total_count <= 0:
            raise ValueError("At least one employee count must be greater than 0")
        
        valid_statuses = ["Kontrak", "Tetap", "Probation"]
        if self.status not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")
            
        return self

class LoginRequest(BaseModel):
    email: str
    password: str
