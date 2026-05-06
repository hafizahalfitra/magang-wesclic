# Dokumentasi Data Preprocessing - Employee Salary Prediction

**File Sumber:** `data/dataset_clean.csv`  
**File Generator:** `data/cleaning.py`  
**Status:** Updated  
**Basis Gaji:** UMK Jogja dibulatkan  
**Dataset Final:** Nama, Jabatan, Divisi, Gaji

---

## 1. Struktur Dataset

Dataset yang digunakan adalah data karyawan berbasis nama, jabatan, divisi, dan gaji.

Kolom yang digunakan:

| Kolom | Keterangan |
|---|---|
| Nama | Nama karyawan |
| Jabatan | Jabatan karyawan, seperti CEO, CFO, CMO, CTO, Manajer, SPV, Junior, dan STAF |
| Divisi | Divisi utama tempat karyawan bekerja |
| Gaji | Nominal gaji karyawan dalam rupiah |

Kolom yang sudah tidak digunakan:

| Kolom | Status |
|---|---|
| Pendidikan | Dihapus |
| Level_Gaji | Tidak disimpan di CSV, hanya dipakai untuk logika internal |
| Sub_Divisi | Dihapus |
| Bulan | Dihapus |

---

## 2. Dasar Perhitungan Gaji

Gaji pada dataset disesuaikan dengan acuan UMK Jogja yang dibulatkan menjadi **Rp2.800.000**.

Skema internal perhitungan gaji:

| Jabatan/Kategori | Perhitungan | Nominal |
|---|---:|---:|
| Junior | 1x UMK Jogja | Rp2.800.000 |
| STAF | 1x UMK Jogja | Rp2.800.000 |
| SPV | 2x UMK Jogja | Rp5.600.000 |
| Manajer | 3x UMK Jogja | Rp8.400.000 |
| C-Level | 4x UMK Jogja | Rp11.200.000 |

---

## 3. Logika Jabatan untuk Perhitungan Gaji

Kategori gaji hanya digunakan dalam proses internal di `data/cleaning.py`, tidak disimpan sebagai kolom CSV.

| Jabatan Asli | Kategori Perhitungan |
|---|---|
| CEO | C-Level |
| CFO | C-Level |
| CMO | C-Level |
| CTO | C-Level |
| Manajer | Manager |
| SPV | Senior |
| Junior | Junior |
| STAF | Staff |

---

## 4. Mapping Divisi

Kolom `Divisi` dapat dipetakan menjadi angka jika diperlukan untuk proses Machine Learning.

| Divisi | Angka |
|---|---:|
| Executive | 0 |
| Engineering | 1 |
| Product & Design | 2 |
| Data & AI | 3 |
| Growth & Marketing | 4 |
| People & Operations | 5 |

---

## 5. Data Karyawan

| Nama | Jabatan | Divisi | Gaji |
|---|---|---|---:|
| Alif Fatullah | CEO | Executive | Rp11.200.000 |
| Qhansa Ridho | CFO | Executive | Rp11.200.000 |
| Ikhwanuddin Arif | CMO | Executive | Rp11.200.000 |
| Candra Zofarian | CTO | Executive | Rp11.200.000 |
| Saputra H | Manajer | Engineering | Rp8.400.000 |
| Saiful Andri Tama | SPV | Engineering | Rp5.600.000 |
| Yair Alwi | STAF | Engineering | Rp2.800.000 |
| Muhammad Abid Yasir | STAF | Engineering | Rp2.800.000 |
| Rafi Pratama | Junior | Engineering | Rp2.800.000 |
| Naufal Ramadhan | Junior | Engineering | Rp2.800.000 |
| Fikri Maulana | Junior | Engineering | Rp2.800.000 |
| Rizky Ananda | STAF | Engineering | Rp2.800.000 |
| Dimas Saputra | STAF | Engineering | Rp2.800.000 |
| Farhan Nugraha | STAF | Engineering | Rp2.800.000 |
| M Ronal | Manajer | Product & Design | Rp8.400.000 |
| Bagas Fadil | STAF | Product & Design | Rp2.800.000 |
| Nabila Putri | Junior | Product & Design | Rp2.800.000 |
| Raka Aditya | STAF | Product & Design | Rp2.800.000 |
| Salsabila Rahma | Junior | Product & Design | Rp2.800.000 |
| Alzen Gifar | Manajer | Data & AI | Rp8.400.000 |
| Fajar Mahendra | STAF | Data & AI | Rp2.800.000 |
| Keisha Amalia | Junior | Data & AI | Rp2.800.000 |
| Dion Gifari | SPV | Growth & Marketing | Rp5.600.000 |
| Aldi Firmansyah | Junior | Growth & Marketing | Rp2.800.000 |
| Maya Lestari | STAF | Growth & Marketing | Rp2.800.000 |
| Hafiz Bobz | Junior | Growth & Marketing | Rp2.800.000 |
| Ayu Vitania H | SPV | People & Operations | Rp5.600.000 |
| Intan Permata | STAF | People & Operations | Rp2.800.000 |
| Bayu Setiawan | Junior | People & Operations | Rp2.800.000 |

