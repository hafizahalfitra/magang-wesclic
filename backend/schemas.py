from pydantic import BaseModel, Field

class EmployeeCreate(BaseModel):
    Nama: str = Field(..., min_length=1, max_length=120)
    Pendidikan_Encoded: int = Field(..., ge=0, le=2)
    Jabatan_Encoded: int = Field(..., ge=0, le=3)
    Gaji: float | None = Field(None, ge=0)

class EmployeeUpdate(BaseModel):
    Nama: str | None = Field(None, min_length=1, max_length=120)
    Pendidikan_Encoded: int | None = Field(None, ge=0, le=2)
    Jabatan_Encoded: int | None = Field(None, ge=0, le=3)
    Gaji: float | None = Field(None, ge=0)

class EmployeeOut(BaseModel):
    id: int
    Nama: str
    Pendidikan_Encoded: int
    Jabatan_Encoded: int
    Gaji: float | None

    class Config:
        from_attributes = True  # pydantic v2

class PredictRequest(BaseModel):
    Pendidikan_Encoded: int = Field(..., ge=0, le=2)
    Jabatan_Encoded: int = Field(..., ge=0, le=3)

class PredictResponse(BaseModel):
    predicted_salary: int
    currency: str = "IDR"