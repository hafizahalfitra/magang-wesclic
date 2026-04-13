from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import json
import numpy as np
import joblib
import pandas as pd

from database import engine, SessionLocal, get_db, Base
from models import Employee
import crud
from schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeOut,
    PredictRequest,
    PredictResponse
)

# =========================
# CONFIG
# =========================
MODEL_PATH = "salary_model.pkl"
CSV_PATH = "clean_data.csv"     
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
            pass

    return pendidikan_map, jabatan_map, feature_order

Base.metadata.create_all(bind=engine)

# Metadata for Swagger UI
tags_metadata = [
    {
        "name": "General",
        "description": "General system health, mapping configs, and seed data endpoints.",
    },
    {
        "name": "Employee CRUD",
        "description": "Operations to Create, Read, Update, and Delete employee data. Perfect for interacting with the Frontend.",
    },
    {
        "name": "Machine Learning",
        "description": "Predict salary based on employee attributes or specifically by employee ID.",
    },
]

# =========================
# APP SETUP
# =========================
app = FastAPI(
    title="Employee Intelligence & Salary Prediction API",
    description="Backend API with full CRUD for the Frontend, integrated with Machine Learning to predict salaries based on Employee attributes. The display is carefully customized for ease of testing data.",
    version="3.0.0",
    openapi_tags=tags_metadata
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
@app.get("/", tags=["General"])
def root():
    return {
        "message": "Welcome to the Employee Intelligence API. Please visit /docs for the interactive administrative panel.",
        "endpoints": {
            "docs": "/docs",
            "employees": "/employees",
            "predict": "POST /predict",
            "health": "/health",
        }
    }

@app.get("/health", tags=["General"], summary="Check system health")
def health():
    """Verify that backend and ML model are properly loaded."""
    return {"status": "ok", "model_loaded": model is not None}

@app.get("/mapping", tags=["General"], summary="Get data mapping configurations")
def mapping():
    """Returns mapping configurations for education and position levels used by the ML model."""
    pendidikan_map, jabatan_map, feature_order = load_mapping()
    return {
        "pendidikan_map": pendidikan_map,
        "jabatan_map": jabatan_map,
        "feature_order": feature_order
    }

# =========================
# CRUD EMPLOYEES
# =========================
@app.post("/employees", response_model=EmployeeOut, status_code=201, tags=["Employee CRUD"], summary="Add a new Employee")
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    """Add a new employee to the database specifying their characteristics."""
    return crud.create_employee(db=db, payload=payload)

@app.get("/employees", response_model=List[EmployeeOut], tags=["Employee CRUD"], summary="Get list of Employees")
def list_employees(
    skip: int = 0,
    limit: int = 50,
    nama: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve employees with optional limit, skip and search by name. Easy to call from frontend tables/grids."""
    return crud.list_employees(db=db, skip=skip, limit=limit, nama=nama)

@app.get("/employees/{employee_id}", response_model=EmployeeOut, tags=["Employee CRUD"], summary="Get specific Employee details")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Fetch an individual employee by their ID."""
    emp = crud.get_employee(db=db, employee_id=employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@app.put("/employees/{employee_id}", response_model=EmployeeOut, tags=["Employee CRUD"], summary="Update Employee information")
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    """Update characteristics or salary constraint of an employee."""
    emp = crud.update_employee(db=db, employee_id=employee_id, payload=payload)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@app.delete("/employees/{employee_id}", status_code=204, tags=["Employee CRUD"], summary="Remove an Employee")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Delete an employee completely."""
    success = crud.delete_employee(db=db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return None

# =========================
# PREDICT
# =========================
@app.post("/predict", response_model=PredictResponse, tags=["Machine Learning"], summary="Predict Salary (Standalone)")
def predict(payload: PredictRequest):
    """Predict a salary based on custom attributes not tied to a specific employee ID."""
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")

    X = np.array([[payload.Pendidikan_Encoded, payload.Jabatan_Encoded]], dtype=float)
    pred = model.predict(X)[0]
    return {"predicted_salary": int(round(float(pred))), "currency": "IDR"}

@app.post("/employees/{employee_id}/predict", response_model=PredictResponse, tags=["Machine Learning"], summary="Predict Employee's Salary")
def predict_employee(employee_id: int, db: Session = Depends(get_db)):
    """Automatically fetch an employee's attributes and predict what their salary should be using the ML brain."""
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")

    emp = crud.get_employee(db=db, employee_id=employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    X = np.array([[emp.Pendidikan_Encoded, emp.Jabatan_Encoded]], dtype=float)
    pred = model.predict(X)[0]
    return {"predicted_salary": int(round(float(pred))), "currency": "IDR"}

# =========================
# SEED FROM CSV
# =========================
@app.post("/seed-from-csv", tags=["General"], summary="Bulk import data from CSV")
def seed_from_csv(mode: str = "reset", db: Session = Depends(get_db)):
    """
    Import data from clean_data.csv into the database.
    Supported modes:
      - 'reset': Deletes all existing employees and loads from CSV.
      - 'append': Adds CSV data without deleting existing ones.
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail=f"{CSV_PATH} tidak ditemukan di folder backend")

    if mode not in ["reset", "append"]:
        raise HTTPException(status_code=400, detail="mode harus 'reset' atau 'append'")

    df = pd.read_csv(CSV_PATH)
    df.columns = [c.strip() for c in df.columns]

    colmap = {c.lower(): c for c in df.columns}
    def col(name_lower: str): return colmap.get(name_lower)

    pendidikan_map, jabatan_map, _ = load_mapping()

    nama_col = col("nama")
    gaji_col = col("gaji")
    pend_enc_col = col("pendidikan_encoded")
    jab_enc_col = col("jabatan_encoded")
    pend_txt_col = col("pendidikan")
    jab_txt_col = col("jabatan")

    if not nama_col:
        raise HTTPException(status_code=400, detail=f"Kolom 'nama' tidak ada. Tersedia: {df.columns.tolist()}")

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

        if pend_enc_col:
            pendidikan_enc = int(row[pend_enc_col])
        else:
            val = str(row[pend_txt_col]).strip()
            if val not in pendidikan_map:
                raise HTTPException(status_code=400, detail=f"Pendidikan tidak dikenal: '{val}'")
            pendidikan_enc = int(pendidikan_map[val])

        if jab_enc_col:
            jabatan_enc = int(row[jab_enc_col])
        else:
            val = str(row[jab_txt_col]).strip()
            if val not in jabatan_map:
                raise HTTPException(status_code=400, detail=f"Jabatan tidak dikenal: '{val}'")
            jabatan_enc = int(jabatan_map[val])

        gaji_val = None
        if gaji_col and not pd.isna(row[gaji_col]):
            try:
                gaji_val = float(row[gaji_col])
            except Exception:
                gaji_val = None

        payload = EmployeeCreate(
            Nama=nama,
            Pendidikan_Encoded=pendidikan_enc,
            Jabatan_Encoded=jabatan_enc,
            Gaji=gaji_val
        )
        crud.create_employee(db=db, payload=payload)
        inserted += 1

    return {"message": "seed success", "inserted": inserted, "mode": mode}