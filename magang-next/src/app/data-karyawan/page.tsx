'use client';
import { useState } from 'react';
import Navbar from "@/src/components/Navbar"; // Pastikan path import benar
import EmployeeTable from "@/src/components/EmployeeTable";
import { employeeData } from "@/src/data/employeeData";

export default function DataKaryawanPage() {
    const [search, setSearch] = useState("");

    const filteredData = employeeData.filter((emp) =>
        emp.nama.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Navbar diintegrasikan di bagian atas */}
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900">Data Karyawan</h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Kelola dan pantau seluruh data karyawan untuk kebutuhan prediksi sistem.
                    </p>
                </div>

                {/* Insight Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="rounded-3xl bg-gradient-to-r from-[#13624C] to-[#0A3D2F] p-8 text-white shadow-xl">
                        <h3 className="text-lg font-bold opacity-80">Total Karyawan</h3>
                        <p className="text-4xl font-black mt-2">{employeeData.length} Orang</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900">Akurasi Sistem</h3>
                        <p className="text-4xl font-black mt-2 text-[#13624C]">99.9%</p>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Cari nama karyawan..."
                            className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-[#13624C] transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition">
                        Export Data
                    </button>
                </div>

                {/* Tabel Data */}
                <EmployeeTable data={filteredData} />
            </div>
        </main>
    );
}