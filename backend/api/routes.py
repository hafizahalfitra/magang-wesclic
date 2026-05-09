from fastapi import APIRouter, HTTPException, Depends, Body, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import pandas as pd

from database import get_db
import crud
from core.security import get_current_user, require_hrd, DUMMY_USERS, verify_password, create_access_token
from models.request_models import (
    EmployeeCreate, EmployeeUpdate, PredictRequest, ForecastRequest, LoginRequest
)
from models.response_models import (
    EmployeeOut, PredictResponse, ForecastResponse, LoginResponse, UserResponse, PositionCountsResponse
)
from services.prediction_service import (
    predict_salary, predict_employee_salary, predict_divisi, predict_salary_dataset, get_model
)
from services.forecast_service import forecast_budget
from ml.preprocessing import load_mapping

router = APIRouter()

# =========================
# AUTHENTICATION
# =========================
class OAuth2PasswordRequestFormOptional:
    """Custom dependency to support both JSON and Form data for login."""
    def __init__(
        self,
        username: Optional[str] = Form(None),
        password: Optional[str] = Form(None),
        grant_type: Optional[str] = Form(None),
        scope: Optional[str] = Form(""),
        client_id: Optional[str] = Form(None),
        client_secret: Optional[str] = Form(None),
    ):
        self.username = username
        self.password = password

@router.post("/login", response_model=LoginResponse, tags=["Authentication"])
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestFormOptional = Depends()
):
    email = None
    pass_val = None

    # 1. Coba ambil dari Form (Swagger / OAuth2)
    if form_data and form_data.username:
        email = form_data.username
        pass_val = form_data.password
    
    # 2. Coba ambil dari JSON (Frontend) jika Form kosong
    if not email:
        try:
            # Check if content type is JSON
            if request.headers.get("content-type") == "application/json":
                payload = await request.json()
                email = payload.get("email")
                pass_val = payload.get("password")
        except Exception:
            pass
    
    if not email or not pass_val:
        raise HTTPException(status_code=401, detail="Email and password are required")
    
    user = DUMMY_USERS.get(email)
    if not user or not verify_password(pass_val, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }

@router.get("/me", response_model=UserResponse, tags=["Authentication"])
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"]
    }

# =========================
# BASIC ENDPOINTS
# =========================
@router.get("/", tags=["General"])
def root():
    return {
        "message": "Welcome to the Employee Intelligence API.",
        "endpoints": {
            "docs": "/docs",
            "employees": "/employees",
            "predict": "POST /predict",
            "forecast_budget": "POST /forecast-budget",
            "predict_divisi": "GET /predict-divisi?divisi=Engineering",
            "health": "/health",
            "seed": "POST /seed-from-csv"
        }
    }

@router.get("/health", tags=["General"], summary="Check system health")
def health():
    try:
        get_model()
        model_loaded = True
    except:
        model_loaded = False

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    CSV_PATH = os.path.join(BASE_DIR, "data", "dataset_clean.csv")

    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "csv_exists": os.path.exists(CSV_PATH),
        "csv_path": CSV_PATH
    }

@router.get("/mapping", tags=["General"], summary="Get data mapping configurations")
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
@router.post("/employees", response_model=EmployeeOut, status_code=201, tags=["Employee CRUD"], summary="Add a new Employee")
def create_employee_route(payload: EmployeeCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_hrd)):
    return crud.create_employee(db=db, payload=payload)

@router.get("/employees", response_model=List[EmployeeOut], tags=["Employee CRUD"], summary="Get list of Employees")
def list_employees_route(
    skip: int = 0,
    limit: int = 50,
    nama: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_hrd)
):
    return crud.list_employees(db=db, skip=skip, limit=limit, nama=nama)

