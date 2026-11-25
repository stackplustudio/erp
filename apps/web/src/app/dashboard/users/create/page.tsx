"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

const ROLES = [
  { value: "OWNER",         label: "Owner / Direktur",   desc: "Akses penuh termasuk HPP dan override kredit" },
  { value: "FINANCE",       label: "Finance & AR",        desc: "Pelunasan piutang, kas, bank, aging report" },
  { value: "ORDER_CASHIER", label: "Kasir Toko",          desc: "Transaksi kasir cepat — HPP tersembunyi" },
  { value: "WAREHOUSE",     label: "Kepala Gudang",       desc: "Stok fisik, batch, transfer — HPP tersembunyi" },
  { value: "PURCHASING",    label: "Staf Pengadaan",      desc: "Purchase order dan penerimaan barang" },
  { value: "SUPER_ADMIN",   label: "Super Admin (Sistem)",desc: "Konfigurasi tenant, master data, user" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ORDER_CASHIER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Nama, email, dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users", formData);
      toast.success("User baru berhasil ditambahkan");
      router.push("/dashboard/users");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal menyimpan user";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === formData.role);

  return (
    <div className="space-y-6 max-w-xl">
      {/* Page Header */}
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-xs text-brand-ink-muted hover:text-brand-ink-dark transition-colors mb-3"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Kembali ke Manajemen User
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Tambah User Baru</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Buat akun karyawan baru dan tentukan hak akses RBAC-nya.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-brand-surface border border-brand-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-line flex items-center gap-2.5">
          <UserPlus className="size-4 text-brand-primary" aria-hidden="true" />
          <span className="font-semibold text-sm text-brand-ink-dark">Informasi Akun</span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="create-name" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Nama Lengkap <span className="text-brand-danger">*</span>
            </label>
            <Input
              id="create-name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="create-email" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Alamat Email <span className="text-brand-danger">*</span>
            </label>
            <Input
              id="create-email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="budi@perusahaan.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="create-password" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Password <span className="text-brand-danger">*</span>
            </label>
            <Input
              id="create-password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="create-role" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Peran (Role) <span className="text-brand-danger">*</span>
            </label>
            <select
              id="create-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-brand-line bg-brand-background text-sm text-brand-ink-dark outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary appearance-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {selectedRole && (
              <p className="mt-1.5 text-xs text-brand-ink-muted">{selectedRole.desc}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-brand-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
