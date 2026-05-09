"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/authService";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslation } from "@/src/hooks/useTranslation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const { token, isLoading: authLoading, login: contextLogin } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      router.push("/");
    }
  }, [token, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      contextLogin(data.user, data.access_token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error.unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#13624C]/15 dark:border-white/10 bg-white dark:bg-slate-800 p-10 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#13624C] dark:text-emerald-400">{t('navbar.login')}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('login.page.subtitle')}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                  {t('login.form.email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                  placeholder="your email@.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#13624C] dark:text-emerald-400">
                  {t('login.form.password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#13624C]/20 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 outline-none transition focus:border-[#13624C] dark:focus:border-emerald-400 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-[#13624C] dark:bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:bg-gray-400 dark:disabled:bg-slate-700"
              >
                {loading ? t('pred.form.processing') : t('login.form.submit')}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>© 2026 PT Wesclic Indonesia Neotech. All rights reserved.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
