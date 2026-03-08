from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import numpy as np
import joblib
import pandas as pd

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.sql import func

# =========================
# CONFIG
# =========================
MODEL_PATH = "salary_model.pkl"
CSV_PATH = "clean_data.csv"       # posisi file sesuai screenshot kamu (di root backend)
DATABASE_URL = "sqlite:///./employees.db"

# Mapping harus konsisten dengan Role 1
PENDIDIKAN_MAP = {"SMA": 0, "S1": 1, "S2": 2}
JABATAN_MAP = {"Junior": 0, "Staff": 1, "Senior": 2, "Manager": 3}

# =========================
# DB SETUP (SQLite)
# =========================
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # khusus sqlite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    # sesuai clean_data.csv:
    Nama = Column(String(120), nullable=False)
    Pendidikan_Encoded = Column(Integer, nullable=False)  # 0..2
    Jabatan_Encoded = Column(Integer, nullable=False)     # 0..3
    Gaji = Column(Float, nullable=True)                   # boleh null

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# SCHEMAS (Pydantic)
# =========================
class EmployeeCreate(BaseModel):
    Nama: str = Field(..., min_length=1, max_length=120)
    Pendidikan_Encoded: int = Field(..., ge=0, le=2)
    Jabatan_Encoded: int = Field(..., ge=0, le=3)
    Gaji: Optional[float] = Field(None, ge=0)

class EmployeeUpdate(BaseModel):
    Nama: Optional[str] = Field(None, min_length=1, max_length=120)
    Pendidikan_Encoded: Optional[int] = Field(None, ge=0, le=2)
    Jabatan_Encoded: Optional[int] = Field(None, ge=0, le=3)
    Gaji: Optional[float] = Field(None, ge=0)

class EmployeeOut(BaseModel):
    id: int
    Nama: str
    Pendidikan_Encoded: int
    Jabatan_Encoded: int
    Gaji: Optional[float]

    class Config:
        from_attributes = True  # pydantic v2

class PredictRequest(BaseModel):
    Pendidikan_Encoded: int = Field(..., ge=0, le=2)
    Jabatan_Encoded: int = Field(..., ge=0, le=3)

class PredictResponse(BaseModel):
    predicted_salary: int
    currency: str = "IDR"

# =========================
# APP SETUP
# =========================
app = FastAPI(
    title="Prediksi Gaji API + CRUD (sesuai clean_data.csv)",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # dev only
    allow_credentials=False,    # lebih aman kalau origins="*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model (kalau file ada)
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

# =========================
# BASIC ENDPOINTS
# =========================
@app.get("/")
def root():
    return {
        "message": "API is running. Open /docs",
        "endpoints": {
            "employees": "/employees",
            "predict": "POST /predict",
            "predict_by_employee": "POST /employees/{id}/predict",
            "seed": "POST /seed-from-csv",
            "mapping": "/mapping",
            "health": "/health",
        }
    }

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.get("/mapping")
def mapping():
    return {
        "pendidikan_map": PENDIDIKAN_MAP,
        "jabatan_map": JABATAN_MAP,
        "feature_order": ["Pendidikan_Encoded", "Jabatan_Encoded"]
    }

# =========================
# CRUD EMPLOYEES
# =========================
@app.post("/employees", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    emp = Employee(**payload.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

from sqlalchemy import or_

@app.get("/employees", response_model=List[EmployeeOut])
def list_employees(
    skip: int = 0,
    limit: int = 50,
    nama: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Employee)

    # filter nama (case-insensitive, partial match)
    if nama and nama.strip():
        keyword = f"%{nama.strip()}%"
        q = q.filter(Employee.Nama.ilike(keyword))

    return q.offset(skip).limit(limit).all()

@app.get("/employees/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@app.put("/employees/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(emp, k, v)

    db.commit()
    db.refresh(emp)
    return emp

@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return None

# =========================
# PREDICT
# =========================
@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")

    # urutan fitur sesuai training: [Pendidikan_Encoded, Jabatan_Encoded]
    X = np.array([[payload.Pendidikan_Encoded, payload.Jabatan_Encoded]], dtype=float)
    pred = model.predict(X)[0]
    return {"predicted_salary": int(round(float(pred))), "currency": "IDR"}

@app.post("/employees/{employee_id}/predict", response_model=PredictResponse)
def predict_employee(employee_id: int, db: Session = Depends(get_db)):
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")

    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    X = np.array([[emp.Pendidikan_Encoded, emp.Jabatan_Encoded]], dtype=float)
    pred = model.predict(X)[0]
    return {"predicted_salary": int(round(float(pred))), "currency": "IDR"}

# =========================
# SEED FROM CSV
# =========================
@app.post("/seed-from-csv")
def seed_from_csv(mode: str = "reset", db: Session = Depends(get_db)):
    """
    Import data dari clean_data.csv ke database.

    mode:
      - "reset" (default): hapus semua data dulu, lalu isi dari CSV
      - "append": langsung tambah (bisa dobel kalau dipanggil berkali-kali)
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail=f"{CSV_PATH} tidak ditemukan di folder backend")

    df = pd.read_csv(CSV_PATH)

    required_cols = {"Nama", "Pendidikan_Encoded", "Jabatan_Encoded", "Gaji"}
    if not required_cols.issubset(set(df.columns)):
        raise HTTPException(
            status_code=400,
            detail=f"Kolom CSV harus punya: {sorted(list(required_cols))}. Kolom yang ada: {list(df.columns)}"
        )

    if mode not in ["reset", "append"]:
        raise HTTPException(status_code=400, detail="mode harus 'reset' atau 'append'")

    if mode == "reset":
        db.query(Employee).delete()
        db.commit()

    inserted = 0
    for _, row in df.iterrows():
        gaji_val = None
        try:
            if not pd.isna(row["Gaji"]):
                gaji_val = float(row["Gaji"])
        except Exception:
            gaji_val = None

        emp = Employee(
            Nama=str(row["Nama"]),
            Pendidikan_Encoded=int(row["Pendidikan_Encoded"]),
            Jabatan_Encoded=int(row["Jabatan_Encoded"]),
            Gaji=gaji_val
        )
        db.add(emp)
        inserted += 1

    db.commit()
    return {"message": "seed success", "inserted": inserted, "mode": mode}