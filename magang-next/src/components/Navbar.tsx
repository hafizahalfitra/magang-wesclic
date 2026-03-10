'use client';
import { motion } from 'framer-motion';

export default function Navbar() {
    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'Tentang', href: '#tentang' },
        { name: 'Prediksi', href: '#prediksi' },
    ];

    return (
        <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b border-[#13624C]/10 bg-white/80 backdrop-blur-md"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

                {/* Logo & Brand - Disesuaikan agar lebih rapi */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Wesclic Logo"
                        // Ukuran diubah dari h-20 ke h-12 agar pas di navbar
                        className="h-12 w-auto object-contain" 
                    />
                    <div className="flex flex-col gap-0 min-w-fit">
                        <h1 className="text-base font-extrabold tracking-tight text-[#13624C] md:text-lg">
                            Salary<span className="font-light text-gray-500">Prediction</span>
                        </h1>
                        <p className="hidden text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 sm:block">
                            PT Wesclic Indonesia Neotech
                        </p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden flex-1 items-center justify-center gap-x-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="group relative py-1 text-sm font-semibold text-gray-600 transition-colors hover:text-[#13624C]"
                        >
                            {link.name}
                            <span className="absolute inset-x-0 -bottom-1 h-0.5 scale-x-0 bg-[#13624C] transition-transform duration-300 group-hover:scale-x-100" />
                        </a>
                    ))}

                    <div className="h-4 w-[1px] bg-gray-200" />

                    <a
                        href="/data-karyawan"
                        className="text-sm font-semibold text-gray-600 transition-colors hover:text-[#13624C]"
                    >
                        Data Karyawan
                    </a>
                </nav>

                {/* Action Button */}
                <div className="flex items-center gap-3">
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#prediksi"
                        className="inline-flex items-center justify-center rounded-full bg-[#13624C] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#13624C]/20 transition-all"
                    >
                        Coba Sekarang
                    </motion.a>
                </div>

            </div>
        </motion.header>
    );
}