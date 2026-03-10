"use client";

import { useState } from "react";

type FormDataType = {
    nama: string;
    umur: string;
    pendidikan: string;
    pengalamanKerja: string;
    jabatan: string;
};

export default function PredictionForm() {
    const [formData, setFormData] = useState<FormDataType>({
        nama: "",
        umur: "",
        pendidikan: "",
        pengalamanKerja: "",
        jabatan: "",
    });

    const [result, setResult] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculateDummySalary = () => {
        const umur = Number(formData.umur) || 0;
        const pengalaman = Number(formData.pengalamanKerja) || 0;

        let baseSalary = 3000000;

        if (formData.pendidikan === "SMA/SMK") baseSalary += 500000;
        if (formData.pendidikan === "Diploma") baseSalary += 1000000;
        if (formData.pendidikan === "S1") baseSalary += 1500000;
        if (formData.pendidikan === "S2") baseSalary += 2500000;

        if (formData.jabatan === "Staff") baseSalary += 1000000;
        if (formData.jabatan === "Supervisor") baseSalary += 2500000;
        if (formData.jabatan === "Manager") baseSalary += 5000000;
        if (formData.jabatan === "HR") baseSalary += 1500000;
        if (formData.jabatan === "IT Support") baseSalary += 1800000;

        baseSalary += pengalaman * 350000;
        baseSalary += umur > 30 ? 500000 : 200000;

        return baseSalary;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const salary = calculateDummySalary();
        setResult(salary);
        setSubmitted(true);
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Nama Karyawan
                    </label>
                    <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Masukkan nama karyawan"
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Umur
                    </label>
                    <input
                        type="number"
                        name="umur"
                        value={formData.umur}
                        onChange={handleChange}
                        placeholder="Masukkan umur"
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Pendidikan
                    </label>
                    <select
                        name="pendidikan"
                        value={formData.pendidikan}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    >
                        <option value="">Pilih pendidikan</option>
                        <option value="SMA/SMK">SMA / SMK</option>
                        <option value="Diploma">Diploma</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Pengalaman Kerja
                    </label>
                    <input
                        type="number"
                        name="pengalamanKerja"
                        value={formData.pengalamanKerja}
                        onChange={handleChange}
                        placeholder="Masukkan pengalaman kerja (tahun)"
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Jabatan
                    </label>
                    <select
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    >
                        <option value="">Pilih jabatan</option>
                        <option value="Staff">Staff</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR</option>
                        <option value="IT Support">IT Support</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-[#13624C] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                        Prediksi Gaji
                    </button>
                </div>
            </form>

            {submitted && result !== null && (
                <div className="mt-8 rounded-2xl border border-[#13624C]/20 bg-[#13624C]/5 p-6">
                    <h3 className="text-xl font-bold text-[#13624C]">
                        Hasil Prediksi Gaji
                    </h3>
                    <p className="mt-3 text-gray-600">
                        Berdasarkan data yang dimasukkan, estimasi gaji untuk{" "}
                        <span className="font-semibold text-[#13624C]">
                            {formData.nama || "karyawan"}
                        </span>{" "}
                        adalah:
                    </p>
                    <p className="mt-4 text-3xl font-bold text-[#13624C]">
                        {formatRupiah(result)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Saat ini hasil masih menggunakan simulasi frontend. Nanti bisa
                        langsung dihubungkan ke API backend.
                    </p>
                </div>
            )}
        </div>
    );
}