"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, Scale } from "lucide-react";

interface ProfitLossData {
  period: { startDate: string | null; endDate: string | null };
  revenue: { salesRevenue: number; totalRevenue: number };
  costOfGoodsSold: { cogs: number; totalCogs: number };
  grossProfit: number;
  operatingExpenses: {
    totalExpenses: number;
    breakdown: Array<{
      description: string;
      amount: number;
      account: string;
      date: string;
    }>;
  };
  netProfit: number;
  netMarginPercent: number;
}

export default function ProfitLossPage() {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get<ProfitLossData>("/reports/profit-loss", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setData(res.data);
    } catch {
      toast.error("Gagal mengambil laporan Laba Rugi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [startDate, endDate]);

  const isNetPositive = (data?.netProfit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Laporan Laba Rugi (P&amp;L Summary)</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Ikhtisar pendapatan penjualan, beban pokok penjualan (HPP), dan beban operasional
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-36 bg-brand-surface text-compact"
          />
          <span className="text-xs text-brand-ink-muted">s/d</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-36 bg-brand-surface text-compact"
          />
        </div>
      </div>

      {/* Main Income Statement Table */}
      <div className="max-w-3xl bg-brand-surface rounded-2xl border border-brand-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-line bg-brand-surface-alt flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-brand-primary" />
            <h2 className="font-bold text-brand-ink-dark text-base">Laporan Laba Rugi Komprehensif</h2>
          </div>
          <span className="text-xs font-mono text-brand-ink-muted">
            Mata Uang: IDR (Rupiah)
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-brand-ink-muted text-compact">
            Menghitung ringkasan laba rugi...
          </div>
        ) : !data ? (
          <div className="px-6 py-12 text-center text-brand-ink-muted text-compact">
            Tidak ada data tersedia.
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* 1. Pendapatan */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                1. Pendapatan Usaha (Revenue)
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 rounded-lg hover:bg-brand-surface-alt/50">
                <span className="text-compact text-brand-ink-dark">Penjualan Barang Dagang</span>
                <span className="font-mono tabular-nums font-semibold text-brand-ink-dark">
                  Rp {data.revenue.salesRevenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-brand-surface-alt rounded-lg font-bold">
                <span className="text-compact text-brand-ink-dark">Total Pendapatan Usaha</span>
                <span className="font-mono tabular-nums text-brand-ink-dark">
                  Rp {data.revenue.totalRevenue.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* 2. HPP */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                2. Beban Pokok Penjualan (COGS)
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 rounded-lg hover:bg-brand-surface-alt/50">
                <span className="text-compact text-brand-ink-dark">Beban Pokok Barang (Moving Average)</span>
                <span className="font-mono tabular-nums font-semibold text-brand-danger">
                  (Rp {data.costOfGoodsSold.cogs.toLocaleString("id-ID")})
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-brand-surface-alt rounded-lg font-bold">
                <span className="text-compact text-brand-ink-dark">Total Beban Pokok</span>
                <span className="font-mono tabular-nums text-brand-danger">
                  (Rp {data.costOfGoodsSold.totalCogs.toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            {/* Subtotal: Laba Kotor */}
            <div className="flex justify-between items-center py-3 px-4 bg-brand-primary-soft border border-brand-primary/20 rounded-xl font-bold">
              <span className="text-sm text-brand-primary">Laba Kotor (Gross Profit)</span>
              <span className="font-mono text-base tabular-nums text-brand-primary font-black">
                Rp {data.grossProfit.toLocaleString("id-ID")}
              </span>
            </div>

            {/* 3. Beban Operasional */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                3. Beban Operasional (Operating Expenses)
              </div>
              {data.operatingExpenses.breakdown.length === 0 ? (
                <div className="text-compact text-brand-ink-muted px-3 py-1">
                  Tidak ada catatan beban kas keluar operasional pada periode ini.
                </div>
              ) : (
                data.operatingExpenses.breakdown.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1.5 px-3 rounded-lg hover:bg-brand-surface-alt/50"
                  >
                    <span className="text-compact text-brand-ink-dark">{e.description}</span>
                    <span className="font-mono tabular-nums text-brand-danger">
                      (Rp {e.amount.toLocaleString("id-ID")})
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-2 px-3 bg-brand-surface-alt rounded-lg font-bold">
                <span className="text-compact text-brand-ink-dark">Total Beban Operasional</span>
                <span className="font-mono tabular-nums text-brand-danger">
                  (Rp {data.operatingExpenses.totalExpenses.toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            {/* Final: Laba Bersih */}
            <div
              className={`flex justify-between items-center py-4 px-5 rounded-2xl border-2 ${
                isNetPositive
                  ? "bg-brand-success-soft border-brand-success/40 text-brand-success"
                  : "bg-brand-danger-soft border-brand-danger/40 text-brand-danger"
              }`}
            >
              <div>
                <div className="font-black text-lg">
                  {isNetPositive ? "LABA BERSIH (NET PROFIT)" : "RUGI BERSIH (NET LOSS)"}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  Margin Bersih: {data.netMarginPercent}%
                </div>
              </div>
              <div className="text-2xl font-black font-mono tabular-nums">
                Rp {data.netProfit.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
