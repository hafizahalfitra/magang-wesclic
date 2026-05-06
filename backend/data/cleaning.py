import pandas as pd
import os

# =========================
# STANDAR GAJI BERDASARKAN UMK JOGJA
# =========================
# UMK Jogja dibulatkan menjadi Rp2.800.000
#
# Junior  = 1x UMK
# STAF    = 1x UMK
# SPV     = 2x UMK
# Manajer = 3x UMK
# C-Level = 4x UMK

UMK_JOGJA = 2800000

standar_gaji = {
    "Junior": UMK_JOGJA,
    "Staff": UMK_JOGJA,
    "Senior": UMK_JOGJA * 2,
    "Manager": UMK_JOGJA * 3,
    "C-Level": UMK_JOGJA * 4
}


# =========================
# FUNGSI PENENTUAN GAJI
# =========================

def get_level_gaji(jabatan):
    """
    Menentukan kategori perhitungan gaji berdasarkan jabatan.

    CEO, CFO, CMO, CTO dihitung sebagai C-Level.
    Manajer dihitung sebagai Manager.
    SPV dihitung sebagai Senior.
    Junior dihitung sebagai Junior.
    STAF dihitung sebagai Staff.
    """
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
# DATA KARYAWAN
# =========================

data_karyawan = [
    # =========================
    # EXECUTIVE
    # =========================
    {
        "Nama": "Alif Fatullah",
        "Jabatan": "CEO",
        "Divisi": "Executive"
    },
    {
        "Nama": "Qhansa Ridho",
        "Jabatan": "CFO",
        "Divisi": "Executive"
    },
    {
        "Nama": "Ikhwanuddin Arif",
        "Jabatan": "CMO",
        "Divisi": "Executive"
    },
    {
        "Nama": "Candra Zofarian",
        "Jabatan": "CTO",
        "Divisi": "Executive"
    },

    # =========================
    # ENGINEERING UTAMA
    # =========================
    {
        "Nama": "Saputra H",
        "Jabatan": "Manajer",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Saiful Andri Tama",
        "Jabatan": "SPV",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Yair Alwi",
        "Jabatan": "STAF",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Muhammad Abid Yasir",
        "Jabatan": "STAF",
        "Divisi": "Engineering"
    },

    # =========================
    # TAMBAHAN ENGINEERING
    # 6 ORANG: 3 JUNIOR, 3 STAF
    # =========================
    {
        "Nama": "Rafi Pratama",
        "Jabatan": "Junior",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Naufal Ramadhan",
        "Jabatan": "Junior",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Fikri Maulana",
        "Jabatan": "Junior",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Rizky Ananda",
        "Jabatan": "STAF",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Dimas Saputra",
        "Jabatan": "STAF",
        "Divisi": "Engineering"
    },
    {
        "Nama": "Farhan Nugraha",
        "Jabatan": "STAF",
        "Divisi": "Engineering"
    },

    # =========================
    # PRODUCT & DESIGN UTAMA
    # =========================
    {
        "Nama": "M Ronal",
        "Jabatan": "Manajer",
        "Divisi": "Product & Design"
    },
    {
        "Nama": "Bagas Fadil",
        "Jabatan": "STAF",
        "Divisi": "Product & Design"
    },

    # =========================
    # TAMBAHAN PRODUCT & DESIGN
    # 3 ORANG
    # =========================
    {
        "Nama": "Nabila Putri",
        "Jabatan": "Junior",
        "Divisi": "Product & Design"
    },
    {
        "Nama": "Raka Aditya",
        "Jabatan": "STAF",
        "Divisi": "Product & Design"
    },
    {
        "Nama": "Salsabila Rahma",
        "Jabatan": "Junior",
        "Divisi": "Product & Design"
    },

    # =========================
    # DATA & AI UTAMA
    # =========================
    {
        "Nama": "Alzen Gifar",
        "Jabatan": "Manajer",
        "Divisi": "Data & AI"
    },

    # =========================
    # TAMBAHAN DATA & AI
    # DATA SCIENTIST 2 ORANG
    # =========================
    {
        "Nama": "Fajar Mahendra",
        "Jabatan": "STAF",
        "Divisi": "Data & AI"
    },
    {
        "Nama": "Keisha Amalia",
        "Jabatan": "Junior",
        "Divisi": "Data & AI"
    },

    # =========================
    # GROWTH & MARKETING UTAMA
    # =========================
    {
        "Nama": "Dion Gifari",
        "Jabatan": "SPV",
        "Divisi": "Growth & Marketing"
    },

    # =========================
    # TAMBAHAN GROWTH & MARKETING
    # 3 ORANG
    # =========================
    {
        "Nama": "Aldi Firmansyah",
        "Jabatan": "Junior",
        "Divisi": "Growth & Marketing"
    },
    {
        "Nama": "Maya Lestari",
        "Jabatan": "STAF",
        "Divisi": "Growth & Marketing"
    },
    {
        "Nama": "Hafiz Bobz",
        "Jabatan": "Junior",
        "Divisi": "Growth & Marketing"
    },

    # =========================
    # PEOPLE & OPERATIONS UTAMA
    # =========================
    {
        "Nama": "Ayu Vitania H",
        "Jabatan": "SPV",
        "Divisi": "People & Operations"
    },

    # =========================
    # TAMBAHAN PEOPLE & OPERATIONS
    # 2 ORANG
    # =========================
    {
        "Nama": "Intan Permata",
        "Jabatan": "STAF",
        "Divisi": "People & Operations"
    },
    {
        "Nama": "Bayu Setiawan",
        "Jabatan": "Junior",
        "Divisi": "People & Operations"
    }
]


# =========================
# GENERATE DATASET
# =========================

rows = []

for karyawan in data_karyawan:
    nama = karyawan["Nama"]
    jabatan = karyawan["Jabatan"]
    divisi = karyawan["Divisi"]

    level_gaji = get_level_gaji(jabatan)
    gaji = standar_gaji[level_gaji]

    rows.append([
        nama,
        jabatan,
        divisi,
        gaji
    ])


# =========================
# BUAT DATAFRAME
# =========================

df = pd.DataFrame(
    rows,
    columns=[
        "Nama",
        "Jabatan",
        "Divisi",
        "Gaji"
    ]
)


# =========================
# SIMPAN CSV
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "dataset_clean.csv")

df.to_csv(csv_path, index=False)


# =========================
# TAMPILAN TERMINAL
# =========================

pd.set_option("display.max_rows", None)
pd.set_option("display.width", None)

df_display = df.copy()
df_display["Gaji"] = df_display["Gaji"].apply(
    lambda x: "Rp{:,.0f}".format(x).replace(",", ".")
)

print("\n" + "=" * 100)
print("DATASET KARYAWAN BERDASARKAN STRUKTUR ORGANISASI")
print("UMK Jogja dibulatkan: Rp{:,.0f}".format(UMK_JOGJA).replace(",", "."))
print("Gaji: Junior=1x UMK | STAF=1x UMK | SPV=2x UMK | Manajer=3x UMK | C-Level=4x UMK")
print("Kolom: Nama, Jabatan, Divisi, Gaji")
print("=" * 100)
print(df_display.to_string(index=False))
print("=" * 100)

print(f"\nSelesai! File CSV berhasil dibuat di: {csv_path}")