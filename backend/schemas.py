from pydantic import BaseModel, Field

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

class EmployeeOut(BaseModel):
    id: int
    Nama: str
    Divisi_Encoded: int
    Jabatan_Encoded: int
    Gaji: float | None

    class Config:
        from_attributes = True  # pydantic v2

class PredictRequest(BaseModel):
    umur: int = Field(..., ge=18, le=65)
    Divisi_Encoded: int = Field(..., ge=0, le=5)
    Jabatan_Encoded: int = Field(..., ge=0, le=7)

class PredictResponse(BaseModel):
    predicted_salary: int
    currency: str = "IDR"