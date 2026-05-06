import pandas as pd
import os

# =========================
# STANDAR GAJI BERDASARKAN DEPARTEMEN / DIVISI
# =========================
# C-Level dibuat rata: Rp16.500.000
#
# Junior = Junior 0-1 tahun
# STAF = Staff 1-3 tahun
# SPV = Supervisor
# Manajer = Manager
# CEO/CFO/CMO/CTO = C-Level

standar_gaji = {
    "Executive": {
        "C-Level": 16500000
    },
    "People & Operations": {
        "Junior": 2800000,
        "Staff": 3200000,
        "Senior": 4500000,
        "Manager": 7500000
    },
    "Growth & Marketing": {
        "Junior": 2850000,
        "Staff": 3500000,
        "Senior": 5000000,
        "Manager": 8500000
    },
    "Product & Design": {
        "Junior": 3000000,
        "Staff": 4000000,
        "Senior": 6000000,
        "Manager": 10000000
    },
    "Engineering": {
        "Junior": 3200000,
        "Staff": 4500000,
        "Senior": 7500000,
        "Manager": 12000000
    },
    "Data & AI": {
        "Junior": 3500000,
        "Staff": 5000000,
        "Senior": 8500000,
        "Manager": 14000000
    }
}


# =========================
# DATA RAW / DATA MENTAH
# =========================
# Data raw sengaja dibuat belum bersih:
# - belum ada kolom Gaji
# - ada typo jabatan
# - ada typo divisi
# - ada huruf kecil/besar tidak konsisten
# - ada divisi kosong
# - ada penulisan People & Ops yang nanti dibersihkan menjadi People & Operations

data_raw = [
    # EXECUTIVE
    {"Nama": "Alif Fatullah", "Jabatan": "ceo", "Divisi": "executive"},
    {"Nama": "Qhansa Ridho", "Jabatan": "CFO", "Divisi": ""},
    {"Nama": "Ikhwanuddin Arif", "Jabatan": "cmo", "Divisi": "Growth marketing"},
    {"Nama": "Candra Zofarian", "Jabatan": "CTO", "Divisi": "Executive"},

    # ENGINEERING
    {"Nama": "Saputra H", "Jabatan": "manager", "Divisi": "engineering"},
    {"Nama": "Saiful Andri Tama", "Jabatan": "spv", "Divisi": "Engineering"},
    {"Nama": "Yair Alwi", "Jabatan": "staff", "Divisi": "Enginering"},
    {"Nama": "Muhammad Abid Yasir", "Jabatan": "staf", "Divisi": "enggenering"},

    # TAMBAHAN ENGINEERING
    {"Nama": "Rafi Pratama", "Jabatan": "junior", "Divisi": "Engineering"},
    {"Nama": "Naufal Ramadhan", "Jabatan": "Junior", "Divisi": "ENGINEERING"},
    {"Nama": "Fikri Maulana", "Jabatan": "Junior", "Divisi": "engineering"},
    {"Nama": "Rizky Ananda", "Jabatan": "staf", "Divisi": "Engineering"},
    {"Nama": "Dimas Saputra", "Jabatan": "STAF", "Divisi": "Engineering"},
    {"Nama": "Farhan Nugraha", "Jabatan": "staff", "Divisi": "Engineering"},

    # PRODUCT & DESIGN
    {"Nama": "M Ronal", "Jabatan": "manager", "Divisi": "Product Design"},
    {"Nama": "Bagas Fadil", "Jabatan": "staff", "Divisi": "Product & Design"},
    {"Nama": "Nabila Putri", "Jabatan": "junior", "Divisi": "product design"},
    {"Nama": "Raka Aditya", "Jabatan": "staf", "Divisi": "Product and Design"},
    {"Nama": "Salsabila Rahma", "Jabatan": "Junior", "Divisi": "Product & Design"},

    # DATA & AI
    {"Nama": "Alzen Gifar", "Jabatan": "manager", "Divisi": "Data AI"},
    {"Nama": "Fajar Mahendra", "Jabatan": "staff", "Divisi": "Data & AI"},
    {"Nama": "Keisha Amalia", "Jabatan": "junior", "Divisi": "data ai"},

    # GROWTH & MARKETING
    {"Nama": "Dion Gifari", "Jabatan": "SPV", "Divisi": "Growth Marketing"},
    {"Nama": "Aldi Firmansyah", "Jabatan": "junior", "Divisi": "Growth & Marketing"},
    {"Nama": "Maya Lestari", "Jabatan": "staf", "Divisi": "growth marketing"},
    {"Nama": "Hafiz Ramadhan", "Jabatan": "Junior", "Divisi": "Growth & Marketing"},

    # PEOPLE & OPERATIONS
    {"Nama": "Ayu Vitania H", "Jabatan": "spv", "Divisi": "People & Ops"},
    {"Nama": "Intan Permata", "Jabatan": "staff", "Divisi": "People Operations"},
    {"Nama": "Bayu Setiawan", "Jabatan": "junior", "Divisi": "people ops"}
]


