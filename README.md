# Salary Prediction Web App

Project ini merupakan aplikasi web untuk **prediksi gaji karyawan** berbasis **Supervised Learning** pada PT Wesclic Indonesia Neotech. Sistem ini dibuat untuk membantu memperkirakan nominal gaji berdasarkan data karyawan, divisi, jabatan, status, pengalaman kerja, dan faktor pendukung lainnya.

Selain prediksi gaji individu, sistem juga memiliki fitur **Forecasting Anggaran Gaji per Divisi** yang dapat membantu HRD memperkirakan kebutuhan anggaran gaji pada periode tertentu.

---

## 📌 Nama Project

**Implementasi Supervised Learning untuk Prediksi Gaji Karyawan Berbasis Web pada PT Wesclic Indonesia Neotech**

---

## 🚀 Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- Python
- scikit-learn
- pandas
- JWT Authentication

---

## 🎯 Tujuan Project

Sistem ini dirancang untuk membantu PT Wesclic Indonesia Neotech dalam memperkirakan nominal gaji berdasarkan beberapa faktor seperti divisi, jabatan, status karyawan, umur, dan pengalaman kerja.

Sistem ini dapat digunakan oleh HRD sebagai bahan pertimbangan dalam proses rekrutmen, terutama ketika membandingkan ekspektasi gaji pelamar dengan estimasi internal perusahaan. Selain itu, sistem juga dapat digunakan sebagai simulasi prediksi gaji tanpa menampilkan data gaji asli karyawan.

---

## ✨ Fitur Utama

### 1. Prediksi Gaji Karyawan

Fitur ini memungkinkan user melakukan prediksi gaji individu berdasarkan data:

- Nama karyawan
- Umur
- Pengalaman kerja
- Status karyawan
- Divisi
- Jabatan

Hasil prediksi akan ditampilkan dalam format Rupiah beserta insight dan kategori gaji.

---

### 2. Forecasting Anggaran Gaji per Divisi

Fitur ini digunakan untuk memperkirakan kebutuhan anggaran gaji berdasarkan divisi dan bulan target.

Input yang digunakan:

- Divisi
- Status karyawan
- Bulan saat ini
- Bulan target
- Jumlah karyawan Junior
- Jumlah karyawan STAF
- Jumlah karyawan SPV
- Jumlah karyawan Manajer

Output yang ditampilkan:

- Total estimasi anggaran
- Total headcount
- Breakdown gaji per jabatan
- Base budget
- Growth factor
- Insight HRD

---

### 3. Login HRD dan Role-Based Access Control

Sistem memiliki fitur login HRD menggunakan JWT Authentication.

Fitur yang hanya dapat diakses oleh HRD:

- Forecast Anggaran
- Data Karyawan

Endpoint yang diproteksi:

- `/forecast-budget`
- CRUD data karyawan

Endpoint yang tetap public:

- `/predict`

---

## 🔐 Akun Dummy HRD

Gunakan akun berikut untuk login sebagai HRD:

```text
Email    : hrd@wesclic.com
Password : password123
