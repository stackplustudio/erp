"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { PackageCheck, ChevronDown, X, AlertTriangle } from "lucide-react";

interface PoItem {
  id: string;
  productUnit: {
    unitName: string;
    factorToBase: number;
    product: { name: string; sku: string };
  };
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
}
interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  supplier: { name: string };
  warehouse: { code: string; name: string };
  items: PoItem[];
}

interface ReceiptItem {
  poItemId: string;
  productName: string;
  unitName: string;
  qtyOrdered: number;
  qtyReceived: number;
  qtyToReceive: number;
  batchNumber: string;
  expiredDate: string;
}

export default function PurchasingReceiptsPage() {
  const [openOrders, setOpenOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchOpenOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: PurchaseOrder[] }>("/purchasing/orders", {
        params: { status: "ORDERED" },
      });
      setOpenOrders(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil daftar PO yang menunggu penerimaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOpenOrders();
  }, []);

  const selectPo = (po: PurchaseOrder) => {
    setSelectedPo(po);
    setReceiptItems(
      po.items.map((item) => ({
        poItemId: item.id,
        productName: item.productUnit.product.name,
        unitName: item.productUnit.unitName,
        qtyOrdered: item.qtyOrdered,
        qtyReceived: item.qtyReceived,
        qtyToReceive: item.qtyOrdered - item.qtyReceived,
        batchNumber: "",
        expiredDate: "",
      })),
    );
  };

  const updateItem = (
    idx: number,
    field: "qtyToReceive" | "batchNumber" | "expiredDate",
    val: string | number,
  ) => {
    setReceiptItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, [field]: val } : it,
      ),
    );
  };

  const handleReceive = async () => {
    if (!selectedPo) return;

    const itemsToSend = receiptItems
      .filter((it) => it.qtyToReceive > 0)
      .map((it) => ({
        poItemId: it.poItemId,
        qtyReceived: it.qtyToReceive,
        batchNumber: it.batchNumber || undefined,
        expiredDate: it.expiredDate || undefined,
      }));

    if (itemsToSend.length === 0) {
      toast.error("Masukkan kuantitas barang yang diterima");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post<{ message: string }>(
        `/purchasing/orders/${selectedPo.id}/receive`,
        { items: itemsToSend },
      );
      toast.success(res.data.message || "Barang berhasil diterima! HPP diperbarui otomatis.");
      setSelectedPo(null);
      setReceiptItems([]);
      setShowConfirm(false);
      void fetchOpenOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menerima barang");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Penerimaan Barang (Goods Receipt)</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Konfirmasi penerimaan fisik ke gudang — perhitungan HPP rata-rata &amp; nomor batch diperbarui otomatis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Kiri: Pilih PO */}
        <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-line bg-brand-surface-alt">
            <h2 className="font-semibold text-brand-ink-dark text-sm">
              Purchase Order Menunggu Penerimaan
            </h2>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-brand-ink-muted text-compact">
              Memuat daftar PO...
            </div>
          ) : openOrders.length === 0 ? (
            <div className="px-4 py-10 text-center text-brand-ink-muted text-compact">
              <PackageCheck className="size-8 mx-auto mb-2 text-brand-ink-muted/50" />
              Semua PO sudah diterima
            </div>
          ) : (
            <div className="divide-y divide-brand-line">
              {openOrders.map((po) => (
                <button
                  key={po.id}
                  onClick={() => selectPo(po)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-brand-surface-alt ${
                    selectedPo?.id === po.id ? "bg-brand-primary-soft border-l-2 border-brand-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-primary text-xs">
                      {po.poNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-info bg-brand-info-soft px-2 py-0.5 rounded border border-brand-info/30">
                      ORDERED
                    </span>
                  </div>
                  <div className="mt-1 text-compact text-brand-ink-dark">{po.supplier.name}</div>
                  <div className="text-[11px] text-brand-ink-muted">
                    Gudang: {po.warehouse.code} · {po.items.length} item
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel Kanan: Form Penerimaan */}
        <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-line bg-brand-surface-alt flex items-center justify-between">
            <h2 className="font-semibold text-brand-ink-dark text-sm">
              {selectedPo ? `Detail Penerimaan: ${selectedPo.poNumber}` : "Pilih PO di sebelah kiri"}
            </h2>
            {selectedPo && (
              <button
                onClick={() => { setSelectedPo(null); setReceiptItems([]); }}
                className="text-brand-ink-muted hover:text-brand-ink-dark"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {!selectedPo ? (
            <div className="px-4 py-12 text-center text-brand-ink-muted text-compact">
              <ChevronDown className="size-8 mx-auto mb-2 text-brand-ink-muted/50 rotate-90" />
              Pilih Purchase Order dari panel kiri untuk memulai penerimaan
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Info banner */}
              <div className="flex items-start gap-2 text-xs text-brand-info bg-brand-info-soft border border-brand-info/30 rounded-lg px-3 py-2">
                <AlertTriangle className="size-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Isi Nomor Batch dan Tanggal Kadaluarsa untuk produk yang memerlukan FEFO tracking.
                  HPP Moving Average akan dihitung ulang otomatis setelah konfirmasi.
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {receiptItems.map((it, idx) => (
                  <div key={it.poItemId} className="border border-brand-line rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-brand-ink-dark text-compact">{it.productName}</span>
                        <span className="ml-2 text-[11px] text-brand-ink-muted">/ {it.unitName}</span>
                      </div>
                      <span className="text-[11px] text-brand-ink-muted tabular-nums">
                        PO: {it.qtyOrdered} | Diterima: {it.qtyReceived}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-brand-ink-muted mb-1">
                          Qty Diterima
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={it.qtyOrdered - it.qtyReceived}
                          value={it.qtyToReceive}
                          onChange={(e) =>
                            updateItem(idx, "qtyToReceive", parseInt(e.target.value) || 0)
                          }
                          className="h-8 text-right tabular-nums text-compact"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-brand-ink-muted mb-1">
                          No. Batch
                        </label>
                        <Input
                          value={it.batchNumber}
                          onChange={(e) => updateItem(idx, "batchNumber", e.target.value)}
                          placeholder="BATCH-..."
                          className="h-8 text-compact font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-brand-ink-muted mb-1">
                          Tgl Kadaluarsa
                        </label>
                        <Input
                          type="date"
                          value={it.expiredDate}
                          onChange={(e) => updateItem(idx, "expiredDate", e.target.value)}
                          className="h-8 text-compact"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!showConfirm ? (
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover h-10 rounded-lg font-semibold"
                >
                  Konfirmasi Penerimaan Barang
                </Button>
              ) : (
                <div className="border-2 border-brand-warning rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-brand-warning">
                    ⚠️ Konfirmasi Penerimaan?
                  </p>
                  <p className="text-xs text-brand-ink-muted">
                    Stok gudang {selectedPo.warehouse.code} akan bertambah dan HPP Moving Average
                    diperbarui otomatis. Aksi ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 h-9 rounded-lg border border-brand-line text-sm font-semibold text-brand-ink hover:bg-brand-surface-alt transition-colors"
                    >
                      Batalkan
                    </button>
                    <Button
                      onClick={() => void handleReceive()}
                      disabled={saving}
                      className="flex-1 bg-brand-success text-white hover:bg-brand-success/90 h-9 rounded-lg font-semibold text-sm disabled:opacity-60"
                    >
                      {saving ? "Memproses..." : "✓ Ya, Terima Barang"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
