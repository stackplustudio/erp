"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Truck, ArrowRight, ChevronDown, CheckCircle2 } from "lucide-react";

interface Warehouse { id: string; name: string; code: string; }
interface Product { id: string; name: string; sku: string; }

export default function WarehouseTransfersPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [destWarehouseId, setDestWarehouseId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [wRes, pRes] = await Promise.all([
        api.get<{ data: Warehouse[] }>("/master/warehouses"),
        api.get<{ data: Product[] }>("/master/products"),
      ]);
      setWarehouses(wRes.data.data || []);
      setProducts(pRes.data.data || []);
      if (wRes.data.data?.length >= 2) {
        setSourceWarehouseId(wRes.data.data[0].id);
        setDestWarehouseId(wRes.data.data[1].id);
      }
    };
    void load();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destWarehouseId) {
      toast.error("Gudang asal dan tujuan tidak boleh sama");
      return;
    }
    if (!productId || qty <= 0) {
      toast.error("Pilih produk dan masukkan kuantitas yang valid");
      return;
    }
    setSaving(true);
    try {
      await api.post("/inventory/transfer", {
        sourceWarehouseId,
        destinationWarehouseId: destWarehouseId,
        productId,
        qtyBase: qty,
        notes: notes || undefined,
      });
      toast.success("Transfer stok antar gudang berhasil dibukukan!");
      setQty(1);
      setNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mentransfer stok");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Transfer Stok Antar Gudang</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Pindahkan saldo stok antar lokasi gudang fisik dengan ledger mutasi otomatis
        </p>
      </div>

      <div className="max-w-2xl bg-brand-surface rounded-2xl border border-brand-line p-6 shadow-sm">
        <form onSubmit={handleTransfer} className="space-y-5">
          {/* Gudang Asal -> Gudang Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Gudang Asal (Keluar) <span className="text-brand-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
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

            <div className="flex justify-center sm:col-span-1 pt-4 sm:pt-0">
              <div className="w-8 h-8 rounded-full bg-brand-surface-alt border border-brand-line flex items-center justify-center text-brand-ink-muted">
                <ArrowRight className="size-4" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Gudang Tujuan (Masuk) <span className="text-brand-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
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

          {/* Produk & Qty */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Produk <span className="text-brand-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 size-4 text-brand-ink-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Jumlah Satuan Dasar <span className="text-brand-danger">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-10 text-right tabular-nums font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
              Catatan Transfer
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pemenuhan stok gudang cabang..."
              className="h-10 bg-brand-surface"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <Truck className="size-4" />
            {saving ? "Memproses Transfer..." : "Eksekusi Transfer Stok"}
          </Button>
        </form>
      </div>
    </div>
  );
}
