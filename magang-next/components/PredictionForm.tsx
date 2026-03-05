"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Pastikan install framer-motion
import { Briefcase, GraduationCap, User, Calculator } from "lucide-react";

export default function PredictionForm() {
    const [umur, setUmur] = useState("");
    const [pendidikan, setPendidikan] = useState("");
    const [pengalaman, setPengalaman] = useState("");
    const [hasil, setHasil] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulasi loading AI
        setTimeout(() => {
            const gaji = 5000000 + Number(pengalaman) * 1000000;
            setHasil(`Rp ${gaji.toLocaleString("id-ID")}`);
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Parameter Analisis</h2>
                    <p className="text-slate-400 text-sm">Lengkapi data di bawah untuk kalkulasi AI</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input Umur */}
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input
                            type="number"
                            placeholder="Umur"
                            className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                            value={umur}
                            onChange={(e) => setUmur(e.target.value)}
                            required
                        />
                    </div>

                    {/* Select Pendidikan */}
                    <div className="relative group">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <select
                            className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                            value={pendidikan}
                            onChange={(e) => setPendidikan(e.target.value)}
                            required
                        >
                            <option value="" className="bg-slate-900 text-slate-400">Pilih Pendidikan</option>
                            <option value="0" className="bg-slate-900">SMA / SMK</option>
                            <option value="1" className="bg-slate-900">Sarjana (S1)</option>
                            <option value="2" className="bg-slate-900">Magister (S2)</option>
                        </select>
                    </div>

                    {/* Input Pengalaman */}
                    <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input
                            type="number"
                            placeholder="Pengalaman Kerja (Tahun)"
                            className="w-full bg-slate-800/50 border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                            value={pengalaman}
                            onChange={(e) => setPengalaman(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Calculator size={20} />
                                Analisis Gaji
                            </>
                        )}
                    </button>
                </form>

                {/* Modal-like Result Display */}
                <AnimatePresence>
                    {hasil && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center"
                        >
                            <span className="text-slate-400 text-sm uppercase tracking-wider font-medium">Hasil Estimasi</span>
                            <div className="text-3xl font-black text-indigo-400 mt-1 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">
                                {hasil}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}