"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, Package2, AlertTriangle, CalendarClock } from "lucide-react";

interface BatchItem {
  id: string;
  batchNumber: string;
  expiredDate: string;
  daysUntilExpired: number;
  productId: string;
  productName: string;
  productSku: string;
  stocks: Array<{
    warehouseId: string;
    warehouseCode: string;
    qtyBase: number;
  }>;
}

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-brand-danger px-2 py-0.5 rounded border border-brand-danger">
        <AlertTriangle className="size-3" />
        Kadaluarsa {Math.abs(days)}h lalu
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-danger bg-brand-danger-soft px-2 py-0.5 rounded border border-brand-danger/30">
        <AlertTriangle className="size-3" />
        {days} hari lagi
      </span>
    );
  }
  if (days <= 90) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-warning bg-brand-warning-soft px-2 py-0.5 rounded border border-brand-warning/30">
        <CalendarClock className="size-3" />
        {days} hari lagi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-success bg-brand-success-soft px-2 py-0.5 rounded border border-brand-success/20">
      {days} hari lagi
    </span>
  );
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: BatchItem[] }>("/inventory/batches", {
        params: { search: search || undefined },
      });
      setBatches(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil data batch FEFO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBatches();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const expiredCount = batches.filter((b) => b.daysUntilExpired < 0).length;
  const criticalCount = batches.filter(
    (b) => b.daysUntilExpired >= 0 && b.daysUntilExpired <= 30,
  ).length;
  const warningCount = batches.filter(
    (b) => b.daysUntilExpired > 30 && b.daysUntilExpired <= 90,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Manajemen Batch &amp; Kedaluwarsa</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Prioritas pengeluaran stok otomatis (FEFO) untuk mencegah barang kedaluwarsa di gudang
          </p>
        </div>

        {/* Summary Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {expiredCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-danger px-3 py-1.5 rounded-lg">
              <AlertTriangle className="size-3.5" />
              {expiredCount} Kadaluarsa
            </span>
          )}
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-danger bg-brand-danger-soft border border-brand-danger/30 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="size-3.5" />
              {criticalCount} Kritis &lt;30h
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-warning bg-brand-warning-soft border border-brand-warning/30 px-3 py-1.5 rounded-lg">
              <CalendarClock className="size-3.5" />
              {warningCount} Perlu Perhatian &lt;90h
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari SKU, nama produk, atau nomor batch..."
            className="pl-9 h-10 bg-brand-surface"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[650px]">
            <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-28">SKU</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nama Produk</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36">No. Batch</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36">Tgl Kedaluwarsa</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36">Sisa Waktu</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stok Per Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                    Memuat data nomor batch gudang...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted">
                    <div className="flex flex-col items-center gap-2">
                      <Package2 className="size-8 text-brand-ink-muted/40" aria-hidden="true" />
                      <span className="text-sm">Belum ada data batch ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const isExpired = b.daysUntilExpired < 0;
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-brand-surface-alt/50 transition-colors ${isExpired ? "bg-brand-danger-soft/30" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-brand-primary text-xs">
                        {b.productSku}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-ink-dark">
                        {b.productName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-surface-alt border border-brand-line font-semibold text-brand-ink-dark">
                          {b.batchNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums text-brand-ink">
                        {new Date(b.expiredDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <ExpiryBadge days={b.daysUntilExpired} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {b.stocks.map((s) => (
                            <span
                              key={s.warehouseId}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-surface-alt border border-brand-line rounded-md px-2 py-0.5"
                            >
                              <span className="font-mono text-brand-primary">
                                {s.warehouseCode}
                              </span>
                              <span className="text-brand-ink-dark font-mono">
                                : {s.qtyBase.toLocaleString("id-ID")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
