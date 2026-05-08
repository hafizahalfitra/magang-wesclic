import os
import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException
from models.request_models import PredictRequest
from models.response_models import PredictResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
CSV_PATH = os.path.join(BASE_DIR, "data", "dataset_clean.csv")

model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

def format_rupiah(value: int):
    return "Rp{:,.0f}".format(value).replace(",", ".")

def get_model():
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model file not found: {MODEL_PATH}")
    return model

def predict_salary(payload: PredictRequest) -> PredictResponse:
    mdl = get_model()
    X = np.array([[payload.Jabatan_Encoded, payload.Divisi_Encoded]], dtype=float)
    pred = mdl.predict(X)[0]

    return PredictResponse(
        predicted_salary=int(round(float(pred))),
        currency="IDR"
    )

def predict_employee_salary(emp) -> PredictResponse:
    mdl = get_model()
    X = np.array([[emp.Jabatan_Encoded, emp.Divisi_Encoded]], dtype=float)
    pred = mdl.predict(X)[0]

    return PredictResponse(
        predicted_salary=int(round(float(pred))),
        currency="IDR"
    )

def predict_divisi(divisi: str):
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

def predict_salary_dataset(divisi: str, jabatan: str, pengalaman: float = 0, umur: int = 0):
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
            detail=f"Kolom CSV tidak lengkap. Kolom hilang: {missing_columns}. Kolom tersedia: {df.columns.tolist()}"
        )

    hasil = df[
        (df["Divisi"].astype(str).str.lower() == divisi.lower()) &
        (df["Jabatan"].astype(str).str.lower() == jabatan.lower())
    ]

    if hasil.empty:
        return {
            "divisi": divisi,
            "jabatan": jabatan,
            "pengalaman": pengalaman,
            "umur": umur,
            "base_salary": 0,
            "predicted_salary": 0,
            "predicted_salary_format": format_rupiah(0),
            "currency": "IDR",
            "message": "Data gaji untuk divisi dan jabatan tersebut tidak ditemukan."
        }

    base_salary = int(round(float(hasil["Gaji"].mean())))
    adjustment = 0
    predicted_salary = base_salary + adjustment

    return {
        "divisi": divisi,
        "jabatan": jabatan,
        "pengalaman": pengalaman,
        "umur": umur,
        "base_salary": base_salary,
        "adjustment": adjustment,
        "predicted_salary": predicted_salary,
        "base_salary_format": format_rupiah(base_salary),
        "predicted_salary_format": format_rupiah(predicted_salary),
        "currency": "IDR"
    }
