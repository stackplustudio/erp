"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

const ROLES = [
  { value: "OWNER",         label: "Owner / Direktur",    desc: "Akses penuh termasuk HPP dan override kredit" },
  { value: "FINANCE",       label: "Finance & AR",         desc: "Pelunasan piutang, kas, bank, aging report" },
  { value: "ORDER_CASHIER", label: "Kasir Toko",           desc: "Transaksi kasir cepat — HPP tersembunyi" },
  { value: "WAREHOUSE",     label: "Kepala Gudang",        desc: "Stok fisik, batch, transfer — HPP tersembunyi" },
  { value: "PURCHASING",    label: "Staf Pengadaan",       desc: "Purchase order dan penerimaan barang" },
  { value: "SUPER_ADMIN",   label: "Super Admin (Sistem)", desc: "Konfigurasi tenant, master data, user" },
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ORDER_CASHIER",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<{ name?: string; email?: string; role?: string }>(`/users/${userId}`);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          password: "",
          role: res.data.role || "ORDER_CASHIER",
        });
      } catch {
        toast.error("Gagal mengambil data user");
        router.push("/dashboard/users");
      } finally {
        setFetching(false);
      }
    };
    if (userId) void fetchUser();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/users/${userId}`, formData);
      toast.success("Data user berhasil diperbarui");
      router.push("/dashboard/users");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal memperbarui user";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === formData.role);

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-ink-muted text-sm">
        Memuat data user...
      </div>
    );
  }

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
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Edit User</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Perbarui data akun dan hak akses karyawan.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-brand-surface border border-brand-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-line flex items-center gap-2.5">
          <Pencil className="size-4 text-brand-primary" aria-hidden="true" />
          <span className="font-semibold text-sm text-brand-ink-dark">Edit Informasi Akun</span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Nama Lengkap <span className="text-brand-danger">*</span>
            </label>
            <Input
              id="edit-name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama karyawan"
            />
          </div>

          <div>
            <label htmlFor="edit-email" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Alamat Email <span className="text-brand-danger">*</span>
            </label>
            <Input
              id="edit-email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="edit-password" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Password Baru
              <span className="ml-1 text-brand-ink-muted font-normal">(kosongkan jika tidak diganti)</span>
            </label>
            <Input
              id="edit-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label htmlFor="edit-role" className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Peran (Role) <span className="text-brand-danger">*</span>
            </label>
            <select
              id="edit-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg border border-brand-line bg-brand-background text-sm text-brand-ink-dark outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary appearance-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {selectedRole && (
              <p className="mt-1.5 text-xs text-brand-ink-muted">{selectedRole.desc}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-brand-line">
            <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
