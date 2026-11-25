"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { api } from "@/lib/axios";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

const DEMO_PRESETS = [
  {
    role: "TRIAL 7 HARI",
    label: "Akun Trial (Full Access)",
    email: "trial@stackplus.studio",
    password: "password123",
    badge: "bg-brand-primary text-white",
    desc: "Akses penuh seluruh modul selama 7 hari",
  },
  {
    role: "OWNER",
    label: "Owner / Direktur",
    email: "owner@demo.stackplus.studio",
    password: "password123",
    badge: "bg-brand-primary text-white",
    desc: "Lihat HPP, laba rugi, override credit limit",
  },
  {
    role: "FINANCE",
    label: "Finance & AR",
    email: "finance@demo.stackplus.studio",
    password: "password123",
    badge: "bg-brand-success text-white",
    desc: "Pelunasan AR, kas & bank, AR aging report",
  },
  {
    role: "ORDER_CASHIER",
    label: "Kasir Toko (F9)",
    email: "kasir@demo.stackplus.studio",
    password: "password123",
    badge: "bg-brand-warning text-white",
    desc: "Kasir cepat USB barcode, HPP dimasking",
  },
  {
    role: "WAREHOUSE",
    label: "Kepala Gudang",
    email: "gudang@demo.stackplus.studio",
    password: "password123",
    badge: "bg-brand-info text-white",
    desc: "Stok fisik, mutasi, batch FEFO & transfer",
  },
  {
    role: "PURCHASING",
    label: "Staf Pengadaan",
    email: "purchasing@demo.stackplus.studio",
    password: "password123",
    badge: "bg-brand-ink-dark text-white",
    desc: "Purchase order & penerimaan barang",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("trial@stackplus.studio");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const targetEmail = customEmail ?? email;
    const targetPass = customPass ?? password;

    if (!targetEmail || !targetPass) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{
        message: string;
        access_token: string;
        user: { id: string; email: string; name: string; role: string; tenantId?: string };
      }>("/auth/login", {
        email: targetEmail,
        password: targetPass,
      });

      // Save token in cookie & user in localStorage
      Cookies.set("token", res.data.access_token, { expires: 7 });
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("demo_active_role", res.data.user.role);
      }

      toast.success(`Selamat datang, ${res.data.user.name || "Pengguna"}!`);
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Login gagal. Periksa kembali email dan password Anda.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: (typeof DEMO_PRESETS)[0]) => {
    setEmail(preset.email);
    setPassword(preset.password);
    void handleLogin(undefined, preset.email, preset.password);
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col justify-between text-brand-ink-dark">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-brand-line/60 bg-brand-surface/70 backdrop-blur-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-ink hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Beranda Produk</span>
        </Link>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary-soft text-brand-primary font-bold border border-brand-primary/20">
          Showroom FMCG Live
        </span>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-brand-surface border border-brand-line rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10">
          {/* Left Form: Direct Login */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-6">
            <div>
              <BrandLogo variant="full" href="/" iconHeight={36} />
              <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark mt-4">
                Masuk ke Sistem ERP
              </h1>
              <p className="text-xs text-brand-ink-muted mt-1">
                Gunakan kredensial akun Anda atau pilih akun trial untuk mencoba semua fitur.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                    className="pl-9 h-10 bg-brand-background text-compact"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 h-10 bg-brand-background text-compact font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover h-11 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                {loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
              </Button>
            </form>

            {/* Trial Callout Card */}
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary-soft/60 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand-primary" />
                <span className="text-xs font-bold text-brand-primary">Akun Trial Siap Pakai</span>
              </div>
              <p className="text-xs text-brand-ink">
                Ingin langsung mencoba tanpa mengisi form? Klik tombol di samping untuk masuk instan dengan akses penuh.
              </p>
            </div>
          </div>

          {/* Right Column: 1-Click Role Switcher */}
          <div className="md:col-span-6 bg-brand-surface-alt/70 border border-brand-line/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                  <UserCheck className="size-3.5 text-brand-primary" />
                  <span>Akses Cepat 1-Klik (Role Demo)</span>
                </div>
                <span className="text-[10px] font-mono text-brand-ink-muted">Password: password123</span>
              </div>
              <p className="text-xs text-brand-ink-muted mb-4">
                Pilih peran untuk menguji hak akses (RBAC), HPP masking, kasir cepat, dan pelunasan AR:
              </p>

              <div className="space-y-2">
                {DEMO_PRESETS.map((p) => {
                  const isTrial = p.role === "TRIAL 7 HARI";
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      disabled={loading}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
                        isTrial
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm hover:opacity-95"
                          : "bg-brand-surface border-brand-line hover:border-brand-primary/40 hover:bg-white"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              isTrial
                                ? "bg-white text-brand-primary"
                                : "bg-brand-surface-alt text-brand-ink-dark border border-brand-line"
                            }`}
                          >
                            {p.role}
                          </span>
                          <span className={`text-xs font-bold truncate ${isTrial ? "text-white" : "text-brand-ink-dark"}`}>
                            {p.label}
                          </span>
                        </div>
                        <div className={`text-[11px] truncate mt-0.5 ${isTrial ? "text-white/80" : "text-brand-ink-muted"}`}>
                          {p.desc}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${isTrial ? "text-white underline" : "text-brand-primary"}`}>
                        Masuk →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-brand-line/60 pt-3 flex items-center justify-between text-[11px] text-brand-ink-muted">
              <span>Tenant: PT StackPlus Distribusi Sembako</span>
              <span className="font-mono">v2.0-FMCG</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-brand-ink-muted border-t border-brand-line/40">
        © {new Date().getFullYear()} StackPlus Studio · Micro Distributor & Grosir ERP System
      </footer>
    </div>
  );
}
