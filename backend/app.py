from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import json
import numpy as np
import joblib
import pandas as pd

from database import engine, get_db, Base
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
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "salary_model.pkl")
CSV_PATH = os.path.join(BASE_DIR, "data", "dataset_clean.csv")
MAPPING_PATH = os.path.join(BASE_DIR, "mapping_config.json")

# Mapping jabatan baru
DEFAULT_JABATAN_MAP = {
    "CEO": 0,
    "CFO": 1,
    "CMO": 2,
    "CTO": 3,
    "Manajer": 4,
    "SPV": 5,
    "STAF": 6,
    "Junior": 7
}

# Mapping divisi untuk kebutuhan prediksi divisi
DEFAULT_DIVISI_MAP = {
    "Executive": 0,
    "Engineering": 1,
    "Product & Design": 2,
    "Data & AI": 3,
    "Growth & Marketing": 4,
    "People & Operations": 5
}


def format_rupiah(value: int):
    return "Rp{:,.0f}".format(value).replace(",", ".")


def load_mapping():
    """
    Ambil mapping dari mapping_config.json kalau ada.
    Kalau tidak ada, pakai default mapping.
    """
    jabatan_map = DEFAULT_JABATAN_MAP
    divisi_map = DEFAULT_DIVISI_MAP
    feature_order = ["Jabatan_Encoded", "Divisi_Encoded"]

    if os.path.exists(MAPPING_PATH):
        try:
            with open(MAPPING_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)

            jabatan_map = data.get("jabatan_map", jabatan_map)
            divisi_map = data.get("divisi_map", divisi_map)
            feature_order = data.get("feature_order", feature_order)
        except Exception:
            pass

    return jabatan_map, divisi_map, feature_order


Base.metadata.create_all(bind=engine)

# Metadata for Swagger UI
tags_metadata = [
    {
        "name": "General",
        "description": "General system health, mapping configs, and seed data endpoints.",
    },
    {
        "name": "Employee CRUD",
        "description": "Operations to Create, Read, Update, and Delete employee data.",
    },
    {
        "name": "Machine Learning",
        "description": "Predict salary and calculate salary estimation by division.",
    },
]

# =========================
# APP SETUP
# =========================
app = FastAPI(
    title="Employee Intelligence & Salary Prediction API",
    description="Backend API with employee data, salary prediction, and division salary estimation.",
    version="4.0.0",
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

# =========================
# BASIC ENDPOINTS
# =========================
@app.get("/", tags=["General"])
def root():
    return {
        "message": "Welcome to the Employee Intelligence API.",
        "endpoints": {
            "docs": "/docs",
            "employees": "/employees",
            "predict": "POST /predict",
            "predict_divisi": "GET /predict-divisi?divisi=Engineering",
            "health": "/health",
            "seed": "POST /seed-from-csv"
        }
    }


@app.get("/health", tags=["General"], summary="Check system health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "csv_exists": os.path.exists(CSV_PATH),
        "csv_path": CSV_PATH
    }


@app.get("/mapping", tags=["General"], summary="Get data mapping configurations")
def mapping():
    jabatan_map, divisi_map, feature_order = load_mapping()
    return {
        "jabatan_map": jabatan_map,
        "divisi_map": divisi_map,
        "feature_order": feature_order
    }


# =========================
# CRUD EMPLOYEES
# =========================
@app.post("/employees", response_model=EmployeeOut, status_code=201, tags=["Employee CRUD"], summary="Add a new Employee")
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db=db, payload=payload)


