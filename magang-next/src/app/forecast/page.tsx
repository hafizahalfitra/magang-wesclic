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
            <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="relative flex h-20 w-20 items-center justify-center mx-auto">
                        <div className="absolute h-full w-full animate-ping rounded-full bg-[#13624C]/20"></div>
                        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#13624C] border-t-transparent"></div>
                    </div>
                    <p className="mt-6 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                        Authenticating Access
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-slate-50 to-white">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-16">
                {/* Header Section */}
                <div className="relative mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#13624C] shadow-sm border border-emerald-100">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#13624C] animate-pulse"></span>
                            HRD Intelligence
                        </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
                                Forecast <span className="text-[#13624C]">Anggaran</span> Gaji
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-slate-600">
                                Optimalkan perencanaan finansial divisi Anda dengan presisi tinggi melalui kalkulasi cerdas berbasis struktur organisasi dan status karyawan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card - Glassmorphism style */}
                <div className="group mb-12 overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-1 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-emerald-900/5">
                    <div className="rounded-[1.9rem] bg-white p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#13624C] to-[#0d4535] text-3xl text-white shadow-lg shadow-emerald-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="Step 9 19V5l4 14 4-14v14" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19h6" />
                            </svg>
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-xl font-bold text-slate-900">Analisis Proyeksi ML-Based</h3>
                            <p className="text-slate-500 leading-relaxed max-w-4xl">
                                Mengintegrasikan model <span className="font-semibold text-slate-700">Supervised Learning</span> untuk memprediksi standar remunerasi secara otomatis. Sistem menyesuaikan input data dengan pertumbuhan tahunan divisi secara dinamis untuk hasil yang lebih akurat.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form Section */}
                <div className="relative mx-auto max-w-5xl">
                    {/* Decorative element */}
                    <div className="absolute -top-6 -right-6 h-32 w-32 bg-[#13624C]/5 blur-3xl rounded-full"></div>
                    <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-blue-500/5 blur-3xl rounded-full"></div>
                    
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:p-14">
                        <div className="mb-10 flex items-center gap-4">
                            <div className="h-1 w-12 rounded-full bg-[#13624C]"></div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Konfigurasi Forecast</h2>
                        </div>
                        <ForecastForm />
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-20 border-t border-slate-200 pt-8 text-center">
                    <p className="text-sm font-medium text-slate-400">
                        © 2026 PT Wesclic Indonesia Neotech
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-tighter text-slate-300">
                        Decision Support System • Predictive Analytics
                    </p>
                </div>
            </div>
        </main>
    );
}