"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { TrendingUp, FileSpreadsheet, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ReportItem {
  id: string;
  invoiceNumber: string;
  customerCode: string;
  customerName: string;
  createdAt: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
  items: Array<{
    productSku: string;
    productName: string;
    unitName: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
    cogsPerBase: number;
    itemCogs: number;
    itemProfit: number;
    itemMarginPercent: number;
  }>;
}

interface ReportSummary {
  totalRevenue: number;
  totalCogs: number;
  totalGrossProfit: number;
  overallMarginPercent: number;
  invoiceCount: number;
}

export default function GrossProfitReportPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [invoices, setInvoices] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ summary: ReportSummary; data: ReportItem[] }>(
        "/reports/gross-profit",
        {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        },
      );
      setSummary(res.data.summary);
      setInvoices(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil laporan Laba Kotor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReport();
  }, [startDate, endDate]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Laba Kotor per Faktur</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Analisis profitabilitas penjualan per faktur &amp; item barang (Pendapatan vs HPP Moving Average)
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-36 bg-brand-surface text-compact"
            placeholder="Dari tanggal"
          />
          <span className="text-xs text-brand-ink-muted">s/d</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-36 bg-brand-surface text-compact"
            placeholder="Sampai tanggal"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-brand-line bg-brand-surface">
          <div className="text-xs text-brand-ink-muted mb-1">Total Pendapatan (Omzet)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-brand-ink-dark">
            Rp {(summary?.totalRevenue || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-brand-ink-muted mt-1">
            {summary?.invoiceCount || 0} Faktur Penjualan
          </div>
        </div>

        <div className="p-4 rounded-xl border border-brand-line bg-brand-surface">
          <div className="text-xs text-brand-ink-muted mb-1">Total Beban Pokok (HPP)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-brand-ink-dark">
            Rp {(summary?.totalCogs || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-brand-ink-muted mt-1">Moving Average Real-time</div>
        </div>

        <div className="p-4 rounded-xl border border-brand-primary/30 bg-brand-primary-soft">
          <div className="text-xs text-brand-primary font-semibold mb-1">Total Laba Kotor</div>
          <div className="text-xl font-black font-mono tabular-nums text-brand-primary">
            Rp {(summary?.totalGrossProfit || 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-brand-primary/80 mt-1">Omzet dikurangi HPP</div>
        </div>

        <div className="p-4 rounded-xl border border-brand-line bg-brand-surface">
          <div className="text-xs text-brand-ink-muted mb-1">Margin Rata-Rata</div>
          <div className="text-xl font-bold font-mono tabular-nums text-brand-success">
            {summary?.overallMarginPercent || 0}%
          </div>
          <div className="text-[11px] text-brand-ink-muted mt-1">Persentase Margin Kotor</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[750px]">
          <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3 font-semibold w-40">No. Faktur</th>
              <th className="px-4 py-3 font-semibold">Pelanggan</th>
              <th className="px-4 py-3 font-semibold w-32">Tanggal</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">Pendapatan</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">HPP</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">Laba Kotor</th>
              <th className="px-4 py-3 font-semibold w-24 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-brand-ink-muted">
                  Menghitung laba kotor per faktur...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-brand-ink-muted">
                  Tidak ada faktur dalam rentang tanggal yang dipilih.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const isExpanded = expandedId === inv.id;
                return (
                  <div key={inv.id} style={{ display: "contents" }}>
                    <tr
                      onClick={() => toggleExpand(inv.id)}
                      className="hover:bg-brand-surface-alt/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-brand-ink-muted">
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-brand-primary" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-brand-primary text-xs">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-ink-dark">
                        {inv.customerName}
                        <span className="ml-2 font-mono text-[11px] text-brand-ink-muted">
                          ({inv.customerCode})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-ink-muted tabular-nums">
                        {new Date(inv.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-brand-ink-dark">
                        Rp {inv.revenue.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-brand-ink">
                        Rp {inv.cogs.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-brand-primary">
                        Rp {inv.grossProfit.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-brand-success">
                        {inv.marginPercent}%
                      </td>
                    </tr>

                    {/* Expand Detail Items */}
                    {isExpanded && (
                      <tr className="bg-brand-surface-alt/40">
                        <td colSpan={8} className="px-8 py-3">
                          <div className="border border-brand-line/80 rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-[12px] border-collapse">
                              <thead className="bg-brand-surface-alt text-brand-ink-muted">
                                <tr>
                                  <th className="px-3 py-1.5 text-left font-semibold">SKU & Produk</th>
                                  <th className="px-3 py-1.5 text-right font-semibold w-24">Qty</th>
                                  <th className="px-3 py-1.5 text-right font-semibold w-28">Harga Jual</th>
                                  <th className="px-3 py-1.5 text-right font-semibold w-28">Line Total</th>
                                  <th className="px-3 py-1.5 text-right font-semibold w-28">HPP Total</th>
                                  <th className="px-3 py-1.5 text-right font-semibold w-28">Laba Item</th>
                                  <th className="px-3 py-1.5 text-right font-semibold w-20">Margin</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-line/60">
                                {inv.items.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-brand-surface-alt/30">
                                    <td className="px-3 py-1.5 text-brand-ink-dark">
                                      <span className="font-mono text-brand-primary mr-2">
                                        {it.productSku}
                                      </span>
                                      {it.productName} ({it.unitName})
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                                      {it.qty} {it.unitName}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                                      Rp {it.unitPrice.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                                      Rp {it.lineTotal.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums text-brand-ink-muted">
                                      Rp {Math.round(it.itemCogs).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums font-semibold text-brand-primary">
                                      Rp {Math.round(it.itemProfit).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono tabular-nums font-bold text-brand-success">
                                      {it.itemMarginPercent}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </div>
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
