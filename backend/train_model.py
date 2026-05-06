import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

DATA_PATH = "data/dataset_clean.csv"
MODEL_PATH = "salary_model.pkl"
MAPPING_PATH = "mapping_config.json"

DIVISI_MAP = {
    "Executive": 0,
    "Engineering": 1,
    "Product & Design": 2,
    "Data & AI": 3,
    "Growth & Marketing": 4,
    "People & Operations": 5
}

JABATAN_MAP = {
    "CEO": 0,
    "CFO": 1,
    "CMO": 2,
    "CTO": 3,
    "Manajer": 4,
    "SPV": 5,
    "STAF": 6,
    "Junior": 7
}

def pick_col(df, candidates):
    for c in candidates:
        if c in df.columns:
            return c
    return None

def main():
    df = pd.read_csv(DATA_PATH)
    df.columns = [c.strip() for c in df.columns]

    # Filter out Executive and C-levels
    if "Divisi" in df.columns:
        df = df[~df["Divisi"].str.lower().isin(["executive"])]
    if "Jabatan" in df.columns:
        df = df[~df["Jabatan"].str.lower().isin(["ceo", "cmo", "cto", "cfo"])]

    divisi_col = pick_col(df, ["Divisi_Encoded","divisi_encoded","Divisi","divisi"])
    jabatan_col    = pick_col(df, ["Jabatan_Encoded","jabatan_encoded","Jabatan","jabatan"])
    target_col     = pick_col(df, ["Gaji","gaji","Salary","salary"])

    if not divisi_col or not jabatan_col or not target_col:
        raise KeyError(
            f"Kolom tidak ketemu.\n"
            f"Kolom tersedia: {df.columns.tolist()}\n"
            f"Terbaca: divisi={divisi_col}, jabatan={jabatan_col}, target={target_col}"
        )

    # ----- Encoding jika masih teks -----
    # Divisi
    if df[divisi_col].dtype == "object":
        df[divisi_col] = df[divisi_col].astype(str).str.strip()
        if not set(df[divisi_col].unique()).issubset(set(DIVISI_MAP.keys())):
            raise ValueError(f"Nilai divisi tidak dikenal: {sorted(set(df[divisi_col].unique()))}")
        df[divisi_col] = df[divisi_col].map(DIVISI_MAP)

    # Jabatan
    if df[jabatan_col].dtype == "object":
        df[jabatan_col] = df[jabatan_col].astype(str).str.strip()
        if not set(df[jabatan_col].unique()).issubset(set(JABATAN_MAP.keys())):
            raise ValueError(f"Nilai jabatan tidak dikenal: {sorted(set(df[jabatan_col].unique()))}")
        df[jabatan_col] = df[jabatan_col].map(JABATAN_MAP)

    # Pastikan numerik
    df[divisi_col] = pd.to_numeric(df[divisi_col], errors="raise")
    df[jabatan_col] = pd.to_numeric(df[jabatan_col], errors="raise")
    df[target_col] = pd.to_numeric(df[target_col], errors="raise")

    X = df[[jabatan_col, divisi_col]]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)

    # simpan mapping + feature order untuk tim
    mapping_payload = {
        "divisi_map": DIVISI_MAP,
        "jabatan_map": JABATAN_MAP,
        "feature_order": [jabatan_col, divisi_col],
        "target": target_col
    }
    with open(MAPPING_PATH, "w", encoding="utf-8") as f:
        json.dump(mapping_payload, f, ensure_ascii=False, indent=2)

    print(f"Model tersimpan: {MODEL_PATH}")
    print(f"Mapping tersimpan: {MAPPING_PATH}")
    print(f"Feature dipakai: {mapping_payload['feature_order']} | Target: {target_col}")

if __name__ == "__main__":
    main()