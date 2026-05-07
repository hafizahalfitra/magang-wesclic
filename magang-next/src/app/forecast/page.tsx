"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import ForecastForm from "@/src/components/ForecastForm";
import { authService } from "@/src/services/authService";
import { User } from "@/src/types/auth";

export default function ForecastPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getUser();
        const token = authService.getToken();

        if (!currentUser || currentUser.role !== "HRD" || !token) {
            router.push("/login");
        } else {
            setUser(currentUser);
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#13624C] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Memvalidasi akses...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block rounded-full bg-[#13624C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#13624C]">
                            HRD Dashboard
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900">Forecast Anggaran Gaji</h1>
                    <p className="mt-2 text-lg text-slate-500 max-w-3xl">
                        Estimasi kebutuhan anggaran gaji divisi untuk periode mendatang dengan mempertimbangkan pertumbuhan, struktur organisasi, dan status karyawan.
                    </p>
                </div>

                {/* Info Card */}
                <div className="mb-10 rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-[#13624C]/10 flex items-center justify-center text-[#13624C] text-2xl shrink-0">
                        📊
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Analisis Proyeksi</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Fitur ini menggunakan model Machine Learning yang telah dilatih untuk memprediksi standar gaji pada setiap tingkatan jabatan, kemudian dikalkulasi dengan tingkat pertumbuhan tahunan divisi terkait.
                        </p>
                    </div>
                </div>

                {/* Main Form Section */}
                <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl md:p-12">
                    <ForecastForm />
                </div>

                <div className="mt-12 text-center text-xs text-slate-400">
                    <p>© 2026 PT Wesclic Indonesia Neotech. Sistem Prediksi Gaji Berbasis Supervised Learning.</p>
                </div>
            </div>
        </main>
    );
}
