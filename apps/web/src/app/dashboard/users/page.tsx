"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

const ROLE_BADGE: Record<string, string> = {
  OWNER:         "bg-brand-primary text-white",
  FINANCE:       "bg-brand-success text-white",
  ORDER_CASHIER: "bg-brand-warning text-white",
  WAREHOUSE:     "bg-brand-info text-white",
  PURCHASING:    "bg-brand-ink-dark text-white",
  SUPER_ADMIN:   "bg-brand-surface-alt text-brand-ink-dark border border-brand-line",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get<{ data?: UserItem[] } | UserItem[]>("/users");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(list);
    } catch {
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await api.get<{ data?: UserItem[] } | UserItem[]>("/users");
        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setUsers(list);
        }
      } catch {
        if (isMounted) toast.error("Gagal mengambil data user");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id: string, name: string | null) => {
    if (confirm(`Yakin ingin menghapus user ${name || id}?`)) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("User berhasil dihapus");
        void fetchUsers();
      } catch {
        toast.error("Gagal menghapus user");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Manajemen User</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Kelola akun karyawan dan hak akses RBAC sistem
          </p>
        </div>
        <Link href="/dashboard/users/create">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" aria-hidden="true" />
            Tambah User
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <table className="w-full text-left text-compact border-collapse">
          <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
              <th scope="col" className="px-4 py-3 font-semibold">Email</th>
              <th scope="col" className="px-4 py-3 font-semibold w-36">Peran (Role)</th>
              <th scope="col" className="px-4 py-3 font-semibold w-28 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                  Memuat data pengguna...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-brand-ink-muted">
                    <Users className="size-8 opacity-30" aria-hidden="true" />
                    <span className="text-sm">Belum ada pengguna terdaftar.</span>
                    <Link href="/dashboard/users/create">
                      <Button size="sm" variant="outline" className="mt-1">Tambah User Pertama</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-brand-ink-dark">
                    {user.name || <span className="text-brand-ink-muted italic">Tanpa nama</span>}
                  </td>
                  <td className="px-4 py-3 text-brand-ink font-mono text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded font-mono ${ROLE_BADGE[user.role] ?? "bg-brand-surface-alt text-brand-ink-dark border border-brand-line"}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/dashboard/users/edit/${user.id}`}>
                        <Button variant="outline" size="icon-sm" aria-label={`Edit user ${user.name}`}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => void handleDelete(user.id, user.name)}
                        aria-label={`Hapus user ${user.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