@router.get("/employees/{employee_id}", response_model=EmployeeOut, tags=["Employee CRUD"], summary="Get specific Employee details")
def get_employee_route(employee_id: int, db: Session = Depends(get_db), current_user: dict = Depends(require_hrd)):
    emp = crud.get_employee(db=db, employee_id=employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/employees/{employee_id}", response_model=EmployeeOut, tags=["Employee CRUD"], summary="Update Employee information")
def update_employee_route(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_hrd)):
    emp = crud.update_employee(db=db, employee_id=employee_id, payload=payload)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.delete("/employees/{employee_id}", status_code=204, tags=["Employee CRUD"], summary="Remove an Employee")
def delete_employee_route(employee_id: int, db: Session = Depends(get_db), current_user: dict = Depends(require_hrd)):
    success = crud.delete_employee(db=db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return None

# =========================
# MACHINE LEARNING
# =========================
@router.post("/predict", response_model=PredictResponse, tags=["Machine Learning"], summary="Predict Salary Standalone")
def predict_route(payload: PredictRequest):
    return predict_salary(payload)

@router.post("/employees/{employee_id}/predict", response_model=PredictResponse, tags=["Machine Learning"], summary="Predict Employee's Salary")
def predict_employee_route(employee_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee(db=db, employee_id=employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return predict_employee_salary(emp)

@router.post("/forecast-budget", response_model=ForecastResponse, tags=["Machine Learning"], summary="Forecast division budget")
def forecast_budget_route(payload: ForecastRequest, current_user: dict = Depends(require_hrd)):
    return forecast_budget(payload)

@router.get("/predict-divisi", tags=["Machine Learning"], summary="Predict total salary by division")
def predict_divisi_route(divisi: str):
    return predict_divisi(divisi)

@router.get("/predict-salary", tags=["Machine Learning"], summary="Predict salary by division, job, experience, and age")
def predict_salary_dataset_route(divisi: str, jabatan: str, pengalaman: float = 0, umur: int = 0):
    return predict_salary_dataset(divisi, jabatan, pengalaman, umur)

# =========================
# LIST DIVISI
# =========================
@router.get("/divisi", tags=["General"], summary="Get available divisions from CSV")
def list_divisi_from_csv():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    CSV_PATH = os.path.join(BASE_DIR, "data", "dataset_clean.csv")
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

@router.get("/divisi/{divisi_name}/counts", response_model=PositionCountsResponse, tags=["General"], summary="Get employee counts by position for a division")
def get_divisi_counts(divisi_name: str, db: Session = Depends(get_db)):
    jabatan_map, divisi_map, _ = load_mapping()
    
    if divisi_name not in divisi_map:
        raise HTTPException(status_code=404, detail=f"Divisi '{divisi_name}' tidak ditemukan")
    
    divisi_enc = divisi_map[divisi_name]
    
    from db_models import Employee
    from sqlalchemy import func
    
    # Mapping for target positions: Manajer: 4, SPV: 5, STAF: 6, Junior: 7
    counts = db.query(Employee.Jabatan_Encoded, func.count(Employee.id)) \
        .filter(Employee.Divisi_Encoded == divisi_enc) \
        .filter(Employee.Jabatan_Encoded.in_([4, 5, 6, 7])) \
        .group_by(Employee.Jabatan_Encoded) \
        .all()
    
    res = {
        "junior": 0,
        "staff": 0,
        "spv": 0,
        "manager": 0
    }
    
    map_back = {
        4: "manager",
        5: "spv",
        6: "staff",
        7: "junior"
    }
    
    for jab_enc, count in counts:
        if jab_enc in map_back:
            res[map_back[jab_enc]] = count
            
    return res

# =========================
# SEED FROM CSV
# =========================
@router.post("/seed-from-csv", tags=["General"], summary="Bulk import data from CSV")
def seed_from_csv(mode: str = "reset", db: Session = Depends(get_db)):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    CSV_PATH = os.path.join(BASE_DIR, "data", "dataset_clean.csv")

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
        from db_models import Employee
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
