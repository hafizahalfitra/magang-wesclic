export default function Hero() {
    return (
        <section
            id="home"
            className="relative min-h-[90vh] overflow-hidden bg-white px-6 pt-16 pb-24 md:px-10 lg:px-12 lg:pt-32"
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-[#13624C]/5 blur-[120px]" />
                <div className="absolute -right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-[#13624C]/10 blur-[100px]" />
                {/* Grid Pattern (Optional subtle texture) */}
                <div className="absolute inset-0 bg-[url('https://play.tailwindcss.com/img/beams.png')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">

                    {/* Left Column: Content */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#13624C]/20 bg-[#13624C]/5 px-4 py-1.5 text-sm font-bold text-[#13624C]">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#13624C] opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#13624C]"></span>
                            </span>
                            AI-Powered Insight
                        </div>

                        <h2 className="mt-8 text-5xl font-black leading-[1.15] tracking-tight text-[#13624C] lg:text-7xl">
                            Estimasi <span className="italic font-light">Gaji Karyawan</span> Berbasis Data
                        </h2>

                        <p className="mt-8 max-w-xl text-lg leading-relaxed text-gray-500/90 lg:text-xl">
                            Gunakan teknologi <span className="font-semibold text-gray-800 underline decoration-[#13624C]/30 decoration-4">Machine Learning</span> untuk menentukan standar gaji yang objektif berdasarkan umur, pendidikan, dan pengalaman.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-5">
                            <a
                                href="#prediksi"
                                className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-[#13624C] px-8 py-4 font-bold text-white transition-all hover:scale-105 active:scale-95"
                            >
                                <span className="relative z-10">Mulai Prediksi</span>
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <a
                                href="#tentang"
                                className="flex items-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-8 py-4 font-bold text-gray-700 transition-all hover:border-[#13624C]/20 hover:bg-gray-50 active:scale-95"
                            >
                                Pelajari Sistem
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Visual Features */}
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#13624C]/20 to-transparent blur-2xl opacity-50" />
                        <div className="relative grid grid-cols-2 gap-4">

                            <div className="space-y-4 pt-12">
                                <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl transition-all hover:border-[#13624C]/30">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#13624C] text-white">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 13a3 3 0 110-6 3 3 0 010 6z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Metode</h3>
                                    <p className="mt-1 text-xl font-extrabold text-gray-800">Supervised Learning</p>
                                </div>

                                <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-6 shadow-xl">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Frontend</h3>
                                    <p className="mt-1 text-xl font-extrabold text-[#13624C]">Next.js 14</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-6 shadow-xl">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Backend</h3>
                                    <p className="mt-1 text-xl font-extrabold text-[#13624C]">FastAPI / Flask</p>
                                </div>

                                <div className="rounded-3xl bg-[#13624C]/10 border border-[#13624C]/20 p-6 shadow-xl">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#13624C] shadow-inner">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest text-[#13624C]">Output</h3>
                                    <p className="mt-1 text-xl font-extrabold text-[#13624C]">Real-time Prediction</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Tentang Section Integrated as a Floating Card */}
                <div id="tentang" className="group mt-32 rounded-[2.5rem] bg-gradient-to-br from-[#13624C] to-[#0a3a2d] p-1 shadow-2xl transition-all hover:scale-[1.01]">
                    <div className="flex flex-col items-center justify-between gap-8 rounded-[2.4rem] bg-[#13624C] px-8 py-12 md:flex-row md:px-16 lg:py-16">
                        <div className="max-w-2xl">
                            <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">Tentang Sistem</h3>
                            <p className="mt-6 text-lg leading-relaxed text-white/80">
                                Dirancang untuk memudahkan HRD dan manajemen dalam menentukan standar remunerasi. Data dikirim langsung ke API AI kami untuk diproses dalam hitungan detik.
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center justify-center rounded-3xl bg-white/10 p-10 backdrop-blur-sm border border-white/20">
                            <div className="text-center">
                                <p className="text-5xl font-black text-white">99%</p>
                                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/60">Akurasi Model</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}