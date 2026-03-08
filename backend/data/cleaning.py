import pandas as pd
import random
import os

# Path folder data
BASE_DIR = os.path.dirname(os.path.dirname(__file__))   # ke folder backend
DATA_DIR = os.path.join(BASE_DIR, "data")

raw_path = os.path.join(DATA_DIR, "dataset_raw.csv")
clean_path = os.path.join(DATA_DIR, "dataset_clean.csv")

# 1. Daftar nama
nama_depan = ['Andi', 'Budi', 'Caca', 'Dedi', 'Eka', 'Fahmi', 'Gita', 'Hendra', 'Indra', 'Joko']
nama_belakang = ['Sanjaya', 'Santoso', 'Febriani', 'Irwansyah', 'Saputra', 'Hidayat', 'Kusuma', 'Wijaya', 'Purnama', 'Siregar']

# 2. Generate data mentah
rows = []

for _ in range(50):
    n = f"{random.choice(nama_depan)} {random.choice(nama_belakang)}"
    p = random.choice(['SMA', 'S1', 'S2'])

    if p == 'S2':
        j = 'Manager'
        g = random.choice([9500000, 10500000, 12000000, None])
    elif p == 'S1':
        j = 'Senior'
        g = random.choice([5500000, 6500000, 7500000, None])
    else:
        j = 'Staff'
        g = random.choice([3500000, 4000000, 4500000, None])

    rows.append({
        'nama': n,
        'pendidikan': p,
        'jabatan': j,
        'gaji': g
    })

# 3. Buat DataFrame raw
df = pd.DataFrame(rows)

# 4. Simpan data mentah
df.to_csv(raw_path, index=False)

# 5. Cleaning sederhana
df_clean = df.copy()
df_clean['gaji'] = df_clean['gaji'].fillna(df_clean['gaji'].median())
df_clean = df_clean.drop_duplicates()
df_clean = df_clean.dropna(subset=['nama', 'pendidikan', 'jabatan'])

# 6. Simpan data bersih
df_clean.to_csv(clean_path, index=False)

print("Dataset raw berhasil dibuat:", raw_path)
print("Dataset clean berhasil dibuat:", clean_path)
print("\nPreview data bersih:")
print(df_clean.head())