"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import ForecastForm from "@/src/components/ForecastForm";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslation } from "@/src/hooks/useTranslation";

export default function ForecastPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, token, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== "HRD" || !token) {
                router.push("/login");
            }
        }
    }, [user, token, authLoading, router]);

    if (authLoading || !user) {
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
        <main className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-16">
                {/* Header Section */}
                <div className="relative mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="inline-flex items-center rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#13624C] dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-white/10">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#13624C] dark:bg-emerald-400 animate-pulse"></span>
                            {t('forecast.page.hrd')}
                        </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl">
                                {t('forecast.page.title1')} <span className="text-[#13624C] dark:text-emerald-400">{t('forecast.page.title2')}</span> {t('forecast.page.title3')}
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-gray-400">
                                {t('forecast.page.desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card - Glassmorphism style */}
                <div className="group mb-12 overflow-hidden rounded-[2rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 p-1 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-emerald-900/5">
                    <div className="rounded-[1.9rem] bg-white dark:bg-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#13624C] to-[#0d4535] dark:from-emerald-600 dark:to-emerald-800 text-3xl text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V5l4 14 4-14v14" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19h6" />
                            </svg>
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('forecast.page.cardTitle')}</h3>
                            <p className="text-slate-500 dark:text-gray-400 leading-relaxed max-w-4xl">
                                {t('forecast.page.cardDesc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form Section */}
                <div className="relative mx-auto max-w-5xl">
                    {/* Decorative element */}
                    <div className="absolute -top-6 -right-6 h-32 w-32 bg-[#13624C]/5 blur-3xl rounded-full"></div>
                    <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-blue-500/5 blur-3xl rounded-full"></div>
                    
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:p-14">
                        <div className="mb-10 flex items-center gap-4">
                            <div className="h-1 w-12 rounded-full bg-[#13624C] dark:bg-emerald-500"></div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">{t('forecast.page.configTitle')}</h2>
                        </div>
                        <ForecastForm />
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-20 border-t border-slate-200 dark:border-white/10 pt-8 text-center">
                    <p className="text-sm font-medium text-slate-400 dark:text-gray-500">
                        {t('forecast.page.footer')}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-tighter text-slate-300 dark:text-gray-600">
                        Decision Support System • Predictive Analytics
                    </p>
                </div>
            </div>
        </main>
    );
}