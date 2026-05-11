"use client";

import { useState } from "react";
import { forecastBudget, getPositionCounts } from "@/src/services/forecastService";
import { ForecastRequest, ForecastResponse } from "@/src/types/prediction";
import { exportForecastToExcel } from "@/src/utils/exportHelper";
import { useTranslation } from "../hooks/useTranslation";

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

export default function ForecastForm() {
    const { t } = useTranslation();

    const MONTHS = [
        { value: "1", label: t('month.january') },
        { value: "2", label: t('month.february') },
        { value: "3", label: t('month.march') },
        { value: "4", label: t('month.april') },
        { value: "5", label: t('month.may') },
        { value: "6", label: t('month.june') },
        { value: "7", label: t('month.july') },
        { value: "8", label: t('month.august') },
        { value: "9", label: t('month.september') },
        { value: "10", label: t('month.october') },
        { value: "11", label: t('month.november') },
        { value: "12", label: t('month.december') },
    ];

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
    const [loadingCounts, setLoadingCounts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    const handleChange = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Auto-fetch counts when division changes
        if (name === "division" && value) {
            setLoadingCounts(true);
            try {
                const counts = await getPositionCounts(value);
                setFormData((prev) => ({
                    ...prev,
                    juniorCount: (counts.junior || 0).toString(),
                    staffCount: (counts.staff || 0).toString(),
                    spvCount: (counts.spv || 0).toString(),
                    managerCount: (counts.manager || 0).toString(),
                }));
            } catch (err) {
                console.error("Failed to auto-fill counts:", err);
                // Reset to 0 if data not found or error
                setFormData((prev) => ({
                    ...prev,
                    juniorCount: "0",
                    staffCount: "0",
                    spvCount: "0",
                    managerCount: "0",
                }));
            } finally {
                setLoadingCounts(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        const curMonth = parseInt(formData.currentMonth);
        const tarMonth = parseInt(formData.targetMonth);

        if (tarMonth <= curMonth) {
            setError(t('forecast.error.targetMonth'));
            return;
        }

        const totalCount =
            parseInt(formData.juniorCount) +
            parseInt(formData.staffCount) +
            parseInt(formData.spvCount) +
            parseInt(formData.managerCount);

        if (totalCount <= 0) {
            setError(t('forecast.error.minCount'));
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

            const data = await forecastBudget(payload);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('forecast.error.unknown'));
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
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('pred.form.division')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">{t('pred.form.selectDivision')}</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Data & AI">Data & AI</option>
                        <option value="Growth & Marketing">Growth & Marketing</option>
                        <option value="People & Operations">People & Operations</option>
                    </select>
                    {loadingCounts && (
                        <p className="mt-1 text-[10px] text-emerald-600 animate-pulse font-medium">
                            {t('pred.form.processing')} Data...
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('pred.form.status')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">{t('pred.form.selectStatus')}</option>
                        <option value="Kontrak">{t('pred.form.contract')}</option>
                        <option value="Tetap">{t('pred.form.permanent')}</option>
                        <option value="Probation">{t('pred.form.probation')}</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('forecast.form.currentMonth')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="currentMonth"
                        value={formData.currentMonth}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">{t('pred.form.selectMonth')}</option>
                        {MONTHS.map((m) => (
                            <option key={`cur-${m.value}`} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('forecast.form.targetMonth')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="targetMonth"
                        value={formData.targetMonth}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">{t('pred.form.selectMonth')}</option>
                        {MONTHS.map((m) => (
                            <option key={`tar-${m.value}`} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.role.junior')}
                        </label>
                        <input
                            type="number"
                            name="juniorCount"
                            min="0"
                            value={formData.juniorCount}
                            onChange={handleChange}
                            readOnly
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 outline-none transition text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.role.staff')}
                        </label>
                        <input
                            type="number"
                            name="staffCount"
                            min="0"
                            value={formData.staffCount}
                            onChange={handleChange}
                            readOnly
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 outline-none transition text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.role.spv')}
                        </label>
                        <input
                            type="number"
                            name="spvCount"
                            min="0"
                            value={formData.spvCount}
                            onChange={handleChange}
                            readOnly
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 outline-none transition text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.role.manager')}
                        </label>
                        <input
                            type="number"
                            name="managerCount"
                            min="0"
                            value={formData.managerCount}
                            onChange={handleChange}
                            readOnly
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 outline-none transition text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#13624C] dark:bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-slate-700"
                    >
                        {loading ? t('pred.form.processing') : t('forecast.form.submit')}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-8 rounded-2xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="bg-[#13624C] dark:bg-slate-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold">{t('forecast.result.title')}</h3>
                            <p className="text-white/80 text-sm mt-1">{t('forecast.result.insightTitle')}</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (result) {
                                    setExporting(true);
                                    try {
                                        await exportForecastToExcel(result);
                                    } catch (e) {
                                        console.error(e);
                                        alert("Gagal mengekspor data");
                                    } finally {
                                        setExporting(false);
                                    }
                                }
                            }}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-sm font-semibold disabled:opacity-50"
                        >
                            {exporting ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            {exporting ? t('pred.form.processing') : "Export Excel"}
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20">
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">{t('forecast.result.estimated')}</p>
                                <p className="text-3xl font-black text-[#13624C] dark:text-emerald-400">{result.formatted_total_budget}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Total {result.forecast_period} {t('forecast.result.months')}</span>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1">{t('forecast.result.monthly')}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{result.formatted_monthly_forecast}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase">Target Bulan ke-{result.target_month}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('pred.form.division')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{result.division}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('pred.form.status')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{formData.status}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('forecast.result.period')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{result.forecast_period} {t('forecast.result.months')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('forecast.result.headcount')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{result.headcount} {t('forecast.result.people')}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-white/5 pt-6">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">{t('forecast.result.breakdown')}</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-gray-400">
                                        <tr className="whitespace-nowrap">
                                            <th className="px-4 py-2 font-semibold">{t('pred.form.role')}</th>
                                            <th className="px-4 py-2 font-semibold">{t('forecast.result.count')}</th>
                                            <th className="px-4 py-2 font-semibold text-right">{t('forecast.result.salaryPerPerson')}</th>
                                            <th className="px-4 py-2 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {result.breakdown.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 whitespace-nowrap">
                                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.position}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.count}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatRupiah(item.salary_per_person)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-[#13624C] dark:text-emerald-400">{item.formatted_total_salary}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-[#13624C]/5 dark:bg-emerald-400/5 whitespace-nowrap">
                                            <td colSpan={3} className="px-4 py-3 font-bold text-[#13624C] dark:text-emerald-400">{t('forecast.result.base')}</td>
                                            <td className="px-4 py-3 text-right font-bold text-[#13624C] dark:text-emerald-400">{formatRupiah(result.base_budget)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {result.growth_rate > 0 && (
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-900/30">
                                <div className="flex gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg h-fit text-blue-600 dark:text-blue-400">
                                        📈
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">{t('forecast.result.growthTitle')}</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                            {t('forecast.result.growthDesc').replace('{rate}', (result.growth_rate * 100).toFixed(1)).replace('{division}', result.division)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl bg-[#13624C]/5 dark:bg-emerald-400/5 p-5 border border-[#13624C]/10 dark:border-white/5">
                            <h4 className="text-xs font-bold text-[#13624C] dark:text-emerald-400 uppercase tracking-wider mb-2">{t('forecast.result.hrdInsight')}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed italic">
                                &quot;{result.insight}&quot;
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
