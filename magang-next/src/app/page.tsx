'use client';

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PredictionForm from "../components/PredictionForm";
import { useTranslation } from "../hooks/useTranslation";
import { useTheme } from "../context/ThemeContext";

// Komponen Footer
function Footer() {
  const { t } = useTranslation();
  const { theme, mounted } = useTheme();

  return (
    <footer className="bg-[#0A3D2F] dark:bg-slate-950 text-white pt-16 pb-8 px-6 md:px-12 mt-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Kolom 1: Logo & Deskripsi */}
        <div className="space-y-4">
          <img 
            src={mounted && theme === 'dark' ? "/logo-dark.png" : "/logo-light.png"} 
            alt="Wesclic Logo" 
            className="h-10 w-auto brightness-0 invert" 
          />
          <p className="text-sm leading-relaxed text-white/90">
            <strong className="block text-white mb-2">{t('footer.motto')}</strong>
            {t('footer.desc')}
          </p>
          <div className="flex gap-3 pt-2">
            {['WA', 'LI', 'IG'].map((social) => (
              <div key={social} className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-xs hover:bg-white/10 cursor-pointer">
                {social}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 2: Tautan Cepat */}
        <div>
          <h4 className="font-bold text-lg mb-6">{t('footer.linksTitle')}</h4>
          <ul className="space-y-3 text-sm text-white/80">
            {[
              { key: 'footer.links.about', label: t('footer.links.about') },
              { key: 'footer.links.services', label: t('footer.links.services') },
              { key: 'footer.links.portfolio', label: t('footer.links.portfolio') },
              { key: 'footer.links.tech', label: t('footer.links.tech') },
              { key: 'footer.links.industry', label: t('footer.links.industry') },
              { key: 'footer.links.contact', label: t('footer.links.contact') }
            ].map((item) => (
              <li key={item.key} className="hover:text-white cursor-pointer transition">{item.label}</li>
            ))}
          </ul>
        </div>

        {/* Kolom 3: Hubungi Kami */}
        <div>
          <h4 className="font-bold text-lg mb-6">{t('footer.contactTitle')}</h4>
          <ul className="space-y-4 text-sm text-white/80">
            <li className="flex items-center gap-3">✉ info@wesclic.com</li>
            <li className="flex items-center gap-3">📞 0811 26464 97</li>
            <li className="flex items-center gap-3">📍 Yogyakarta, Indonesia</li>
          </ul>
        </div>
      </div>

      {/* Baris Bawah */}
      <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/60 gap-4">
        <p className="text-center">{t('footer.copyright')}</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <span className="hover:text-white cursor-pointer">{t('footer.privacy')}</span>
          <span className="hover:text-white cursor-pointer">{t('footer.terms')}</span>
          <span className="hover:text-white cursor-pointer">{t('footer.sitemap')}</span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <Hero />

      {/* Section Prediction */}
      <section id="prediksi" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#13624C] dark:text-emerald-400 md:text-4xl">{t('prediction.section.title')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
            {t('prediction.section.desc')}
          </p>
        </div>
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#13624C]/15 dark:border-emerald-400/20 bg-white dark:bg-slate-800 p-6 shadow-lg md:p-8">
          <PredictionForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}