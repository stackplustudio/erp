"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, ChevronDown, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Customer { id: string; code: string; name: string; }
interface CashAccount { id: string; name: string; type: string; balance: number; }
interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  paidAmount: number;
  dueDate: string | null;
  createdAt: string;
  paymentStatus: string;
}
interface Allocation { invoiceId: string; invoiceNumber: string; outstanding: number; amount: number; }

export default function FinancePaymentsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [cashAccountId, setCashAccountId] = useState("");
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalAmount = allocations.reduce((s, a) => s + a.amount, 0);

  useEffect(() => {
    const load = async () => {
      const [custRes, cashRes] = await Promise.all([
        api.get<{ data: Customer[] }>("/master/customers"),
        api.get<{ data: CashAccount[] }>("/finance/cash-accounts"),
      ]);
      setCustomers(custRes.data.data || []);
      setCashAccounts(cashRes.data.data || []);
      if (cashRes.data.data?.length > 0) setCashAccountId(cashRes.data.data[0].id);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!customerId) { setUnpaidInvoices([]); setAllocations([]); return; }
    const load = async () => {
      const res = await api.get<{ data: UnpaidInvoice[] }>("/finance/invoices/unpaid", {
        params: { customerId },
      });
      const invs = res.data.data || [];
      setUnpaidInvoices(invs);
      setAllocations(
        invs.map((inv) => ({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          outstanding: Number(inv.grandTotal) - Number(inv.paidAmount),
          amount: 0,
        })),
      );
    };
    void load();
  }, [customerId]);

  const updateAllocation = (idx: number, val: number) => {
    setAllocations((prev) =>
      prev.map((a, i) =>
        i === idx
          ? { ...a, amount: Math.min(val, a.outstanding) }
          : a,
      ),
    );
  };

  const fillAll = () => {
    setAllocations((prev) => prev.map((a) => ({ ...a, amount: a.outstanding })));
  };

  const handleSubmit = async () => {
    if (!customerId || !cashAccountId) {
      toast.error("Pilih pelanggan dan rekening kas");
      return;
    }
    const activeAllocs = allocations.filter((a) => a.amount > 0);
    if (activeAllocs.length === 0) {
      toast.error("Masukkan minimal 1 alokasi pembayaran");
      return;
    }
    setSaving(true);
    try {
      await api.post("/finance/payments", {
        customerId,
        cashAccountId,
        totalAmount,
        notes: notes || undefined,
        allocations: activeAllocs.map((a) => ({ invoiceId: a.invoiceId, amount: a.amount })),
      });
      setSuccess(true);
      toast.success("Pembayaran AR berhasil dicatat!");
      setCustomerId("");
      setCustomerSearch("");
      setAllocations([]);
      setUnpaidInvoices([]);
      setNotes("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mencatat pembayaran");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Pelunasan Piutang (AR Settlement)</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Alokasikan pembayaran dari pelanggan ke satu atau beberapa nota piutang sekaligus
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-brand-success-soft border border-brand-success/30 rounded-xl px-4 py-3">
          <CheckCircle2 className="size-5 text-brand-success" />
          <span className="font-semibold text-brand-success">Pembayaran berhasil dicatat!</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Setup */}
        <div className="space-y-4">
          <div className="bg-brand-surface border border-brand-line rounded-xl p-4 space-y-4">
            {/* Customer */}
            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Pelanggan <span className="text-brand-danger">*</span>
              </label>
              <div className="relative">
                <Input
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                  onFocus={() => setShowCustomerDrop(true)}
                  placeholder="Cari pelanggan..."
                  className="h-9 text-compact bg-brand-surface"
                />
                {showCustomerDrop && customers.filter((c) =>
                  !customerSearch ||
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.code.toLowerCase().includes(customerSearch.toLowerCase())
                ).length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-brand-line rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
                    {customers
                      .filter((c) =>
                        !customerSearch ||
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(customerSearch.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((c) => (
                        <button
                          key={c.id}
                          onMouseDown={() => { setCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerDrop(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-brand-surface-alt text-compact border-b border-brand-line/60 last:border-0"
                        >
                          <span className="font-mono text-[11px] text-brand-primary">{c.code}</span>
                          <span className="ml-2 text-brand-ink-dark">{c.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cash Account */}
            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Rekening / Kas <span className="text-brand-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={cashAccountId}
                  onChange={(e) => setCashAccountId(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  {cashAccounts.map((ca) => (
                    <option key={ca.id} value={ca.id}>
                      {ca.name} (Rp {Number(ca.balance).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 size-4 text-brand-ink-muted pointer-events-none" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">Catatan</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional..." className="h-9 text-compact bg-brand-surface" />
            </div>
          </div>

          {/* Summary Card */}
          {totalAmount > 0 && (
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 space-y-3">
              <div className="text-sm font-bold text-brand-ink-dark">
                Total Bayar: <span className="text-brand-primary">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
              <Button
                onClick={() => void handleSubmit()}
                disabled={saving}
                className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover h-10 rounded-xl font-semibold text-sm"
              >
                {saving ? "Menyimpan..." : "Posting Pembayaran"}
              </Button>
            </div>
          )}
        </div>

        {/* Right: Invoice Allocations */}
        <div className="xl:col-span-2">
          <div className="bg-brand-surface border border-brand-line rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-line bg-brand-surface-alt flex items-center justify-between">
              <h2 className="font-semibold text-brand-ink-dark text-sm">
                Invoice Belum Lunas {unpaidInvoices.length > 0 ? `(${unpaidInvoices.length})` : ""}
              </h2>
              {unpaidInvoices.length > 0 && (
                <button
                  onClick={fillAll}
                  className="text-xs font-semibold text-brand-primary hover:underline"
                >
                  Bayar Semua
                </button>
              )}
            </div>
            {!customerId ? (
              <div className="px-4 py-10 text-center text-brand-ink-muted text-compact">
                Pilih pelanggan untuk melihat invoice yang belum dilunasi
              </div>
            ) : unpaidInvoices.length === 0 ? (
              <div className="px-4 py-10 text-center text-brand-ink-muted text-compact">
                <CheckCircle2 className="size-7 mx-auto mb-2 text-brand-success/60" />
                Semua invoice pelanggan ini sudah lunas
              </div>
            ) : (
              <table className="w-full text-compact border-collapse">
                <thead className="border-b border-brand-line text-brand-ink-dark">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold w-44">No. Invoice</th>
                    <th className="px-4 py-2.5 text-right font-semibold w-36">Grand Total</th>
                    <th className="px-4 py-2.5 text-right font-semibold w-36">Sisa Hutang</th>
                    <th className="px-4 py-2.5 text-right font-semibold w-36">Jumlah Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {allocations.map((alloc, idx) => {
                    const inv = unpaidInvoices.find((i) => i.id === alloc.invoiceId)!;
                    return (
                      <tr key={alloc.invoiceId} className="hover:bg-brand-surface-alt/50 transition-colors">
                        <td className="px-4 py-2.5">
                          <span className="font-mono font-semibold text-brand-primary text-xs">{alloc.invoiceNumber}</span>
                          {inv?.dueDate && (
                            <div className="text-[10px] text-brand-ink-muted tabular-nums">
                              Jatuh tempo: {new Date(inv.dueDate).toLocaleDateString("id-ID")}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-brand-ink-dark">
                          Rp {Number(inv?.grandTotal || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-brand-danger font-semibold">
                          Rp {alloc.outstanding.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2.5">
                          <Input
                            type="number"
                            min={0}
                            max={alloc.outstanding}
                            value={alloc.amount || ""}
                            onChange={(e) => updateAllocation(idx, parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-8 text-right tabular-nums text-compact px-2 ml-auto w-32"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-brand-line bg-brand-surface-alt">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-brand-ink-dark text-right">
                      Total Pembayaran:
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-brand-primary">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