---

## 6. Pembagian Karyawan Berdasarkan Divisi

### Executive

| Nama | Jabatan | Gaji |
|---|---|---:|
| Alif Fatullah | CEO | Rp11.200.000 |
| Qhansa Ridho | CFO | Rp11.200.000 |
| Ikhwanuddin Arif | CMO | Rp11.200.000 |
| Candra Zofarian | CTO | Rp11.200.000 |

Total estimasi gaji Executive:

**Rp44.800.000**

Perhitungan:

Rp11.200.000 x 4 = **Rp44.800.000**

---

### Engineering

| Nama | Jabatan | Gaji |
|---|---|---:|
| Saputra H | Manajer | Rp8.400.000 |
| Saiful Andri Tama | SPV | Rp5.600.000 |
| Yair Alwi | STAF | Rp2.800.000 |
| Muhammad Abid Yasir | STAF | Rp2.800.000 |
| Rafi Pratama | Junior | Rp2.800.000 |
| Naufal Ramadhan | Junior | Rp2.800.000 |
| Fikri Maulana | Junior | Rp2.800.000 |
| Rizky Ananda | STAF | Rp2.800.000 |
| Dimas Saputra | STAF | Rp2.800.000 |
| Farhan Nugraha | STAF | Rp2.800.000 |

Total estimasi gaji Engineering:

**Rp36.400.000**

Perhitungan:

Rp8.400.000 + Rp5.600.000 + 8 x Rp2.800.000 = **Rp36.400.000**

---

### Product & Design

| Nama | Jabatan | Gaji |
|---|---|---:|
| M Ronal | Manajer | Rp8.400.000 |
| Bagas Fadil | STAF | Rp2.800.000 |
| Nabila Putri | Junior | Rp2.800.000 |
| Raka Aditya | STAF | Rp2.800.000 |
| Salsabila Rahma | Junior | Rp2.800.000 |

Total estimasi gaji Product & Design:

**Rp19.600.000**

Perhitungan:

Rp8.400.000 + 4 x Rp2.800.000 = **Rp19.600.000**

---

### Data & AI

| Nama | Jabatan | Gaji |
|---|---|---:|
| Alzen Gifar | Manajer | Rp8.400.000 |
| Fajar Mahendra | STAF | Rp2.800.000 |
| Keisha Amalia | Junior | Rp2.800.000 |

Total estimasi gaji Data & AI:

**Rp14.000.000**

Perhitungan:

Rp8.400.000 + 2 x Rp2.800.000 = **Rp14.000.000**

---

### Growth & Marketing

| Nama | Jabatan | Gaji |
|---|---|---:|
| Dion Gifari | SPV | Rp5.600.000 |
| Aldi Firmansyah | Junior | Rp2.800.000 |
| Maya Lestari | STAF | Rp2.800.000 |
| Hafiz Bobz | Junior | Rp2.800.000 |

Total estimasi gaji Growth & Marketing:

**Rp14.000.000**

Perhitungan:

Rp5.600.000 + 3 x Rp2.800.000 = **Rp14.000.000**

---

### People & Operations

| Nama | Jabatan | Gaji |
|---|---|---:|
| Ayu Vitania H | SPV | Rp5.600.000 |
| Intan Permata | STAF | Rp2.800.000 |
| Bayu Setiawan | Junior | Rp2.800.000 |

Total estimasi gaji People & Operations:

**Rp11.200.000**

Perhitungan:

Rp5.600.000 + 2 x Rp2.800.000 = **Rp11.200.000**

---

## 7. Contoh Perhitungan Prediksi Divisi

Contoh kasus:

**Input:**

| Parameter | Nilai |
|---|---|
| Divisi | Engineering |

Data Engineering:

| Nama | Jabatan | Gaji |
|---|---|---:|
| Saputra H | Manajer | Rp8.400.000 |
| Saiful Andri Tama | SPV | Rp5.600.000 |
| Yair Alwi | STAF | Rp2.800.000 |
| Muhammad Abid Yasir | STAF | Rp2.800.000 |
| Rafi Pratama | Junior | Rp2.800.000 |
| Naufal Ramadhan | Junior | Rp2.800.000 |
| Fikri Maulana | Junior | Rp2.800.000 |
| Rizky Ananda | STAF | Rp2.800.000 |
| Dimas Saputra | STAF | Rp2.800.000 |
| Farhan Nugraha | STAF | Rp2.800.000 |

Total estimasi gaji:

Rp8.400.000 + Rp5.600.000 + 8 x Rp2.800.000 = **Rp36.400.000**

Jadi, estimasi kebutuhan gaji untuk divisi Engineering adalah:

**Rp36.400.000**

---

## 8. Endpoint yang Digunakan

Endpoint untuk prediksi total gaji berdasarkan divisi:

```text
GET /predict-divisi?divisi=Engineering