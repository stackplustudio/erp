"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, FileText, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  grandTotal: number;
  paidAmount: number;
  dueDate: string | null;
  createdAt: string;
  isVoid: boolean;
  customer: { name: string; code: string };
  warehouse: { code: string };
  items: Array<{ id: string }>;
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  UNPAID: { label: "Belum Bayar", className: "bg-brand-danger-soft text-brand-danger border-brand-danger/30", icon: XCircle },
  PARTIAL: { label: "Sebagian", className: "bg-brand-warning-soft text-brand-warning border-brand-warning/30", icon: AlertTriangle },
  PAID: { label: "Lunas", className: "bg-brand-success-soft text-brand-success border-brand-success/20", icon: CheckCircle2 },
};

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get<{ data: SalesInvoice[]; meta: typeof meta }>("/sales/invoices", {
        params: { page, search: search || undefined },
      });
      setInvoices(res.data.data || []);
      setMeta(res.data.meta);
    } catch {
      toast.error("Gagal mengambil daftar invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => void fetchInvoices(1), 200);
    return () => clearTimeout(t);
  }, [search]);

  const totalUnpaid = invoices.filter((i) => i.paymentStatus === "UNPAID" && !i.isVoid).reduce((s, i) => s + (Number(i.grandTotal) - Number(i.paidAmount)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Daftar Invoice Penjualan</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            {meta.total} total invoice · Piutang belum lunas:{" "}
            <span className="font-semibold text-brand-danger">Rp {totalUnpaid.toLocaleString("id-ID")}</span>
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor invoice atau nama pelanggan..."
          className="pl-9 h-10 bg-brand-surface"
        />
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[700px]">
            <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-44">No. Invoice</th>
                <th scope="col" className="px-4 py-3 font-semibold">Pelanggan</th>
                <th scope="col" className="px-4 py-3 font-semibold w-24">Gudang</th>
                <th scope="col" className="px-4 py-3 font-semibold w-28">Metode</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36 text-right">Grand Total</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36 text-right">Sisa Hutang</th>
                <th scope="col" className="px-4 py-3 font-semibold w-28 text-center">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold w-32">Tgl Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                    Memuat daftar invoice...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-brand-ink-muted">
                    <FileText className="size-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                    <span>Belum ada data invoice penjualan.</span>
                  </td>
                </tr>
              ) : (
              invoices.map((inv) => {
                const outstanding = Number(inv.grandTotal) - Number(inv.paidAmount);
                const sc = statusConfig[inv.paymentStatus] ?? statusConfig.UNPAID;
                const StatusIcon = sc.icon;
                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-brand-surface-alt/60 transition-colors ${inv.isVoid ? "opacity-50 line-through" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-brand-primary text-xs">
                        {inv.invoiceNumber}
                      </span>
                      {inv.isVoid && (
                        <span className="ml-1 text-[10px] text-brand-danger font-bold">[VOID]</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-ink-dark">{inv.customer.name}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-ink-dark">
                      {inv.warehouse.code}
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-ink-muted">{inv.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-brand-ink-dark">
                      Rp {Number(inv.grandTotal).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {outstanding > 0 ? (
                        <span className="text-brand-danger font-semibold">
                          Rp {outstanding.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-brand-success">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${sc.className}`}>
                        <StatusIcon className="size-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-ink-muted tabular-nums">
                      {new Date(inv.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => void fetchInvoices(p)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                p === meta.page
                  ? "bg-brand-primary text-white"
                  : "bg-brand-surface-alt border border-brand-line text-brand-ink hover:bg-brand-line/60"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
