from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import json
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
CSV_PATH = "clean_data.csv"     
DATABASE_URL = "sqlite:///./employees.db"
MAPPING_PATH = "mapping_config.json"

# Default mapping (fallback)
DEFAULT_PENDIDIKAN_MAP = {"SMA": 0, "S1": 1, "S2": 2}
DEFAULT_JABATAN_MAP = {"Junior": 0, "Staff": 1, "Senior": 2, "Manager": 3}

def load_mapping():
    """
    Ambil mapping dari mapping_config.json kalau ada.
    Kalau tidak ada, pakai default mapping.
    """
    pendidikan_map = DEFAULT_PENDIDIKAN_MAP
    jabatan_map = DEFAULT_JABATAN_MAP
    feature_order = ["Pendidikan_Encoded", "Jabatan_Encoded"]

    if os.path.exists(MAPPING_PATH):
        try:
            with open(MAPPING_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            pendidikan_map = data.get("pendidikan_map", pendidikan_map)
            jabatan_map = data.get("jabatan_map", jabatan_map)
            feature_order = data.get("feature_order", feature_order)
        except Exception:
            # kalau file mapping rusak, tetap fallback default
            pass

    return pendidikan_map, jabatan_map, feature_order

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

    # disimpan dalam bentuk encoded agar konsisten untuk model
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
    title="Prediksi Gaji API + CRUD (compatible clean_data baru/lama)",
    version="2.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # dev only
    allow_credentials=False,
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
    pendidikan_map, jabatan_map, feature_order = load_mapping()
    return {
        "pendidikan_map": pendidikan_map,
        "jabatan_map": jabatan_map,
        "feature_order": feature_order
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

@app.get("/employees", response_model=List[EmployeeOut])
def list_employees(
    skip: int = 0,
    limit: int = 50,
    nama: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Employee)
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
# SEED FROM CSV (compatible format lama & baru)
# =========================
@app.post("/seed-from-csv")
def seed_from_csv(mode: str = "reset", db: Session = Depends(get_db)):
    """
    Import data dari clean_data.csv ke database.
    Support:
      - kolom kecil/besar (Nama/nama, Pendidikan/pendidikan, dst)
      - format encoded atau teks
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail=f"{CSV_PATH} tidak ditemukan di folder backend")

    if mode not in ["reset", "append"]:
        raise HTTPException(status_code=400, detail="mode harus 'reset' atau 'append'")

    df = pd.read_csv(CSV_PATH)
    df.columns = [c.strip() for c in df.columns]

    # mapping asli → lowercase agar case-insensitive
    colmap = {c.lower(): c for c in df.columns}

    def col(name_lower: str):
        return colmap.get(name_lower)

    pendidikan_map, jabatan_map, _ = load_mapping()

    nama_col = col("nama")
    gaji_col = col("gaji")

    pend_enc_col = col("pendidikan_encoded")
    jab_enc_col = col("jabatan_encoded")

    pend_txt_col = col("pendidikan")  # dataset baru kamu ini
    jab_txt_col = col("jabatan")

    if not nama_col:
        raise HTTPException(status_code=400, detail=f"Kolom 'nama' tidak ada. Kolom tersedia: {df.columns.tolist()}")

    if not (pend_enc_col or pend_txt_col):
        raise HTTPException(status_code=400, detail="CSV harus punya 'pendidikan_encoded' atau 'pendidikan'")

    if not (jab_enc_col or jab_txt_col):
        raise HTTPException(status_code=400, detail="CSV harus punya 'jabatan_encoded' atau 'jabatan'")

    if mode == "reset":
        db.query(Employee).delete()
        db.commit()

    inserted = 0
    for _, row in df.iterrows():
        nama = str(row[nama_col]).strip()

        # pendidikan: encoded atau teks
        if pend_enc_col:
            pendidikan_enc = int(row[pend_enc_col])
        else:
            val = str(row[pend_txt_col]).strip()
            if val not in pendidikan_map:
                raise HTTPException(status_code=400, detail=f"Pendidikan tidak dikenal: '{val}'")
            pendidikan_enc = int(pendidikan_map[val])

        # jabatan: encoded atau teks
        if jab_enc_col:
            jabatan_enc = int(row[jab_enc_col])
        else:
            val = str(row[jab_txt_col]).strip()
            if val not in jabatan_map:
                raise HTTPException(status_code=400, detail=f"Jabatan tidak dikenal: '{val}'")
            jabatan_enc = int(jabatan_map[val])

        # gaji optional
        gaji_val = None
        if gaji_col and not pd.isna(row[gaji_col]):
            try:
                gaji_val = float(row[gaji_col])
            except Exception:
                gaji_val = None

        emp = Employee(
            Nama=nama,
            Pendidikan_Encoded=pendidikan_enc,
            Jabatan_Encoded=jabatan_enc,
            Gaji=gaji_val
        )
        db.add(emp)
        inserted += 1

    db.commit()
    return {"message": "seed success", "inserted": inserted, "mode": mode}