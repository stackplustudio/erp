"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, Boxes, ArrowUpDown, AlertTriangle, History } from "lucide-react";

interface StockItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productSku: string;
  productName: string;
  baseUnitName: string;
  batchNumber: string | null;
  expiredDate: string | null;
  qtyBase: number;
  multiUomFormatted: string;
  minStockAlert: number;
  isLowStock: boolean;
  avgCostPerBase?: number;
  totalInventoryValue?: number;
}

interface MovementItem {
  id: string;
  type: string;
  qtyBase: number;
  unitCost?: number;
  sourceDocType: string;
  sourceDocId: string;
  notes: string | null;
  createdAt: string;
  product: { sku: string; name: string; baseUnitName: string };
  warehouse: { code: string; name: string };
  batch: { batchNumber: string; expiredDate: string } | null;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"stocks" | "movements">("stocks");
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: StockItem[] }>("/inventory/stocks", {
        params: { search: search || undefined },
      });
      setStocks(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil data stok gudang");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: MovementItem[] }>("/inventory/movements");
      setMovements(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil mutasi stok");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "stocks") {
      const timer = setTimeout(() => {
        void fetchStocks();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      void fetchMovements();
    }
  }, [activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Manajemen Persediaan &amp; HPP</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Saldo stok fisik multi-satuan dan ledger mutasi persediaan barang
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-brand-line bg-brand-surface p-1">
          <button
            onClick={() => setActiveTab("stocks")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "stocks"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-ink hover:text-brand-ink-dark"
            }`}
          >
            <Boxes className="size-3.5" />
            <span>Saldo Stok Fisik</span>
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "movements"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-ink hover:text-brand-ink-dark"
            }`}
          >
            <History className="size-3.5" />
            <span>Jurnal Mutasi Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {activeTab === "stocks" && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari SKU atau nama produk di gudang..."
              className="pl-9 h-10 bg-brand-surface"
            />
          </div>
        </div>
      )}

      {/* Tab 1: Saldo Stok Fisik */}
      {activeTab === "stocks" && (
        <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-compact border-collapse min-w-[800px]">
              <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-24">Gudang</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-28">SKU</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nama Produk</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Format Pecahan Multi-Satuan</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-28 text-right">Stok Dasar</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-32 text-right">HPP Rata-Rata</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-36 text-right">Nilai Total</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                      Memuat saldo stok persediaan...
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                      Tidak ada data stok ditemukan.
                    </td>
                  </tr>
                ) : (
                  stocks.map((s) => (
                    <tr key={s.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-surface-alt border border-brand-line font-bold text-brand-ink-dark">
                          {s.warehouseCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-brand-primary">{s.productSku}</td>
                      <td className="px-4 py-3 font-medium text-brand-ink-dark">
                        {s.productName}
                        {s.batchNumber && (
                          <span className="ml-2 font-mono text-[11px] text-brand-ink-muted bg-brand-surface-alt px-1.5 py-0.5 rounded">
                            Batch: {s.batchNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-brand-ink-dark bg-brand-primary-soft/60 px-2 py-0.5 rounded text-xs">
                          {s.multiUomFormatted}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-brand-ink-dark">
                        {s.qtyBase.toLocaleString("id-ID")} {s.baseUnitName}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-brand-ink">
                        {s.avgCostPerBase !== undefined
                          ? `Rp ${Math.round(s.avgCostPerBase).toLocaleString("id-ID")}`
                          : "Masked"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-brand-primary">
                        {s.totalInventoryValue !== undefined
                          ? `Rp ${s.totalInventoryValue.toLocaleString("id-ID")}`
                          : "Masked"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-warning bg-brand-warning-soft px-2 py-0.5 rounded border border-brand-warning/30">
                            <AlertTriangle className="size-3" />
                            <span>Kritis</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-brand-success bg-brand-success-soft px-2 py-0.5 rounded border border-brand-success/20">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Jurnal Mutasi Stok */}
      {activeTab === "movements" && (
        <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-compact border-collapse min-w-[750px]">
              <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-36">Waktu Mutasi</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-24">Gudang</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-32">Jenis Mutasi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Produk</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-32 text-right">Kuantitas (+/-)</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-32 text-right">HPP Snapshot</th>
                  <th scope="col" className="px-4 py-3 font-semibold w-40">Dokumen Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                      Memuat riwayat mutasi...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                      Belum ada riwayat mutasi stok.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.qtyBase > 0;
                    return (
                      <tr key={m.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                        <td className="px-4 py-3 text-brand-ink-muted text-xs">
                          {new Date(m.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{m.warehouse.code}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-surface-alt text-brand-ink-dark border border-brand-line">
                            {m.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-brand-ink-dark">
                          {m.product.name} ({m.product.sku})
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">
                          <span className={isPositive ? "text-brand-success" : "text-brand-danger"}>
                            {isPositive ? `+${m.qtyBase}` : m.qtyBase} {m.product.baseUnitName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-brand-ink">
                          {m.unitCost !== undefined ? `Rp ${Math.round(m.unitCost).toLocaleString("id-ID")}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-brand-ink-muted text-xs font-mono">
                          {m.sourceDocType} · {m.sourceDocId}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
