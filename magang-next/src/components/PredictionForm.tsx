"use client";

import { useState } from "react";
import { predictSalary } from "@/src/services/predictionService";

type FormDataType = {
    nama: string;
    umur: string;
    pendidikan: string;
    pengalamanKerja: string;
    jabatan: string;
};

interface PredictionResult {
    salary: number;
    currency: string;
    category: string;
    insight: string;
}

export default function PredictionForm() {
    const [formData, setFormData] = useState<FormDataType>({
        nama: "",
        umur: "",
        pendidikan: "",
        pengalamanKerja: "",
        jabatan: "",
    });

    const [result, setResult] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const getSalaryCategory = (salary: number) => {
        if (salary < 5000000) return "Rendah";
        if (salary <= 10000000) return "Menengah";
        return "Tinggi";
    };

    const getInsight = (pendidikan: string, jabatan: string) => {
        return `Berdasarkan kualifikasi pendidikan ${pendidikan} dan posisi sebagai ${jabatan}, estimasi ini mencerminkan standar pasar untuk peran tersebut di industri teknologi saat ini.`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitted(false);

        // Validasi Umur
        const umurNum = Number(formData.umur);
        if (umurNum < 18 || umurNum > 65) {
            setError("Umur harus antara 18 sampai 65 tahun.");
            return;
        }

        // Validasi Pengalaman Kerja
        if (Number(formData.pengalamanKerja) < 0) {
            setError("Pengalaman kerja tidak boleh negatif.");
            return;
        }

        setLoading(true);

        // Mapping
        const pendidikanMap: Record<string, number> = {
            "SMA/SMK": 0,
            "S1": 1,
            "S2": 2,
        };

        const jabatanMap: Record<string, number> = {
            "Junior": 0,
            "Staff": 1,
            "Senior": 2,
            "Manager": 3,
        };

        try {
            const data = await predictSalary({
                Pendidikan_Encoded: pendidikanMap[formData.pendidikan],
                Jabatan_Encoded: jabatanMap[formData.jabatan],
            });

            setResult({
                salary: data.predicted_salary,
                currency: data.currency,
                category: getSalaryCategory(data.predicted_salary),
                insight: getInsight(formData.pendidikan, formData.jabatan),
            });
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
        } finally {
            setLoading(false);
        }
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
                        <option value="Junior">Junior</option>
                        <option value="Staff">Staff</option>
                        <option value="Senior">Senior</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#13624C] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {loading ? "Memproses..." : "Prediksi Gaji"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {submitted && result && (
                <div className="mt-8 rounded-2xl border border-[#13624C]/20 bg-[#13624C]/5 p-6">
                    <div className="flex flex-col gap-4">
                        <div>
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
                        </div>

                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-[#13624C]">
                                {formatRupiah(result.salary)}
                            </p>
                            <span className="text-sm font-medium text-[#13624C]/60">
                                {result.currency}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                result.category === "Rendah" ? "bg-yellow-100 text-yellow-700" :
                                result.category === "Menengah" ? "bg-blue-100 text-blue-700" :
                                "bg-green-100 text-green-700"
                            }`}>
                                Kategori: {result.category}
                            </span>
                        </div>

                        <div className="rounded-lg bg-white/50 p-4 border border-[#13624C]/10">
                            <p className="text-sm italic text-gray-600 leading-relaxed">
                                &quot;{result.insight}&quot;
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}