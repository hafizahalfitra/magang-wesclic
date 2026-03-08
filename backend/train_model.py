import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

DATA_PATH = "clean_data.csv"
MODEL_PATH = "salary_model.pkl"
MAPPING_PATH = "mapping_config.json"

# Mapping standar tim (samakan dengan Role 1/3)
PENDIDIKAN_MAP = {"SMA": 0, "S1": 1, "S2": 2}
JABATAN_MAP = {"Junior": 0, "Staff": 1, "Senior": 2, "Manager": 3}

def pick_col(df, candidates):
    for c in candidates:
        if c in df.columns:
            return c
    return None

def main():
    df = pd.read_csv(DATA_PATH)
    df.columns = [c.strip() for c in df.columns]

    pendidikan_col = pick_col(df, ["Pendidikan_Encoded","pendidikan_encoded","Pendidikan","pendidikan"])
    jabatan_col    = pick_col(df, ["Jabatan_Encoded","jabatan_encoded","Jabatan","jabatan"])
    target_col     = pick_col(df, ["Gaji","gaji","Salary","salary"])

    if not pendidikan_col or not jabatan_col or not target_col:
        raise KeyError(
            f"Kolom tidak ketemu.\n"
            f"Kolom tersedia: {df.columns.tolist()}\n"
            f"Terbaca: pendidikan={pendidikan_col}, jabatan={jabatan_col}, target={target_col}"
        )

    # ----- Encoding jika masih teks -----
    # Pendidikan
    if df[pendidikan_col].dtype == "object":
        # normalisasi spasi
        df[pendidikan_col] = df[pendidikan_col].astype(str).str.strip()
        if not set(df[pendidikan_col].unique()).issubset(set(PENDIDIKAN_MAP.keys())):
            raise ValueError(f"Nilai pendidikan tidak dikenal: {sorted(set(df[pendidikan_col].unique()))}")
        df[pendidikan_col] = df[pendidikan_col].map(PENDIDIKAN_MAP)

    # Jabatan
    if df[jabatan_col].dtype == "object":
        df[jabatan_col] = df[jabatan_col].astype(str).str.strip()
        if not set(df[jabatan_col].unique()).issubset(set(JABATAN_MAP.keys())):
            raise ValueError(f"Nilai jabatan tidak dikenal: {sorted(set(df[jabatan_col].unique()))}")
        df[jabatan_col] = df[jabatan_col].map(JABATAN_MAP)

    # Pastikan numerik
    df[pendidikan_col] = pd.to_numeric(df[pendidikan_col], errors="raise")
    df[jabatan_col] = pd.to_numeric(df[jabatan_col], errors="raise")
    df[target_col] = pd.to_numeric(df[target_col], errors="raise")

    X = df[[pendidikan_col, jabatan_col]]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)

    # simpan mapping + feature order untuk tim
    mapping_payload = {
        "pendidikan_map": PENDIDIKAN_MAP,
        "jabatan_map": JABATAN_MAP,
        "feature_order": [pendidikan_col, jabatan_col],
        "target": target_col
    }
    with open(MAPPING_PATH, "w", encoding="utf-8") as f:
        json.dump(mapping_payload, f, ensure_ascii=False, indent=2)

    print(f"✅ Model tersimpan: {MODEL_PATH}")
    print(f"✅ Mapping tersimpan: {MAPPING_PATH}")
    print(f"✅ Feature dipakai: {mapping_payload['feature_order']} | Target: {target_col}")

if __name__ == "__main__":
    main()