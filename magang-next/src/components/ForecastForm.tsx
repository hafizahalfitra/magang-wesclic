"use client";

import { useState } from "react";
import { forecastBudget } from "@/src/services/predictionService";
import { ForecastRequest, ForecastResponse } from "@/src/types/prediction";
import { authService } from "../services/authService";

type FormDataType = {
    division: string;
    status: string;
    currentMonth: string;
    targetMonth: string;
    juniorCount: string;
    staffCount: string;
    spvCount: string;
    managerCount: string;
};

const MONTHS = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

export default function ForecastForm() {
    const [formData, setFormData] = useState<FormDataType>({
        division: "",
        status: "",
        currentMonth: "",
        targetMonth: "",
        juniorCount: "0",
        staffCount: "0",
        spvCount: "0",
        managerCount: "0",
    });

    const [result, setResult] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        const curMonth = parseInt(formData.currentMonth);
        const tarMonth = parseInt(formData.targetMonth);

        if (tarMonth <= curMonth) {
            setError("Bulan target harus lebih besar dari bulan saat ini.");
            return;
        }

        const totalCount = 
            parseInt(formData.juniorCount) + 
            parseInt(formData.staffCount) + 
            parseInt(formData.spvCount) + 
            parseInt(formData.managerCount);

        if (totalCount <= 0) {
            setError("Minimal salah satu jumlah karyawan harus lebih dari 0.");
            return;
        }

        setLoading(true);

        try {
            const payload: ForecastRequest = {
                division: formData.division,
                status: formData.status,
                current_month: curMonth,
                target_month: tarMonth,
                junior_count: parseInt(formData.juniorCount),
                staff_count: parseInt(formData.staffCount),
                spv_count: parseInt(formData.spvCount),
                manager_count: parseInt(formData.managerCount),
            };

            const token = authService.getToken() || "";
            const data = await forecastBudget(payload, token);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menghitung forecast.");
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
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Divisi <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    >
                        <option value="">Pilih divisi</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Data & AI">Data & AI</option>
                        <option value="Growth & Marketing">Growth & Marketing</option>
                        <option value="People & Operations">People & Operations</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Status Karyawan <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    >
                        <option value="">Pilih status</option>
                        <option value="Kontrak">Kontrak</option>
                        <option value="Tetap">Tetap</option>
                        <option value="Probation">Probation</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Bulan Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="currentMonth"
                        value={formData.currentMonth}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    >
                        <option value="">Pilih bulan</option>
                        {MONTHS.map((m) => (
                            <option key={`cur-${m.value}`} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                        Bulan Target <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="targetMonth"
                        value={formData.targetMonth}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        required
                    >
                        <option value="">Pilih bulan</option>
                        {MONTHS.map((m) => (
                            <option key={`tar-${m.value}`} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C]">
                            Jumlah Junior
                        </label>
                        <input
                            type="number"
                            name="juniorCount"
                            min="0"
                            value={formData.juniorCount}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C]">
                            Jumlah STAF
                        </label>
                        <input
                            type="number"
                            name="staffCount"
                            min="0"
                            value={formData.staffCount}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C]">
                            Jumlah SPV
                        </label>
                        <input
                            type="number"
                            name="spvCount"
                            min="0"
                            value={formData.spvCount}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C]">
                            Jumlah Manajer
                        </label>
                        <input
                            type="number"
                            name="managerCount"
                            min="0"
                            value={formData.managerCount}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#13624C] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {loading ? "Menghitung..." : "Hitung Forecast"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-8 rounded-2xl border border-[#13624C]/20 bg-white shadow-sm overflow-hidden">
                    <div className="bg-[#13624C] p-6 text-white">
                        <h3 className="text-xl font-bold">Hasil Forecast Anggaran</h3>
                        <p className="text-white/80 text-sm mt-1">Estimasi kebutuhan anggaran untuk masa mendatang.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Estimasi Anggaran</p>
                                <p className="text-3xl font-bold text-[#13624C]">{result.formatted_total_budget}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</p>
                                    <p className="font-semibold text-gray-800">{result.division}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                                    <p className="font-semibold text-gray-800">{formData.status}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</p>
                                    <p className="font-semibold text-gray-800">{result.forecast_period} Bulan</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Headcount</p>
                                    <p className="font-semibold text-gray-800">{result.headcount} Orang</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Breakdown Jabatan</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold">Jabatan</th>
                                            <th className="px-4 py-2 font-semibold">Jumlah</th>
                                            <th className="px-4 py-2 font-semibold text-right">Gaji/Orang</th>
                                            <th className="px-4 py-2 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {result.breakdown.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{item.position}</td>
                                                <td className="px-4 py-3 text-gray-600">{item.count}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{formatRupiah(item.salary_per_person)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-[#13624C]">{item.formatted_total_salary}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-[#13624C]/5">
                                            <td colSpan={3} className="px-4 py-3 font-bold text-[#13624C]">Base Budget</td>
                                            <td className="px-4 py-3 text-right font-bold text-[#13624C]">{formatRupiah(result.base_budget)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {result.growth_rate > 0 && (
                            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                                <div className="flex gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                                        📈
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Growth Factor</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Mempertimbangkan growth rate sebesar <span className="font-bold">{(result.growth_rate * 100).toFixed(1)}%</span> per bulan untuk divisi {result.division}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl bg-[#13624C]/5 p-5 border border-[#13624C]/10">
                            <h4 className="text-xs font-bold text-[#13624C] uppercase tracking-wider mb-2">Insight HRD</h4>
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                                &quot;{result.insight}&quot;
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
