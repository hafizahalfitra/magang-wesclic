'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { theme, toggleTheme, mounted } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
    };

    const toggleLanguage = () => {
        setLanguage(language === 'id' ? 'en' : 'id');
    };

    const navLinks = [
        { name: t('navbar.home'), href: '/' },
        { name: t('navbar.about'), href: '/#tentang' },
        { name: t('navbar.prediction'), href: '/#prediksi' },
    ];

    // Add HRD only links
    if (user?.role === 'HRD') {
        navLinks.push({ name: t('navbar.forecast'), href: '/forecast' });
    }

    return (
        <>
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 w-full border-b border-[#13624C]/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300"
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                    <img
                        src={mounted && theme === 'dark' ? "/logo-dark.png" : "/logo-light.png"}
                        alt="Wesclic Logo"
                        className="h-12 w-auto object-contain" 
                    />
                    <div className="flex flex-col gap-0 min-w-fit">
                        <h1 className="text-base font-extrabold tracking-tight text-[#13624C] dark:text-emerald-400 md:text-lg">
                            Salary<span className="font-light text-gray-500 dark:text-gray-400">Prediction</span>
                        </h1>
                        <p className="hidden text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 sm:block">
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
                            className="group relative py-1 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors hover:text-[#13624C] dark:hover:text-emerald-400"
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
                                className="text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors hover:text-[#13624C] dark:hover:text-emerald-400"
                            >
                                {t('navbar.employees')}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Action Button & Mobile Toggle */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden md:flex items-center gap-2 sm:gap-3">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                            {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    <button onClick={toggleLanguage} className="flex items-center gap-1 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition text-sm font-bold uppercase">
                        <Globe size={18} /> {language}
                    </button>
                    
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden text-xs font-medium text-gray-500 dark:text-gray-400 lg:block">
                                Hello, <span className="text-[#13624C] dark:text-emerald-400 font-bold">{user.name}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center rounded-full border border-[#13624C]/20 dark:border-emerald-400/20 px-5 py-2 text-sm font-bold text-[#13624C] dark:text-emerald-400 transition-all hover:bg-[#13624C]/5 dark:hover:bg-emerald-400/10"
                            >
                                {t('navbar.logout')}
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" passHref>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-full bg-[#13624C] dark:bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#13624C]/20 dark:shadow-emerald-500/20 transition-all"
                            >
                                {t('navbar.login')}
                            </motion.button>
                        </Link>
                    )}
                    </div>
                    
                    {/* Mobile Menu Toggle Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>

            </div>
        </motion.header>

        {/* Mobile Menu Overlay & Drawer */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] flex md:hidden">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white dark:bg-slate-900 shadow-2xl px-6 py-6"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-extrabold text-[#13624C] dark:text-emerald-400">
                                Menu
                            </h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-2 text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#13624C] dark:hover:text-emerald-400 transition-colors border-b border-gray-100 dark:border-white/10"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            
                            {user?.role === 'HRD' && (
                                <Link
                                    href="/data-karyawan"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-2 text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#13624C] dark:hover:text-emerald-400 transition-colors border-b border-gray-100 dark:border-white/10"
                                >
                                    {t('navbar.employees')}
                                </Link>
                            )}
                        </nav>

                        <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-4 mb-2">
                                <button onClick={toggleTheme} className="flex-1 flex justify-center items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium">
                                    {mounted && theme === 'dark' ? <><Sun size={18} /> Light</> : <><Moon size={18} /> Dark</>}
                                </button>
                                <button onClick={toggleLanguage} className="flex-1 flex justify-center items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold uppercase">
                                    <Globe size={18} /> {language}
                                </button>
                            </div>

                            {user ? (
                                <div className="flex flex-col gap-3">
                                    <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Hello, <span className="text-[#13624C] dark:text-emerald-400 font-bold">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                        className="w-full rounded-xl border-2 border-[#13624C]/20 dark:border-emerald-400/20 px-5 py-3 text-sm font-bold text-[#13624C] dark:text-emerald-400 transition-all hover:bg-[#13624C]/5"
                                    >
                                        {t('navbar.logout')}
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" passHref onClick={() => setIsMobileMenuOpen(false)}>
                                    <button className="w-full rounded-xl bg-[#13624C] dark:bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition-all shadow-md shadow-[#13624C]/20">
                                        {t('navbar.login')}
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
}