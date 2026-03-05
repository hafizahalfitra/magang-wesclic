# Dokumentasi Data Preprocessing - Bensin AI

**File Sumber:** clean_data.csv
**Engineer:** Role 1

## 1. Handling Missing Values
- Kolom **Gaji**: Nilai kosong diisi menggunakan nilai rata-rata (Mean).

## 2. Encoding Mapping (Teks ke Angka)
Untuk kebutuhan model Machine Learning, data kategori telah diubah menjadi angka:

### Kolom Pendidikan
| Kategori | Angka |
| :--- | :--- |
| SMA | 0 |
| S1 | 1 |
| S2 | 2 |

### Kolom Jabatan
| Kategori | Angka |
| :--- | :--- |
| Staff | 0 |
| Senior | 1 |
| Manager | 2 |