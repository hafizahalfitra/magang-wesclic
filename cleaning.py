import pandas as pd
import random

# 1. Daftar Nama Depan dan Belakang untuk membuat Nama Lengkap
nama_depan = [
    'Andi', 'Budi', 'Caca', 'Dedi', 'Eka', 'Fahmi', 'Gita', 'Hendra', 'Indra', 'Joko',
    'Kurniawan', 'Laras', 'Mulyono', 'Nanda', 'Oki', 'Putri', 'Qori', 'Rian', 'Santi', 'Taufik',
    'Umar', 'Vina', 'Wawan', 'Xena', 'Yanto', 'Zaki', 'Aditya', 'Bella', 'Citra', 'Dimas',
    'Endah', 'Ferry', 'Galih', 'Hani', 'Irfan', 'Julia', 'Kevin', 'Lestari', 'Maya', 'Nugroho',
    'Okto', 'Prasetyo', 'Rina', 'Soleh', 'Tania', 'Utami', 'Vino', 'Winda', 'Yuda', 'Zahra'
]

nama_belakang = [
    'Sanjaya', 'Santoso', 'Febriani', 'Irwansyah', 'Saputra', 'Hidayat', 'Kusuma', 'Wijaya', 
    'Purnama', 'Siregar', 'Permana', 'Nasution', 'Gunawan', 'Setiawan', 'Pratama', 'Utomo'
]

# 2. Membuat 50 Data Karyawan (Update: Menambahkan Junior ke pilihan Jabatan)
data = {
    'Nama': [f"{random.choice(nama_depan)} {random.choice(nama_belakang)}" for _ in range(50)],
    'Pendidikan': [random.choice(['SMA', 'S1', 'S2']) for _ in range(50)],
    'Jabatan': [random.choice(['Junior', 'Staff', 'Senior', 'Manager']) for _ in range(50)],
    'Gaji': [random.choice([3500000, 5000000, 7000000, 9000000, 12000000, 15000000, None]) for _ in range(50)]
}

df = pd.DataFrame(data)

# 3. Handling Missing Values (Isi Gaji kosong dengan Rata-rata)
df['Gaji'] = df['Gaji'].fillna(df['Gaji'].mean())

# 4. ENCODING: Ubah Teks ke Angka (Update: Mapping Junior=0 s/d Manager=3)
df['Pendidikan_Encoded'] = df['Pendidikan'].map({'SMA': 0, 'S1': 1, 'S2': 2})
df['Jabatan_Encoded'] = df['Jabatan'].map({'Junior': 0, 'Staff': 1, 'Senior': 2, 'Manager': 3})

# 5. Tampilan di Terminal
pd.options.display.float_format = '{:,.0f}'.format
print("\n" + "="*75)
print("     HASIL PEMBERSIHAN 50 DATA KARYAWAN (JUNIOR, STAFF, SENIOR, MANAGER)    ")
print("="*75)
# Menampilkan 15 data pertama untuk pengecekan
print(df[['Nama', 'Pendidikan_Encoded', 'Jabatan_Encoded', 'Gaji']].head(15)) 
print("\n... data berhasil di-generate hingga 50 baris.")
print("="*75)

# 6. Simpan ke CSV
# Menyimpan kolom yang sudah di-encode untuk keperluan Machine Learning (Role 2)
df_clean = df[['Nama', 'Pendidikan_Encoded', 'Jabatan_Encoded', 'Gaji']]
df_clean.to_csv('clean_data.csv', index=False)

print(f"Status: File 'clean_data.csv' telah diperbarui dengan 4 level jabatan.")