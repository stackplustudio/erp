"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { CalendarClock, AlertCircle, FileSpreadsheet, ShieldAlert } from "lucide-react";

interface AgingInvoice {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  creditLimit: number;
  grandTotal: number;
  paidAmount: number;
  outstanding: number;
  dueDate: string | null;
  overdueDays: number;
}

interface AgingBucket {
  label: string;
  invoices: AgingInvoice[];
  total: number;
}

interface AgingData {
  buckets: {
    current: AgingBucket;
    days1to30: AgingBucket;
    days31to60: AgingBucket;
    days61plus: AgingBucket;
  };
  grandTotal: number;
  invoiceCount: number;
}

export default function AgingReportPage() {
  const [data, setData] = useState<AgingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<keyof AgingData["buckets"] | "all">("all");

  const fetchAging = async () => {
    try {
      setLoading(true);
      const res = await api.get<AgingData>("/finance/aging");
      setData(res.data);
    } catch {
      toast.error("Gagal mengambil laporan AR Aging");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAging();
  }, []);

  const bucketKeys: Array<{ key: keyof AgingData["buckets"]; badgeColor: string; title: string }> = [
    { key: "current", badgeColor: "bg-brand-success-soft text-brand-success border-brand-success/30", title: "Belum Jatuh Tempo" },
    { key: "days1to30", badgeColor: "bg-brand-info-soft text-brand-info border-brand-info/30", title: "1 — 30 Hari" },
    { key: "days31to60", badgeColor: "bg-brand-warning-soft text-brand-warning border-brand-warning/30", title: "31 — 60 Hari" },
    { key: "days61plus", badgeColor: "bg-brand-danger-soft text-brand-danger border-brand-danger/30", title: ">60 Hari (Kritis)" },
  ];

  const displayedInvoices: Array<AgingInvoice & { bucketLabel: string }> = [];
  if (data) {
    bucketKeys.forEach(({ key }) => {
      if (selectedBucket === "all" || selectedBucket === key) {
        data.buckets[key].invoices.forEach((inv) => {
          displayedInvoices.push({ ...inv, bucketLabel: data.buckets[key].label });
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Laporan Umur Piutang (AR Aging)</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Klasifikasi umur piutang per pelanggan: Belum jatuh tempo, 1–30 hari, 31–60 hari, &gt;60 hari
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-brand-ink-muted">Total Seluruh Piutang</div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-brand-danger">
            Rp {(data?.grandTotal || 0).toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bucketKeys.map(({ key, badgeColor, title }) => {
          const bucket = data?.buckets[key];
          const isSelected = selectedBucket === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedBucket(isSelected ? "all" : key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-sm"
                  : "border-brand-line bg-brand-surface hover:border-brand-ink-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                  {title}
                </span>
                <span className="text-xs text-brand-ink-muted">
                  {bucket?.invoices.length || 0} inv
                </span>
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-brand-ink-dark">
                Rp {(bucket?.total || 0).toLocaleString("id-ID")}
              </div>
            </button>
          );
        })}
      </div>

      {/* Invoice Details Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-line bg-brand-surface-alt flex items-center justify-between">
          <h2 className="font-semibold text-brand-ink-dark text-sm">
            Rincian Invoice Piutang {selectedBucket !== "all" ? `(${data?.buckets[selectedBucket].label})` : "(Semua)"}
          </h2>
          {selectedBucket !== "all" && (
            <button
              onClick={() => setSelectedBucket("all")}
              className="text-xs text-brand-primary font-semibold hover:underline"
            >
              Tampilkan Semua
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[700px]">
          <thead className="bg-brand-surface-alt/50 border-b border-brand-line text-brand-ink-dark">
            <tr>
              <th className="px-4 py-2.5 font-semibold w-40">No. Invoice</th>
              <th className="px-4 py-2.5 font-semibold">Pelanggan</th>
              <th className="px-4 py-2.5 font-semibold w-32">Kategori Umur</th>
              <th className="px-4 py-2.5 font-semibold w-32">Tgl Jatuh Tempo</th>
              <th className="px-4 py-2.5 font-semibold w-24 text-right">Terlambat</th>
              <th className="px-4 py-2.5 font-semibold w-36 text-right">Grand Total</th>
              <th className="px-4 py-2.5 font-semibold w-36 text-right">Sisa Piutang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-ink-muted">
                  Memuat data AR Aging...
                </td>
              </tr>
            ) : displayedInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-ink-muted">
                  Tidak ada invoice yang memenuhi kriteria umur ini.
                </td>
              </tr>
            ) : (
              displayedInvoices.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-brand-surface-alt/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-semibold text-brand-primary text-xs">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-brand-ink-dark">{inv.customerName}</div>
                    <div className="text-[11px] text-brand-ink-muted font-mono">{inv.customerCode}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-surface-alt border border-brand-line text-brand-ink-dark">
                      {inv.bucketLabel}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-brand-ink-muted tabular-nums">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    {inv.overdueDays > 0 ? (
                      <span className="text-brand-danger font-semibold">
                        +{inv.overdueDays}h
                      </span>
                    ) : (
                      <span className="text-brand-success">Aman</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-brand-ink-dark">
                    Rp {inv.grandTotal.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold text-brand-danger">
                    Rp {inv.outstanding.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