@app.get("/employees", response_model=List[EmployeeOut], tags=["Employee CRUD"], summary="Get list of Employees")
def list_employees(
    skip: int = 0,
    limit: int = 50,
    nama: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return crud.list_employees(db=db, skip=skip, limit=limit, nama=nama)


@app.get("/employees/{employee_id}", response_model=EmployeeOut, tags=["Employee CRUD"], summary="Get specific Employee details")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee(db=db, employee_id=employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@app.put("/employees/{employee_id}", response_model=EmployeeOut, tags=["Employee CRUD"], summary="Update Employee information")
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = crud.update_employee(db=db, employee_id=employee_id, payload=payload)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@app.delete("/employees/{employee_id}", status_code=204, tags=["Employee CRUD"], summary="Remove an Employee")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    success = crud.delete_employee(db=db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return None


# =========================
# PREDICT GAJI
# =========================
@app.post("/predict", response_model=PredictResponse, tags=["Machine Learning"], summary="Predict Salary Standalone")
def predict(payload: PredictRequest):
    """
    Endpoint prediksi gaji karyawan baru berdasarkan Jabatan dan Divisi.
    """
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")

    # Menggunakan Jabatan_Encoded dan Divisi_Encoded
    X = np.array([[payload.Jabatan_Encoded, payload.Divisi_Encoded]], dtype=float)
    pred = model.predict(X)[0]

    return {
        "predicted_salary": int(round(float(pred))),
        "currency": "IDR"
    }


@app.post("/employees/{employee_id}/predict", response_model=PredictResponse, tags=["Machine Learning"], summary="Predict Employee's Salary")
def predict_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Endpoint prediksi karyawan yang sudah ada di database.
    """
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")

    emp = crud.get_employee(db=db, employee_id=employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    X = np.array([[emp.Jabatan_Encoded, emp.Divisi_Encoded]], dtype=float)
    pred = model.predict(X)[0]

    return {
        "predicted_salary": int(round(float(pred))),
        "currency": "IDR"
    }


# =========================
# PREDICT TOTAL GAJI BY DIVISI
# =========================
@app.get("/predict-divisi", tags=["Machine Learning"], summary="Predict total salary by division")
def predict_divisi(divisi: str):
    """
    Menghitung estimasi total gaji berdasarkan divisi.

    Contoh:
    /predict-divisi?divisi=Engineering
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(
            status_code=404,
            detail=f"File dataset_clean.csv tidak ditemukan di path: {CSV_PATH}. Jalankan dulu python data/cleaning.py"
        )

    df = pd.read_csv(CSV_PATH)
    df.columns = [c.strip() for c in df.columns]

    required_columns = ["Nama", "Jabatan", "Divisi", "Gaji"]
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Kolom CSV tidak lengkap. Kolom yang hilang: {missing_columns}. Kolom tersedia: {df.columns.tolist()}"
        )

    hasil = df[df["Divisi"].astype(str).str.lower() == divisi.lower()]

    if hasil.empty:
        return {
            "divisi": divisi,
            "jumlah_karyawan": 0,
            "total_gaji": 0,
            "total_gaji_format": format_rupiah(0),
            "message": "Data tidak ditemukan untuk divisi tersebut.",
            "data_karyawan": []
        }

    total_gaji = int(hasil["Gaji"].sum())
    jumlah_karyawan = int(len(hasil))

    data_karyawan = []
    for _, row in hasil.iterrows():
        data_karyawan.append({
            "nama": row["Nama"],
            "jabatan": row["Jabatan"],
            "divisi": row["Divisi"],
            "gaji": int(row["Gaji"]),
            "gaji_format": format_rupiah(int(row["Gaji"]))
        })

    return {
        "divisi": divisi,
        "jumlah_karyawan": jumlah_karyawan,
        "total_gaji": total_gaji,
        "total_gaji_format": format_rupiah(total_gaji),
        "data_karyawan": data_karyawan
    }


# =========================
# LIST DIVISI
# =========================
@app.get("/divisi", tags=["General"], summary="Get available divisions from CSV")
def list_divisi_from_csv():
    if not os.path.exists(CSV_PATH):
        raise HTTPException(
            status_code=404,
            detail=f"File dataset_clean.csv tidak ditemukan di path: {CSV_PATH}"
        )

    df = pd.read_csv(CSV_PATH)

    if "Divisi" not in df.columns:
        raise HTTPException(status_code=400, detail="Kolom Divisi tidak ditemukan di CSV")

    divisi_list = sorted(df["Divisi"].dropna().unique().tolist())

    return {
        "total": len(divisi_list),
        "divisi": divisi_list
    }


# =========================
# SEED FROM CSV
# =========================
@app.post("/seed-from-csv", tags=["General"], summary="Bulk import data from CSV")
def seed_from_csv(mode: str = "reset", db: Session = Depends(get_db)):
    """
    Import data dari backend/data/dataset_clean.csv ke database.

    Catatan:
    Dataset baru sudah terupdate menggunakan Jabatan dan Divisi.
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(
            status_code=404,
            detail=f"File CSV tidak ditemukan di path: {CSV_PATH}. Jalankan dulu python data/cleaning.py"
        )

    if mode not in ["reset", "append"]:
        raise HTTPException(status_code=400, detail="mode harus 'reset' atau 'append'")

    df = pd.read_csv(CSV_PATH)
    df.columns = [c.strip() for c in df.columns]

    required_columns = ["Nama", "Jabatan", "Divisi", "Gaji"]
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Kolom CSV tidak lengkap. Kolom yang hilang: {missing_columns}. Kolom tersedia: {df.columns.tolist()}"
        )

    jabatan_map, divisi_map, _ = load_mapping()

    if mode == "reset":
        db.query(Employee).delete()
        db.commit()

    inserted = 0
    skipped = 0

    for _, row in df.iterrows():
        nama = str(row["Nama"]).strip()
        jabatan = str(row["Jabatan"]).strip()
        divisi = str(row["Divisi"]).strip()

        if jabatan not in jabatan_map or divisi not in divisi_map:
            skipped += 1
            continue

        jabatan_enc = int(jabatan_map[jabatan])
        divisi_enc = int(divisi_map[divisi])

        gaji_val = None
        if "Gaji" in df.columns and not pd.isna(row["Gaji"]):
            try:
                gaji_val = float(row["Gaji"])
            except Exception:
                gaji_val = None

        payload = EmployeeCreate(
            Nama=nama,
            Divisi_Encoded=divisi_enc,
            Jabatan_Encoded=jabatan_enc,
            Gaji=gaji_val
        )

        crud.create_employee(db=db, payload=payload)
        inserted += 1

    return {
        "message": "seed success",
        "inserted": inserted,
        "skipped": skipped,
        "mode": mode,
        "source": CSV_PATH
    }