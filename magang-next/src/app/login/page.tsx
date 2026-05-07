"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/authService";
import Navbar from "@/src/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      router.push("/");
      router.refresh(); // Force navbar refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />
      
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#13624C]/15 bg-white p-10 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#13624C]">Login HRD</h2>
            <p className="mt-2 text-sm text-gray-600">
              Masuk untuk mengakses fitur Forecast dan Data Karyawan.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                  placeholder="hrd@wesclic.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#13624C]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#13624C]/20 px-4 py-3 outline-none transition focus:border-[#13624C]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-[#13624C] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:bg-gray-400"
              >
                {loading ? "Memproses..." : "Sign In"}
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
