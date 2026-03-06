from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

MODEL_PATH = "salary_model.pkl"

# === Mapping (harus sama dengan Role 1 & data clean) ===
PENDIDIKAN_MAP = {"SMA": 0, "S1": 1, "S2": 2}
JABATAN_MAP = {"Junior": 0, "Staff": 1, "Senior": 2, "Manager": 3}

app = FastAPI(
    title="Prediksi Gaji API",
    version="1.0.0",
    description="API prediksi gaji berbasis Linear Regression. Gunakan POST /predict."
)

# Wajib: CORS agar Next.js bisa akses
# Untuk development aman pakai "*".
# Saat production, ganti allow_origins jadi domain frontend kamu.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # lebih aman kalau origins="*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model dengan guard (biar errornya jelas)
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)


class PredictRequest(BaseModel):
    # encoded integer sesuai mapping Role 1
    pendidikan: int = Field(..., ge=0, le=2, description="SMA=0, S1=1, S2=2")
    jabatan: int = Field(..., ge=0, le=3, description="Junior=0, Staff=1, Senior=2, Manager=3")


class PredictResponse(BaseModel):
    predicted_salary: int
    currency: str = "IDR"


@app.get("/")
def root():
    return {
        "message": "API is running. Open /docs for Swagger UI.",
        "endpoints": {
            "health": "/health",
            "predict": "POST /predict"
        }
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }


@app.get("/mapping")
def mapping():
    """
    Endpoint opsional biar Role 3 gampang ambil mapping tanpa tanya-tanya.
    """
    return {
        "pendidikan_map": PENDIDIKAN_MAP,
        "jabatan_map": JABATAN_MAP,
        "feature_order": ["Pendidikan_Encoded", "Jabatan_Encoded"]
    }


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=500,
            detail=f"Model file not found. Pastikan '{MODEL_PATH}' ada di folder backend."
        )

    # Urutan fitur harus konsisten dengan training:
    # ["Pendidikan_Encoded", "Jabatan_Encoded"]
    X = np.array([[payload.pendidikan, payload.jabatan]], dtype=float)

    try:
        pred = model.predict(X)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Bulatkan jadi integer rupiah biar enak dipakai frontend
    pred_int = int(round(float(pred)))

    return {"predicted_salary": pred_int, "currency": "IDR"}