"use client";

import { useState } from "react";
import { predictSalaryByDataset } from "@/src/services/predictionService";
import { useTranslation } from "../hooks/useTranslation";

type FormDataType = {
    nama: string;
    umur: string;
    pengalamanKerja: string;
    statusKaryawan: string;
    divisi: string;
    jabatan: string;
};

interface PredictionResult {
    salary: number;
    salaryFormat: string;
    currency: string;
    category: string;
    insight: string;
}

export default function PredictionForm() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<FormDataType>({
        nama: "",
        umur: "",
        pengalamanKerja: "",
        statusKaryawan: "",
        divisi: "",
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
        if (salary < 5000000) return t('pred.form.low');
        if (salary <= 10000000) return t('pred.form.medium');
        return t('pred.form.high');
    };

    const getInsight = (divisi: string, jabatan: string) => {
        return t('pred.result.insight').replace('{divisi}', divisi).replace('{jabatan}', jabatan);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitted(false);

        // Validasi Umur
        const umurNum = Number(formData.umur);
        if (!formData.umur || umurNum < 18 || umurNum > 65) {
            setError(t('pred.error.age'));
            return;
        }

        setLoading(true);

        try {
            const data = await predictSalaryByDataset(
                formData.divisi, 
                formData.jabatan,
                Number(formData.pengalamanKerja) || 0,
                umurNum
            );

            if (data.predicted_salary === 0) {
                setError(data.message || t('pred.error.notFound'));
                return;
            }

            setResult({
                salary: data.predicted_salary,
                salaryFormat: data.predicted_salary_format,
                currency: data.currency,
                category: getSalaryCategory(data.predicted_salary),
                insight: getInsight(formData.divisi, formData.jabatan),
            });
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('pred.error.unknown'));
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
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('pred.form.name')} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{t('pred.form.optional')}</span>
                    </label>
                    <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder={t('pred.form.namePlaceholder')}
                        className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="md:col-span-2 grid gap-5 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.form.age')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="umur"
                            value={formData.umur}
                            onChange={handleChange}
                            placeholder={t('pred.form.agePlaceholder')}
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.form.exp')}
                        </label>
                        <input
                            type="number"
                            name="pengalamanKerja"
                            value={formData.pengalamanKerja}
                            onChange={handleChange}
                            placeholder={t('pred.form.expPlaceholder')}
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                            {t('pred.form.status')}
                        </label>
                        <select
                            name="statusKaryawan"
                            value={formData.statusKaryawan}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        >
                            <option value="">{t('pred.form.selectStatus')}</option>
                            <option value="Kontrak">{t('pred.form.contract')}</option>
                            <option value="Tetap">{t('pred.form.permanent')}</option>
                            <option value="Probation">{t('pred.form.probation')}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('pred.form.division')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="divisi"
                        value={formData.divisi}
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
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                        {t('pred.form.role')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">{t('pred.form.selectRole')}</option>
                        <option value="Manajer">Manajer</option>
                        <option value="SPV">SPV</option>
                        <option value="STAF">STAF</option>
                        <option value="Junior">Junior</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#13624C] dark:bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-slate-700"
                    >
                        {loading ? t('pred.form.processing') : t('pred.form.submit')}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {submitted && result && (
                <div className="mt-8 rounded-2xl border border-[#13624C]/20 dark:border-emerald-400/20 bg-[#13624C]/5 dark:bg-emerald-400/5 p-6 transition-colors duration-300">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-[#13624C] dark:text-emerald-400">
                                {t('pred.result.title')}
                            </h3>
                            <p className="mt-3 text-gray-600 dark:text-gray-400">
                                {t('pred.result.desc1')}{" "}
                                <span className="font-semibold text-[#13624C] dark:text-emerald-400">
                                    {formData.nama || t('pred.result.desc2')}
                                </span>{" "}
                                {t('pred.result.desc3')}
                            </p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-[#13624C] dark:text-emerald-400">
                                {result.salaryFormat || formatRupiah(result.salary)}
                            </p>
                            <span className="text-sm font-medium text-[#13624C]/60 dark:text-emerald-400/60">
                                {result.currency}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                result.category === t('pred.form.low') ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                result.category === t('pred.form.medium') ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}>
                                {t('pred.result.category')}: {result.category}
                            </span>
                        </div>

                        <div className="rounded-lg bg-white/50 dark:bg-slate-900/50 p-4 border border-[#13624C]/10 dark:border-white/5">
                            <p className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed">
                                &quot;{result.insight}&quot;
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}