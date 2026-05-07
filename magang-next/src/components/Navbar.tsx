'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/authService';
import { User } from '../types/auth';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Load user from localStorage on mount and when path changes
        setUser(authService.getUser());
    }, [pathname]);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        router.push('/');
        router.refresh();
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Tentang', href: '/#tentang' },
        { name: 'Prediksi', href: '/#prediksi' },
    ];

    // Add HRD only links
    if (user?.role === 'HRD') {
        navLinks.push({ name: 'Forecast', href: '/forecast' });
    }

    return (
        <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b border-[#13624C]/10 bg-white/80 backdrop-blur-md"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Wesclic Logo"
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
                        <Link
                            key={link.name}
                            href={link.href}
                            className="group relative py-1 text-sm font-semibold text-gray-600 transition-colors hover:text-[#13624C]"
                        >
                            {link.name}
                            <span className="absolute inset-x-0 -bottom-1 h-0.5 scale-x-0 bg-[#13624C] transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    ))}

                    {user?.role === 'HRD' && (
                        <>
                            <div className="h-4 w-[1px] bg-gray-200" />
                            <Link
                                href="/data-karyawan"
                                className="text-sm font-semibold text-gray-600 transition-colors hover:text-[#13624C]"
                            >
                                Data Karyawan
                            </Link>
                        </>
                    )}
                </nav>

                {/* Action Button */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden text-xs font-medium text-gray-500 lg:block">
                                Hello, <span className="text-[#13624C] font-bold">{user.name}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center rounded-full border border-[#13624C]/20 px-5 py-2 text-sm font-bold text-[#13624C] transition-all hover:bg-[#13624C]/5"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" passHref>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-full bg-[#13624C] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#13624C]/20 transition-all"
                            >
                                Login HRD
                            </motion.button>
                        </Link>
                    )}
                </div>

            </div>
        </motion.header>
    );
}