# =========================
# FUNGSI CLEANING JABATAN
# =========================

def clean_jabatan(jabatan):
    value = str(jabatan).strip().lower()

    jabatan_map = {
        "ceo": "CEO",
        "cfo": "CFO",
        "cmo": "CMO",
        "cto": "CTO",
        "manager": "Manajer",
        "manajer": "Manajer",
        "spv": "SPV",
        "supervisor": "SPV",
        "junior": "Junior",
        "staf": "STAF",
        "staff": "STAF"
    }

    return jabatan_map.get(value, "STAF")


# =========================
# FUNGSI CLEANING DIVISI
# =========================

def clean_divisi(jabatan, divisi):
    value = str(divisi).strip().lower()

    # Untuk C-Level, divisi dibersihkan menjadi Executive
    if jabatan in ["CEO", "CFO", "CMO", "CTO"]:
        return "Executive"

    divisi_map = {
        "executive": "Executive",

        "engineering": "Engineering",
        "enginering": "Engineering",
        "enggenering": "Engineering",

        "product design": "Product & Design",
        "product and design": "Product & Design",
        "product & design": "Product & Design",

        "data ai": "Data & AI",
        "data & ai": "Data & AI",

        "growth marketing": "Growth & Marketing",
        "growth & marketing": "Growth & Marketing",

        "people ops": "People & Operations",
        "people & ops": "People & Operations",
        "people operations": "People & Operations",
        "people & operations": "People & Operations"
    }

    return divisi_map.get(value, "Engineering")


# =========================
# FUNGSI PENENTUAN LEVEL GAJI
# =========================

def get_level_gaji(jabatan):
    if jabatan in ["CEO", "CFO", "CMO", "CTO"]:
        return "C-Level"

    if jabatan == "Manajer":
        return "Manager"

    if jabatan == "SPV":
        return "Senior"

    if jabatan == "Junior":
        return "Junior"

    if jabatan == "STAF":
        return "Staff"

    return "Staff"


# =========================
# FUNGSI PENENTUAN GAJI
# =========================

def get_gaji(divisi, jabatan):
    level_gaji = get_level_gaji(jabatan)

    if divisi not in standar_gaji:
        divisi = "Engineering"

    if level_gaji not in standar_gaji[divisi]:
        level_gaji = "Staff"

    return standar_gaji[divisi][level_gaji]


# =========================
# BUAT DATASET RAW
# =========================

df_raw = pd.DataFrame(
    data_raw,
    columns=[
        "Nama",
        "Jabatan",
        "Divisi"
    ]
)


# =========================
# BUAT DATASET CLEAN
# =========================

df_clean = df_raw.copy()

# Bersihkan Jabatan
df_clean["Jabatan"] = df_clean["Jabatan"].apply(clean_jabatan)

# Bersihkan Divisi
df_clean["Divisi"] = df_clean.apply(
    lambda row: clean_divisi(row["Jabatan"], row["Divisi"]),
    axis=1
)

# Tambahkan Gaji berdasarkan Divisi + Jabatan
df_clean["Gaji"] = df_clean.apply(
    lambda row: get_gaji(row["Divisi"], row["Jabatan"]),
    axis=1
)


# =========================
# SIMPAN CSV
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

raw_path = os.path.join(BASE_DIR, "dataset_raw.csv")
clean_path = os.path.join(BASE_DIR, "dataset_clean.csv")

df_raw.to_csv(raw_path, index=False)
df_clean.to_csv(clean_path, index=False)


# =========================
# TAMPILAN TERMINAL
# =========================

pd.set_option("display.max_rows", None)
pd.set_option("display.width", None)

df_clean_display = df_clean.copy()
df_clean_display["Gaji"] = df_clean_display["Gaji"].apply(
    lambda x: "Rp{:,.0f}".format(x).replace(",", ".")
)

print("\n" + "=" * 100)
print("DATASET RAW / DATA MENTAH")
print("Kolom: Nama, Jabatan, Divisi")
print("Catatan: Data raw belum memiliki kolom Gaji dan masih mengandung typo/format tidak konsisten.")
print("=" * 100)
print(df_raw.to_string(index=False))

print("\n" + "=" * 100)
print("DATASET CLEAN / DATA BERSIH")
print("Gaji sudah dibedakan berdasarkan Divisi dan Jabatan.")
print("Kolom: Nama, Jabatan, Divisi, Gaji")
print("=" * 100)
print(df_clean_display.to_string(index=False))
print("=" * 100)

print("\nSelesai!")
print(f"File RAW berhasil dibuat di   : {raw_path}")
print(f"File CLEAN berhasil dibuat di : {clean_path}")