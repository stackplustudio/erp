"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, Plus, Truck, X } from "lucide-react";

interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  paymentTermDays: number;
  isActive: boolean;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [paymentTermDays, setPaymentTermDays] = useState(30);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Supplier[] }>("/suppliers", {
        params: { search: search || undefined },
      });
      setSuppliers(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil data supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSuppliers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error("Lengkapi Kode dan Nama Supplier");
      return;
    }

    try {
      await api.post("/suppliers", {
        code,
        name,
        phone,
        address,
        contactPerson,
        paymentTermDays: Number(paymentTermDays),
      });
      toast.success("Supplier berhasil ditambahkan!");
      setIsModalOpen(false);
      setCode("");
      setName("");
      setPhone("");
      setAddress("");
      setContactPerson("");
      void fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan supplier");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Master Data Supplier</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Daftar prinsipal &amp; pemasok barang pengadaan (Purchasing)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          <span>Tambah Supplier</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama supplier..."
            className="pl-9 h-10 bg-brand-surface"
          />
        </div>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[650px]">
            <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-28">Kode</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nama Perusahaan / Supplier</th>
                <th scope="col" className="px-4 py-3 font-semibold w-40">Kontak Person</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36">Telepon</th>
                <th scope="col" className="px-4 py-3 font-semibold w-32 text-center">Tempo Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                    Memuat data supplier...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-brand-ink-muted">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="size-8 text-brand-ink-muted/40" aria-hidden="true" />
                      <span className="text-sm">Belum ada data supplier terdaftar.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-brand-primary">{s.code}</td>
                    <td className="px-4 py-3 font-medium text-brand-ink-dark">
                      {s.name}
                      {s.address && <p className="text-xs text-brand-ink-muted font-normal mt-0.5">{s.address}</p>}
                    </td>
                    <td className="px-4 py-3 text-brand-ink">{s.contactPerson || "-"}</td>
                    <td className="px-4 py-3 text-brand-ink font-mono text-xs">{s.phone || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-semibold text-brand-ink-dark">
                        {s.paymentTermDays} Hari
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-ink-dark/50 flex items-center justify-center p-4">
          <div className="bg-brand-surface rounded-xl border border-brand-line shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-brand-line">
              <div className="flex items-center gap-2.5">
                <Truck className="size-5 text-brand-primary" />
                <h2 className="text-lg font-bold">Tambah Supplier Baru</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-ink-muted hover:text-brand-ink-dark">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kode Supplier *</label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUPP-003" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Nama Supplier *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="PT ABC Sukses" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kontak Person (PIC)</label>
                  <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Bpk. Anton" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Telepon / Fax</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="021-..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Alamat Kantor / Pabrik</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kawasan Industri..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tempo Pembayaran (Hari)</label>
                  <Input
                    type="number"
                    value={paymentTermDays}
                    onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-brand-line">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan Supplier</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
