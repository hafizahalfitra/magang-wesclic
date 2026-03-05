import { ArrowRight, Sparkles } from "lucide-react"; // Opsional: Gunakan icon lucide

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Decorative Badge */}
            <div className="flex justify-center mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium backdrop-blur-sm animate-fade-in">
                    <Sparkles size={14} />
                    Powered by Machine Learning 2.0
                </span>
            </div>

            <div className="text-center max-w-4xl mx-auto relative z-10">
                {/* Bold Modern Heading */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                    Prediksi Gaji Anda dengan
                    <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Akurasi AI Presisi.
                    </span>
                </h1>

                {/* Refined Description */}
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                    Analisis komprehensif berbasis data untuk menentukan nilai pasar Anda
                    berdasarkan umur, edukasi, pengalaman, dan spesialisasi jabatan.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center gap-2">
                        Mulai Prediksi
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-2xl font-semibold transition-all">
                        Lihat Dataset
                    </button>
                </div>
            </div>

            {/* Decorative Element: Abstract Shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
        </section>
    );
}