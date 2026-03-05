import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PredictionForm from "../components/PredictionForm";
// Tips: Gunakan Framer Motion untuk animasi masuk
import { motion } from "framer-motion"; 

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-50 selection:bg-indigo-500/30">
      {/* Background Decor - Membuat kesan modern & depth */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <Navbar />

      <Hero />

      {/* Prediction Section dengan Glassmorphism Effect */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 -z-10 shadow-2xl" />
        
        <div className="flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Mulai Prediksi Sekarang
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl">
              Masukkan data Anda di bawah ini. AI kami akan menganalisis parameter secara real-time untuk memberikan hasil yang akurat.
            </p>
          </div>

          <div className="w-full max-w-4xl bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-colors duration-500">
            <PredictionForm />
          </div>
        </div>
      </section>

      {/* Footer Simple Modern */}
      <footer className="py-12 text-center text-slate-500 text-sm">
        © 2026 PredictAI Tech. All rights reserved.
      </footer>
    </main>
  );
}