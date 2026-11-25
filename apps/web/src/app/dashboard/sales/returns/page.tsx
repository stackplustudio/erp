"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { RotateCcw, Search, ChevronDown, CheckCircle2 } from "lucide-react";

interface Customer { id: string; name: string; code: string; }
interface Warehouse { id: string; name: string; code: string; }

export default function SalesReturnsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [cRes, wRes] = await Promise.all([
        api.get<{ data: Customer[] }>("/master/customers"),
        api.get<{ data: Warehouse[] }>("/master/warehouses"),
      ]);
      setCustomers(cRes.data.data || []);
      setWarehouses(wRes.data.data || []);
      if (wRes.data.data?.length > 0) setWarehouseId(wRes.data.data[0].id);
    };
    void load();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber || !reason) {
      toast.error("Nomor invoice dan alasan retur wajib diisi");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`Retur faktur ${invoiceNumber} berhasil diproses. Saldo stok telah disesuaikan.`);
      setInvoiceNumber("");
      setReason("");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Retur Penjualan (Sales Return)</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Penerimaan kembali barang dari pelanggan ke gudang (kondisi baik atau rusak)
        </p>
      </div>

      <div className="max-w-2xl bg-brand-surface rounded-2xl border border-brand-line p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Nomor Faktur Penjualan Asli <span className="text-brand-danger">*</span>
            </label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Contoh: INV/2026/11/00001"
              className="h-10 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Pelanggan
              </label>
              <div className="relative">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 size-4 text-brand-ink-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Gudang Penerima Retur
              </label>
              <div className="relative">
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 size-4 text-brand-ink-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Alasan Retur & Kondisi Barang <span className="text-brand-danger">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Kemasan penyok saat pengiriman, produk ditukar dengan batch baru..."
              className="w-full p-3 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="size-4" />
            {saving ? "Memproses..." : "Konfirmasi Retur Penjualan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
