'use client';
import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Navbar from "@/src/components/Navbar";
import EmployeeTable from "@/src/components/EmployeeTable";
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { predictSalary } from '../../services/predictionService';
import { useTranslation } from '@/src/hooks/useTranslation';
import { exportEmployeesToExcel } from "@/src/utils/exportHelper";

const DIVISI_REVERSE: Record<number, string> = {
    0: "Executive",
    1: "Engineering",
    2: "Product & Design",
    3: "Data & AI",
    4: "Growth & Marketing",
    5: "People & Operations"
};

const JABATAN_REVERSE: Record<number, string> = {
    0: "CEO",
    1: "CFO",
    2: "CMO",
    3: "CTO",
    4: "Manajer",
    5: "SPV",
    6: "STAF",
    7: "Junior"
};

const DIVISI_MAP: Record<string, number> = Object.fromEntries(
    Object.entries(DIVISI_REVERSE).map(([k, v]) => [v, Number(k)])
);

const JABATAN_MAP: Record<string, number> = Object.fromEntries(
    Object.entries(JABATAN_REVERSE).map(([k, v]) => [v, Number(k)])
);

export default function DataKaryawanPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, token, isLoading: authLoading } = useAuth();
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'HRD' || !token) {
                router.push('/login');
            } else {
                setIsAuthLoading(false);
            }
        }
    }, [user, token, authLoading, router]);

    const [search, setSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState<{ id: number, text: string, type: 'success' | 'error' }[]>([]);

    // Confirmation Modal state
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean, id: number | null }>({ show: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (text: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Form states
    const formRef = useRef<HTMLFormElement>(null);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [isManualSalary, setIsManualSalary] = useState(false);
    const [formData, setFormData] = useState({ nama: "", divisi: "", jabatan: "", gaji: "", umur: "" });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetcher = () => employeeService.getEmployees();

    const { data: rawData, error, isLoading, mutate } = useSWR(token ? 'employees' : null, fetcher);

    const employeeData = (rawData || []).map((emp: any) => ({
        id: emp.id,
        nama: emp.Nama,
        divisi: DIVISI_REVERSE[emp.Divisi_Encoded] || "Unknown",
        divisi_encoded: emp.Divisi_Encoded,
        jabatan: JABATAN_REVERSE[emp.Jabatan_Encoded] || "Unknown",
        gaji: emp.Gaji
    })).sort((a: any, b: any) => {
        if (a.divisi_encoded !== b.divisi_encoded) {
            return a.divisi_encoded - b.divisi_encoded;
        }
        return a.nama.localeCompare(b.nama);
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi Umur
        const umurNum = Number(formData.umur);
        if (!formData.umur || umurNum < 18 || umurNum > 65) {
            showToast("Umur harus antara 18-65 tahun.", "error");
            return;
        }

        setIsSubmitting(true);

        let finalGaji = Number(formData.gaji);

        // Auto Prediksi Gaji jika tidak manual
        if (!isManualSalary) {
            if (!formData.divisi || !formData.jabatan) {
                showToast("Pilih Divisi & Jabatan untuk prediksi.", "error");
                setIsSubmitting(false);
                return;
            }
            try {
                const predictData = await predictSalary({
                    umur: umurNum,
                    Divisi_Encoded: DIVISI_MAP[formData.divisi],
                    Jabatan_Encoded: JABATAN_MAP[formData.jabatan]
                });
                finalGaji = predictData.predicted_salary;
            } catch (err) {
                showToast("Gagal memprediksi gaji otomatis.", "error");
                setIsSubmitting(false);
                return;
            }
        }

        if (!finalGaji || finalGaji <= 0) {
            showToast("Gaji tidak valid.", "error");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                Nama: formData.nama,
                Divisi_Encoded: DIVISI_MAP[formData.divisi],
                Jabatan_Encoded: JABATAN_MAP[formData.jabatan],
                Gaji: finalGaji
            };

            if (editId) {
                await employeeService.updateEmployee(editId, payload);
            } else {
                await employeeService.addEmployee(payload);
            }

            showToast(editId ? "Data berhasil diperbarui" : "Karyawan berhasil ditambahkan", "success");
            setShowForm(false);
            setEditId(null);
            setFormData({ nama: "", divisi: "", jabatan: "", gaji: "", umur: "" });

            // Refetch after save using SWR
            mutate();
        } catch (err) {
            showToast("Gagal menyimpan data", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        setConfirmDelete({ show: true, id });
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete.id || isDeleting) return;

        setIsDeleting(true);
        try {
            await employeeService.deleteEmployee(confirmDelete.id);

            showToast("Data berhasil dihapus", "success");
            mutate();
        } catch (err) {
            showToast("Gagal menghapus data", "error");
        } finally {
            setIsDeleting(false);
            setConfirmDelete({ show: false, id: null });
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-slate-900">
                <div className="text-center">
                    <div className="relative flex h-20 w-20 items-center justify-center mx-auto">
                        <div className="absolute h-full w-full animate-ping rounded-full bg-[#13624C]/20"></div>
                        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#13624C] border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    const openEdit = (emp: any) => {
        setFormData({
            nama: emp.nama,
            divisi: emp.divisi,
            jabatan: emp.jabatan,
            gaji: emp.gaji?.toString() || "0",
            umur: "" // Reset Umur on Edit since backend doesn't store it
        });
        setIsManualSalary(true); // Default manual on edit to preserve old salary
        setEditId(emp.id);
        setShowForm(true);

        // Scroll to form after a short delay to ensure it's rendered if it was hidden
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus on Nama input
            const nameInput = formRef.current?.querySelector('input[name="nama"]') as HTMLInputElement;
            nameInput?.focus();
        }, 100);
    };

    const filteredData = employeeData.filter((emp: any) =>
        emp.nama.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Navbar diintegrasikan di bagian atas */}
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">{t('navbar.employees')}</h1>
                    <p className="mt-2 text-lg text-slate-500 dark:text-gray-400">
                        {t('employees.page.desc')}
                    </p>
                </div>

                {/* Insight Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="rounded-3xl bg-gradient-to-r from-[#13624C] to-[#0A3D2F] dark:from-emerald-600 dark:to-emerald-900 p-8 text-white shadow-xl">
                        <h3 className="text-lg font-bold opacity-80">{t('forecast.result.headcount')}</h3>
                        <p className="text-4xl font-black mt-2">{employeeData.length} {t('forecast.result.people')}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('employees.page.accuracy')}</h3>
                        <p className="text-4xl font-black mt-2 text-[#13624C] dark:text-emerald-400">99.9%</p>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder={t('employees.search.placeholder')}
                            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 py-3 pl-12 pr-4 outline-none focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
                    </div>
                    <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditId(null);
                            setFormData({ nama: "", divisi: "", jabatan: "", gaji: "", umur: "" });
                            setIsManualSalary(false);
                            const wasShown = showForm;
                            setShowForm(!showForm);

                            if (!wasShown) {
                                setTimeout(() => {
                                    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    const nameInput = formRef.current?.querySelector('input[name="nama"]') as HTMLInputElement;
                                    nameInput?.focus();
                                }, 100);
                            }
                        }}
                        className="rounded-xl bg-[#13624C] dark:bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                        {showForm ? t('employees.form.close') : t('employees.form.add')}
                    </button>
                    <button
                        onClick={async () => {
                            if (employeeData && employeeData.length > 0) {
                                setIsExporting(true);
                                try {
                                    await exportEmployeesToExcel(employeeData);
                                } catch (e) {
                                    console.error(e);
                                    showToast("Gagal mengekspor data", "error");
                                } finally {
                                    setIsExporting(false);
                                }
                            } else {
                                showToast("Tidak ada data untuk diexport", "error");
                            }
                        }}
                        disabled={isExporting}
                        className="flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 dark:hover:bg-white/20 disabled:opacity-50"
                    >
                        {isExporting ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        {isExporting ? t('pred.form.processing') : "Export Excel"}
                    </button>
                    </div>
                </div>

                {/* Toast Notifications */}
                <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
                    <AnimatePresence>
                        {toasts.map(toast => (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success'
                                        ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                                        : 'bg-white dark:bg-slate-800 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-400'
                                    }`}
                            >
                                {toast.type === 'success'
                                    ? <CheckCircle size={20} className="text-emerald-500" />
                                    : <AlertCircle size={20} className="text-red-500" />
                                }
                                <span className="text-sm font-bold">{toast.text}</span>
                                <button
                                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                    className="ml-2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {confirmDelete.show && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setConfirmDelete({ show: false, id: null })}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                                        <Trash2 size={32} className="text-red-500 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('employees.modal.deleteTitle')}</h3>
                                    <p className="text-slate-500 dark:text-gray-400 leading-relaxed mb-8">
                                        {t('employees.modal.deleteDesc')} <span className="font-bold text-red-500">{t('employees.modal.deleteWarning')}</span>.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            disabled={isDeleting}
                                            onClick={() => setConfirmDelete({ show: false, id: null })}
                                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                        >
                                            {t('employees.modal.cancel')}
                                        </button>
                                        <button
                                            disabled={isDeleting}
                                            onClick={confirmDeleteAction}
                                            className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all active:scale-95 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:shadow-none"
                                        >
                                            {isDeleting ? t('employees.form.saving') : t('employees.modal.confirm')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Add/Edit Form */}
                {showForm && (
                    <form
                        ref={formRef}
                        onSubmit={handleSave}
                        className="mb-8 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 relative scroll-mt-10"
                    >
                        <div className="md:col-span-2 pb-4 border-b border-slate-100 dark:border-white/5">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editId ? t('employees.form.editTitle') : t('employees.form.addTitle')}</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C] dark:text-emerald-400">{t('pred.form.name')}</label>
                            <input
                                required
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                className="w-full border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:border-[#13624C] dark:focus:border-emerald-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition"
                                placeholder={t('pred.form.namePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C] dark:text-emerald-400">{t('pred.form.age')} (18-65) <span className="text-red-500">*</span></label>
                            <input required type="number" min="18" max="65" value={formData.umur} onChange={(e) => setFormData({ ...formData, umur: e.target.value })} className="w-full border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:border-[#13624C] dark:focus:border-emerald-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition" placeholder={t('pred.form.agePlaceholder')} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C] dark:text-emerald-400">{t('pred.form.division')}</label>
                            <select required value={formData.divisi} onChange={(e) => setFormData({ ...formData, divisi: e.target.value })} className="w-full border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:border-[#13624C] dark:focus:border-emerald-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition">
                                <option value="">{t('pred.form.selectStatus')}</option>
                                {Object.values(DIVISI_REVERSE)
                                    .filter(d => d !== "Executive")
                                    .map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C] dark:text-emerald-400">{t('pred.form.role')}</label>
                            <select required value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="w-full border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:border-[#13624C] dark:focus:border-emerald-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition">
                                <option value="">{t('pred.form.selectStatus')}</option>
                                {Object.values(JABATAN_REVERSE)
                                    .filter(j => !["CEO", "CFO", "CMO", "CTO"].includes(j))
                                    .map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-gray-300 hover:text-[#13624C] dark:hover:text-emerald-400 transition-colors w-max">
                                <input
                                    type="checkbox"
                                    checked={isManualSalary}
                                    onChange={(e) => setIsManualSalary(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-[#13624C] dark:text-emerald-500 focus:ring-[#13624C] dark:focus:ring-emerald-400"
                                />
                                {t('employees.form.manualGaji')}
                            </label>
                        </div>
                        {isManualSalary && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-[#13624C] dark:text-emerald-400">Gaji (Rp) <span className="text-red-500">*</span></label>
                                <input required type="number" value={formData.gaji} onChange={(e) => setFormData({ ...formData, gaji: e.target.value })} className="w-full border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none focus:border-[#13624C] dark:focus:border-emerald-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition" placeholder="Contoh: 5000000" />
                            </div>
                        )}
                        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                {t('employees.modal.cancel')}
                            </button>
                            <button disabled={isSubmitting} type="submit" className="bg-[#13624C] dark:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 dark:disabled:bg-slate-700 shadow-md transition">
                                {isSubmitting ? t('employees.form.saving') : t('employees.form.save')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tabel Data */}
                {isLoading && !employeeData.length ? (
                    <div className="text-center py-12 text-slate-500 dark:text-gray-400 font-medium">{t('employees.table.loading')}</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 dark:text-red-400 font-medium">{t('employees.table.error')}</div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
                        <EmployeeTable data={paginatedData} onDelete={handleDelete} onEdit={openEdit} />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6 gap-4">
                                <span className="text-sm text-slate-500 dark:text-gray-400">
                                    {t('employees.pagination.showing')} <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> {t('employees.pagination.of')} <span className="font-bold text-slate-900 dark:text-white">{filteredData.length}</span> {t('employees.pagination.data')}
                                </span>
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                                    >
                                        {t('employees.pagination.prev')}
                                    </button>

                                    <div className="flex items-center px-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page
                                                        ? 'bg-[#13624C] dark:bg-emerald-500 text-white shadow-md'
                                                        : 'text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:shadow-sm'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                                    >
                                        {t('employees.pagination.next')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}