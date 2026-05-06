# Dokumentasi Data Preprocessing - Employee Salary Prediction

**File Raw:** `data/dataset_raw.csv`  
**File Clean:** `data/dataset_clean.csv`  
**File Generator:** `data/cleaning.py`  
**Status:** Updated  
**Tujuan:** Memisahkan data mentah dan data bersih untuk kebutuhan prediksi gaji karyawan berbasis divisi.

---

## 1. Konsep Dataset

Pada project ini terdapat dua jenis dataset:

| Dataset | Keterangan |
|---|---|
| `dataset_raw.csv` | Data mentah yang belum bersih, belum memiliki kolom gaji, dan masih mengandung kesalahan penulisan |
| `dataset_clean.csv` | Data hasil cleaning yang sudah rapi, jabatan/divisi sudah distandardisasi, dan sudah memiliki kolom gaji |

---

## 2. Struktur Dataset Raw

Dataset raw adalah data awal sebelum dilakukan preprocessing.

Kolom pada dataset raw:

| Kolom | Keterangan |
|---|---|
| Nama | Nama karyawan |
| Jabatan | Jabatan karyawan, tetapi penulisannya belum konsisten |
| Divisi | Divisi karyawan, tetapi masih ada typo, format tidak seragam, atau kosong |

Contoh data raw:

| Nama | Jabatan | Divisi |
|---|---|---|
| Alif Fatullah | ceo | executive |
| Qhansa Ridho | CFO |  |
| Ikhwanuddin Arif | cmo | Growth marketing |
| Saputra H | manager | engineering |
| Yair Alwi | staff | Enginering |
| Muhammad Abid Yasir | staf | enggenering |
| M Ronal | manager | Product Design |
| Ayu Vitania H | spv | People & Ops |

Catatan:

- Data raw belum memiliki kolom `Gaji`.
- Data raw masih mengandung typo, seperti `Enginering` dan `enggenering`.
- Data raw masih memiliki format jabatan yang tidak konsisten, seperti `ceo`, `manager`, `staff`, dan `staf`.
- Data raw masih memiliki format divisi yang tidak seragam, seperti `Growth marketing`, `Product Design`, dan `People & Ops`.

---

## 3. Struktur Dataset Clean

Dataset clean adalah hasil akhir setelah data raw diproses melalui `data/cleaning.py`.

Kolom pada dataset clean:

| Kolom | Keterangan |
|---|---|
| Nama | Nama karyawan |
| Jabatan | Jabatan yang sudah distandardisasi |
| Divisi | Divisi yang sudah distandardisasi |
| Gaji | Gaji yang dihitung berdasarkan Divisi dan Jabatan |

Contoh data clean:

| Nama | Jabatan | Divisi | Gaji |
|---|---|---|---:|
| Alif Fatullah | CEO | Executive | Rp16.500.000 |
| Qhansa Ridho | CFO | Executive | Rp16.500.000 |
| Saputra H | Manajer | Engineering | Rp12.000.000 |
| Yair Alwi | STAF | Engineering | Rp6.500.000 |
| Muhammad Abid Yasir | STAF | Engineering | Rp6.500.000 |
| M Ronal | Manajer | Product & Design | Rp10.000.000 |
| Ayu Vitania H | SPV | People & Operations | Rp4.500.000 |

---

## 4. Alur Proses Cleaning

Alur preprocessing data adalah sebagai berikut:

```text
dataset_raw.csv
Nama, Jabatan, Divisi
        ↓
cleaning.py
- membersihkan jabatan
- membersihkan divisi
- menentukan level gaji
- mengambil nominal gaji dari standar_gaji
        ↓
dataset_clean.csv
Nama, Jabatan, Divisi, Gaji