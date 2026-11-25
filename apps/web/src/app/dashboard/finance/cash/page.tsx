"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Wallet, ArrowDownRight, ArrowUpRight, History } from "lucide-react";

interface CashAccount {
  id: string;
  name: string;
  accountNumber: string | null;
  type: string;
  balance: number;
}

interface CashMutation {
  id: string;
  type: "IN" | "OUT";
  amount: number;
  description: string;
  sourceDocType: string;
  sourceDocId: string;
  createdAt: string;
  cashAccount: { name: string; type: string };
}

export default function CashAccountsPage() {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [mutations, setMutations] = useState<CashMutation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, mutRes] = await Promise.all([
        api.get<{ data: CashAccount[] }>("/finance/cash-accounts"),
        api.get<{ data: CashMutation[] }>("/finance/cash-mutations", {
          params: { cashAccountId: selectedAccountId || undefined },
        }),
      ]);
      setAccounts(accRes.data.data || []);
      setMutations(mutRes.data.data || []);
    } catch {
      toast.error("Gagal mengambil data kas & rekening");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [selectedAccountId]);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Buku Kas &amp; Rekening Bank</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Saldo kas tunai toko, rekening bank operasional, dan jurnal mutasi kas
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-brand-ink-muted">Total Saldo Likuid</div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-brand-primary">
            Rp {totalBalance.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isSelected = selectedAccountId === acc.id;
          return (
            <button
              key={acc.id}
              onClick={() => setSelectedAccountId(isSelected ? "" : acc.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-sm"
                  : "border-brand-line bg-brand-surface hover:border-brand-ink-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Wallet className="size-5" />
                </div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-surface-alt border border-brand-line text-brand-ink-dark">
                  {acc.type}
                </span>
              </div>
              <div className="font-bold text-brand-ink-dark text-base">{acc.name}</div>
              {acc.accountNumber && (
                <div className="text-xs font-mono text-brand-ink-muted mt-0.5">
                  No. Rek: {acc.accountNumber}
                </div>
              )}
              <div className="mt-3 text-lg font-black font-mono tabular-nums text-brand-primary">
                Rp {Number(acc.balance).toLocaleString("id-ID")}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cash Mutations Ledger */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-line bg-brand-surface-alt flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-brand-primary" />
            <h2 className="font-semibold text-brand-ink-dark text-sm">
              Mutasi Kas Masuk & Keluar
            </h2>
          </div>
          {selectedAccountId && (
            <button
              onClick={() => setSelectedAccountId("")}
              className="text-xs text-brand-primary font-semibold hover:underline"
            >
              Tampilkan Semua Akun
            </button>
          )}
        </div>

        <table className="w-full text-left text-compact border-collapse">
          <thead className="bg-brand-surface-alt/50 border-b border-brand-line text-brand-ink-dark">
            <tr>
              <th className="px-4 py-2.5 font-semibold w-40">Waktu</th>
              <th className="px-4 py-2.5 font-semibold w-40">Akun Kas</th>
              <th className="px-4 py-2.5 font-semibold w-24">Tipe</th>
              <th className="px-4 py-2.5 font-semibold">Deskripsi Mutasi</th>
              <th className="px-4 py-2.5 font-semibold w-36 text-right">Jumlah</th>
              <th className="px-4 py-2.5 font-semibold w-40">Dokumen Sumber</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-ink-muted">
                  Memuat riwayat mutasi kas...
                </td>
              </tr>
            ) : mutations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-ink-muted">
                  Belum ada catatan mutasi kas.
                </td>
              </tr>
            ) : (
              mutations.map((m) => {
                const isIn = m.type === "IN";
                return (
                  <tr key={m.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-brand-ink-muted tabular-nums">
                      {new Date(m.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-brand-ink-dark">
                      {m.cashAccount.name}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          isIn
                            ? "bg-brand-success-soft text-brand-success border-brand-success/30"
                            : "bg-brand-danger-soft text-brand-danger border-brand-danger/30"
                        }`}
                      >
                        {isIn ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                        {isIn ? "MASUK" : "KELUAR"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-brand-ink-dark">{m.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold">
                      <span className={isIn ? "text-brand-success" : "text-brand-danger"}>
                        {isIn ? "+" : "-"}Rp {Number(m.amount).toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-brand-ink-muted">
                      {m.sourceDocType}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
