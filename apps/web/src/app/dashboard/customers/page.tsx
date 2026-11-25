"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, Plus, Users, ShieldAlert, X } from "lucide-react";

interface PriceTier {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  address: string | null;
  priceTier: PriceTier;
  creditTermDays: number;
  creditLimit: number;
  isActive: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [priceTierId, setPriceTierId] = useState("");
  const [creditTermDays, setCreditTermDays] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [custRes, tierRes] = await Promise.all([
        api.get<{ data: Customer[] }>("/customers", {
          params: { search: search || undefined },
        }),
        api.get<PriceTier[]>("/price-tiers"),
      ]);
      setCustomers(custRes.data.data || []);
      setPriceTiers(tierRes.data || []);
      if (tierRes.data.length > 0 && !priceTierId) {
        setPriceTierId(tierRes.data[0].id);
      }
    } catch {
      toast.error("Gagal mengambil data pelanggan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !priceTierId) {
      toast.error("Lengkapi Kode, Nama, dan Level Harga");
      return;
    }

    try {
      await api.post("/customers", {
        code,
        name,
        phone,
        address,
        priceTierId,
        creditTermDays: Number(creditTermDays),
        creditLimit: Number(creditLimit),
      });
      toast.success("Pelanggan berhasil ditambahkan!");
      setIsModalOpen(false);
      setCode("");
      setName("");
      setPhone("");
      setAddress("");
      setCreditLimit(0);
      setCreditTermDays(0);
      void fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan pelanggan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Master Data Pelanggan</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Tingkat harga khusus grosir &amp; kontrol batas kredit tempo pelanggan
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          <span>Tambah Pelanggan</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode pelanggan, nama toko, atau telepon..."
            className="pl-9 h-10 bg-brand-surface"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[700px]">
            <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-28">Kode</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nama Toko / Pelanggan</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36">Kontak / Telepon</th>
                <th scope="col" className="px-4 py-3 font-semibold w-32">Tier Harga</th>
                <th scope="col" className="px-4 py-3 font-semibold w-32 text-center">Tempo</th>
                <th scope="col" className="px-4 py-3 font-semibold w-40 text-right">Plafon Kredit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="size-8 text-brand-ink-muted/40" aria-hidden="true" />
                      <span className="text-sm">Belum ada pelanggan terdaftar.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-brand-primary">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-brand-ink-dark">
                      {c.name}
                      {c.address && <p className="text-xs text-brand-ink-muted font-normal mt-0.5">{c.address}</p>}
                    </td>
                    <td className="px-4 py-3 text-brand-ink font-mono text-xs">{c.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-brand-primary-soft text-brand-primary font-semibold text-xs border border-brand-primary/20">
                        {c.priceTier?.name || "Eceran"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-medium">
                        {c.creditTermDays > 0 ? `${c.creditTermDays} Hari` : "Cash / Tunai"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-brand-ink-dark">
                      {Number(c.creditLimit) > 0 ? (
                        `Rp ${Number(c.creditLimit).toLocaleString("id-ID")}`
                      ) : (
                        <span className="text-brand-ink-muted font-normal">Tanpa Limit</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Tambah Pelanggan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-ink-dark/50 flex items-center justify-center p-4">
          <div className="bg-brand-surface rounded-xl border border-brand-line shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-brand-line">
              <div className="flex items-center gap-2.5">
                <Users className="size-5 text-brand-primary" />
                <h2 className="text-lg font-bold">Tambah Pelanggan Baru</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-brand-ink-muted hover:text-brand-ink-dark"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kode Pelanggan *</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CUST-004"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Nama Toko / Pelanggan *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Toko Maju Terus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nomor Telepon / WA</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Level Harga (Price Tier) *</label>
                  <select
                    value={priceTierId}
                    onChange={(e) => setPriceTierId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-brand-line-strong bg-brand-surface text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  >
                    {priceTiers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Alamat Lengkap</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Pasar Baru No. 12"
                />
              </div>

              {/* Credit Limit & Terms */}
              <div className="p-3.5 bg-brand-surface-alt rounded-lg border border-brand-line space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-ink-dark">
                  <ShieldAlert className="size-4 text-brand-warning" />
                  <span>Kebijakan Limit Piutang (Credit Limit)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-brand-ink-muted mb-1">Tempo Kredit (Hari)</label>
                    <Input
                      type="number"
                      value={creditTermDays}
                      onChange={(e) => setCreditTermDays(Number(e.target.value))}
                      placeholder="0 = Cash, 14, 30"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-brand-ink-muted mb-1">Plafon Maksimal Piutang (Rp)</label>
                    <Input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(Number(e.target.value))}
                      placeholder="Contoh: 10000000"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-brand-line">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan Pelanggan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
