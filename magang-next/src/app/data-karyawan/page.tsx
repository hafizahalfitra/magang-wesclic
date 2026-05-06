'use client';
import { useState, useRef } from 'react';
import useSWR from 'swr';
import Navbar from "@/src/components/Navbar";
import EmployeeTable from "@/src/components/EmployeeTable";
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DataKaryawanPage() {
    const [search, setSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast state
    const [toasts, setToasts] = useState<{ id: number, text: string, type: 'success' | 'error' }[]>([]);
    
    // Confirmation Modal state
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean, id: number | null }>({ show: false, id: null });

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

    const { data: rawData, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/employees?limit=100`, fetcher);

    const employeeData = (rawData || []).map((emp: any) => ({
        id: emp.id,
        nama: emp.Nama,
        divisi: DIVISI_REVERSE[emp.Divisi_Encoded] || "Unknown",
        jabatan: JABATAN_REVERSE[emp.Jabatan_Encoded] || "Unknown",
        gaji: emp.Gaji
    }));

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
                const predictRes = await fetch(`${API_BASE_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        umur: umurNum,
                        Divisi_Encoded: DIVISI_MAP[formData.divisi],
                        Jabatan_Encoded: JABATAN_MAP[formData.jabatan]
                    })
                });
                if (!predictRes.ok) throw new Error("Prediksi gagal");
                const predictData = await predictRes.json();
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

            let res;
            if (editId) {
                res = await fetch(`${API_BASE_URL}/employees/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_BASE_URL}/employees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error("Gagal menyimpan data");
            
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
        if (!confirmDelete.id) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/employees/${confirmDelete.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Gagal menghapus");
            
            showToast("Data berhasil dihapus", "success");
            mutate();
        } catch (err) {
            showToast("Gagal menghapus data", "error");
        } finally {
            setConfirmDelete({ show: false, id: null });
        }
    };

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

    const filteredData = employeeData.filter((emp) =>
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
                        className="bg-[#13624C] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition shadow-md"
                    >
                        {showForm ? "Tutup Form" : "+ Tambah Karyawan"}
                    </button>
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
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${
                                    toast.type === 'success' 
                                        ? 'bg-white border-emerald-100 text-emerald-800' 
                                        : 'bg-white border-red-100 text-red-800'
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
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                        <Trash2 size={32} className="text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Hapus Data?</h3>
                                    <p className="text-slate-500 leading-relaxed mb-8">
                                        Apakah Anda yakin ingin menghapus data ini? Tindakan ini <span className="font-bold text-red-500">tidak dapat dibatalkan</span>.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={() => setConfirmDelete({ show: false, id: null })}
                                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            onClick={confirmDeleteAction}
                                            className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                                        >
                                            Ya, Hapus
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
                        className="mb-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 relative scroll-mt-10"
                    >
                        <div className="md:col-span-2 pb-4 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{editId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C]">Nama</label>
                            <input 
                                required 
                                type="text" 
                                name="nama"
                                value={formData.nama} 
                                onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-[#13624C] transition" 
                                placeholder="Contoh: Budi Santoso"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C]">Umur (18-65) <span className="text-red-500">*</span></label>
                            <input required type="number" min="18" max="65" value={formData.umur} onChange={(e) => setFormData({...formData, umur: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-[#13624C] transition" placeholder="Contoh: 25"/>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C]">Divisi</label>
                            <select required value={formData.divisi} onChange={(e) => setFormData({...formData, divisi: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-[#13624C] transition">
                                <option value="">Pilih</option>
                                {Object.values(DIVISI_REVERSE)
                                    .filter(d => d !== "Executive")
                                    .map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-[#13624C]">Jabatan</label>
                            <select required value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-[#13624C] transition">
                                <option value="">Pilih</option>
                                {Object.values(JABATAN_REVERSE)
                                    .filter(j => !["CEO", "CFO", "CMO", "CTO"].includes(j))
                                    .map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 hover:text-[#13624C] transition-colors w-max">
                                <input 
                                    type="checkbox" 
                                    checked={isManualSalary} 
                                    onChange={(e) => setIsManualSalary(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-[#13624C] focus:ring-[#13624C]"
                                />
                                Input Gaji Manual (Jika tidak, gaji akan diestimasi otomatis oleh Model ML)
                            </label>
                        </div>
                        {isManualSalary && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-[#13624C]">Gaji (Rp) <span className="text-red-500">*</span></label>
                                <input required type="number" value={formData.gaji} onChange={(e) => setFormData({...formData, gaji: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-[#13624C] transition" placeholder="Contoh: 5000000"/>
                            </div>
                        )}
                        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">
                                Batal
                            </button>
                            <button disabled={isSubmitting} type="submit" className="bg-[#13624C] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 shadow-md transition">
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tabel Data */}
                {isLoading && !employeeData.length ? (
                    <div className="text-center py-12 text-slate-500 font-medium">Memuat data...</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 font-medium">Gagal memuat data.</div>
                ) : (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <EmployeeTable data={paginatedData} onDelete={handleDelete} onEdit={openEdit} />
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 gap-4">
                                <span className="text-sm text-slate-500">
                                    Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-slate-900">{filteredData.length}</span> data
                                </span>
                                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                    <button 
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                                    >
                                        Prev
                                    </button>
                                    
                                    <div className="flex items-center px-2">
                                        {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                            <button 
                                                key={page} 
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                    currentPage === page 
                                                        ? 'bg-[#13624C] text-white shadow-md' 
                                                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                                    >
                                        Next
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