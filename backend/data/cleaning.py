import pandas as pd
import random

# 1. Daftar Nama (Tetap sama)
nama_depan = ['Andi', 'Budi', 'Caca', 'Dedi', 'Eka', 'Fahmi', 'Gita', 'Hendra', 'Indra', 'Joko', 'Kurniawan', 'Laras', 'Mulyono', 'Nanda', 'Oki', 'Putri', 'Qori', 'Rian', 'Santi', 'Taufik', 'Umar', 'Vina', 'Wawan', 'Xena', 'Yanto', 'Zaki', 'Aditya', 'Bella', 'Citra', 'Dimas', 'Endah', 'Ferry', 'Galih', 'Hani', 'Irfan', 'Julia', 'Kevin', 'Lestari', 'Maya', 'Nugroho', 'Okto', 'Prasetyo', 'Rina', 'Soleh', 'Tania', 'Utami', 'Vino', 'Winda', 'Yuda', 'Zahra']
nama_belakang = ['Sanjaya', 'Santoso', 'Febriani', 'Irwansyah', 'Saputra', 'Hidayat', 'Kusuma', 'Wijaya', 'Purnama', 'Siregar', 'Permana', 'Nasution', 'Gunawan', 'Setiawan', 'Pratama', 'Utomo']

# 2. Logika Pembuatan Data (S2=Manager, S1=Senior, SMA=Staff/Junior)
rows = []
for _ in range(50):
    nama = f"{random.choice(nama_depan)} {random.choice(nama_belakang)}"
    # Pilih Pendidikan dulu sebagai penentu
    pendidikan = random.choice(['SMA', 'S1', 'S2'])
    
    if pendidikan == 'S2':
        jabatan = 'Manager'
        gaji = random.choice([9000000, 10000000, 11500000, None]) # Proyeksi Jogja 2025-2026
    elif pendidikan == 'S1':
        jabatan = 'Senior'
        gaji = random.choice([5500000, 6500000, 7500000, None])
    else: # SMA
        jabatan = random.choice(['Staff', 'Junior'])
        if jabatan == 'Staff':
            gaji = random.choice([3500000, 4200000, None])
        else: # Junior
            gaji = random.choice([2650000, 2800000, None]) # Minimal UMR Jogja
            
    rows.append([nama, pendidikan, jabatan, gaji])

df = pd.DataFrame(rows, columns=['Nama', 'Pendidikan', 'Jabatan', 'Gaji'])

# --- SIMPAN DATA MENTAHAN (RAW) ---
df.to_csv('raw_data.csv', index=False)

# 3. Cleaning (Isi Gaji Kosong berdasarkan rata-rata Jabatan)
df['Gaji'] = df.groupby('Jabatan')['Gaji'].transform(lambda x: x.fillna(x.mean()))

# 4. ENCODING
df['Pendidikan_Encoded'] = df['Pendidikan'].map({'SMA': 0, 'S1': 1, 'S2': 2})
df['Jabatan_Encoded'] = df['Jabatan'].map({'Junior': 0, 'Staff': 1, 'Senior': 2, 'Manager': 3})

# 5. Tampilan Terminal
pd.options.display.float_format = '{:,.0f}'.format
print("\n" + "="*80)
print("  DATA FINAL: PENDIDIKAN & JABATAN SINKRON (UMR JOGJA 2025-2026)  ")
print("="*80)
print(df[['Nama', 'Pendidikan', 'Jabatan', 'Gaji']].head(20))
print("="*80)

# 6. Simpan ke CSV Bersih
df_clean = df[['Nama', 'Pendidikan_Encoded', 'Jabatan_Encoded', 'Gaji']]
df_clean.to_csv('clean_data.csv', index=False)