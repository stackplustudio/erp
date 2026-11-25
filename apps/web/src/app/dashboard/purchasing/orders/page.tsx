"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

interface Supplier { id: string; code: string; name: string; }
interface Warehouse { id: string; code: string; name: string; }
interface Product { id: string; sku: string; name: string; }
interface ProductUnit {
  id: string;
  unitName: string;
  factorToBase: number;
  purchasePrice?: number;
  product: Product;
}
interface PoItem {
  productUnitId: string;
  productName: string;
  unitName: string;
  qtyOrdered: number;
  unitCost: number;
  lineTotal: number;
}
interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  orderDate: string;
  grandTotal: number;
  supplier: { name: string };
  warehouse: { code: string; name: string };
  items: Array<{
    id: string;
    productUnit: { unitName: string; product: { name: string; sku: string } };
    qtyOrdered: number;
    qtyReceived: number;
    unitCost: number;
  }>;
}

const statusColors: Record<string, string> = {
  ORDERED: "bg-brand-info-soft text-brand-info border-brand-info/30",
  RECEIVED: "bg-brand-success-soft text-brand-success border-brand-success/20",
  CANCELLED: "bg-brand-danger-soft text-brand-danger border-brand-danger/30",
};

export default function PurchasingOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PoItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductUnit[]>([]);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: PurchaseOrder[] }>("/purchasing/orders", {
        params: { search: search || undefined },
      });
      setOrders(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil daftar Purchase Order");
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    const [supRes, whRes] = await Promise.all([
      api.get<{ data: Supplier[] }>("/master/suppliers"),
      api.get<{ data: Warehouse[] }>("/master/warehouses"),
    ]);
    setSuppliers(supRes.data.data || []);
    setWarehouses(whRes.data.data || []);
  };

  useEffect(() => {
    const t = setTimeout(() => void fetchOrders(), 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (showModal) {
      void fetchMasterData();
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [showModal]);

  const searchProducts = async (q: string) => {
    if (!q) { setProductResults([]); return; }
    try {
      const res = await api.get<{ data: ProductUnit[] }>("/master/products", {
        params: { search: q, includeUnits: true },
      });
      // flatten units
      const units: ProductUnit[] = [];
      (res.data.data as any[]).forEach((p: any) => {
        (p.units || []).forEach((u: any) => {
          units.push({
            id: u.id,
            unitName: u.unitName,
            factorToBase: u.factorToBase,
            purchasePrice: u.purchasePrice,
            product: { id: p.id, sku: p.sku, name: p.name },
          });
        });
      });
      setProductResults(units);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    const t = setTimeout(() => void searchProducts(productSearch), 200);
    return () => clearTimeout(t);
  }, [productSearch]);

  const addItem = (unit: ProductUnit) => {
    setItems((prev) => [
      ...prev,
      {
        productUnitId: unit.id,
        productName: unit.product.name,
        unitName: unit.unitName,
        qtyOrdered: 1,
        unitCost: unit.purchasePrice ?? 0,
        lineTotal: unit.purchasePrice ?? 0,
      },
    ]);
    setProductSearch("");
    setProductResults([]);
  };

  const updateItem = (idx: number, field: "qtyOrdered" | "unitCost", val: number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [field]: val };
        updated.lineTotal = updated.qtyOrdered * updated.unitCost;
        return updated;
      }),
    );
  };

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const grandTotal = items.reduce((s, it) => s + it.lineTotal, 0);

  const handleSubmit = async () => {
    if (!supplierId || !warehouseId) {
      toast.error("Pilih supplier dan gudang tujuan terlebih dahulu");
      return;
    }
    if (items.length === 0) {
      toast.error("Tambahkan minimal 1 item produk");
      return;
    }
    setSaving(true);
    try {
      await api.post("/purchasing/orders", {
        supplierId,
        warehouseId,
        expectedDate: expectedDate || undefined,
        notes: notes || undefined,
        items: items.map((it) => ({
          productUnitId: it.productUnitId,
          qtyOrdered: it.qtyOrdered,
          unitCost: it.unitCost,
        })),
      });
      toast.success("Purchase Order berhasil dibuat!");
      setShowModal(false);
      setSupplierId("");
      setWarehouseId("");
      setExpectedDate("");
      setNotes("");
      setItems([]);
      void fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal membuat PO");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Purchase Order (PO)</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Penerbitan surat pesanan pembelian barang ke prinsipal atau supplier
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          <span>Buat PO Baru</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor PO atau supplier..."
          className="pl-9 h-10 bg-brand-surface"
        />
      </div>

      {/* Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[650px]">
            <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-40">No. PO</th>
                <th scope="col" className="px-4 py-3 font-semibold">Supplier</th>
                <th scope="col" className="px-4 py-3 font-semibold w-28">Gudang</th>
                <th scope="col" className="px-4 py-3 font-semibold w-28">Tgl Order</th>
                <th scope="col" className="px-4 py-3 font-semibold w-36 text-right">Grand Total</th>
                <th scope="col" className="px-4 py-3 font-semibold w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                    Memuat daftar Purchase Order...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="size-8 text-brand-ink-muted/40" aria-hidden="true" />
                      <span className="text-sm">Belum ada Purchase Order</span>
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-brand-primary text-xs font-semibold hover:underline"
                      >
                        Buat PO pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-brand-primary text-xs">
                      {o.poNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-ink-dark">{o.supplier.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-brand-ink-dark">
                        {o.warehouse.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-ink-muted tabular-nums">
                      {new Date(o.orderDate).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-brand-ink-dark">
                      Rp {Number(o.grandTotal).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${statusColors[o.status] ?? "bg-brand-surface-alt text-brand-ink border-brand-line"}`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create PO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto pb-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-3xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-line">
              <div>
                <h2 className="text-base font-bold text-brand-ink-dark">Buat Purchase Order Baru</h2>
                <p className="text-xs text-brand-ink-muted mt-0.5">
                  Nomor PO akan digenerate otomatis
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-ink-muted hover:text-brand-ink-dark transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                    Supplier <span className="text-brand-danger">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    >
                      <option value="">-- Pilih Supplier --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 size-4 text-brand-ink-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                    Gudang Tujuan <span className="text-brand-danger">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    >
                      <option value="">-- Pilih Gudang --</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} — {w.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 size-4 text-brand-ink-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                    Tanggal Estimasi Tiba
                  </label>
                  <Input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="h-9 bg-brand-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                    Catatan
                  </label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opsional..."
                    className="h-9 bg-brand-surface"
                  />
                </div>
              </div>

              {/* Product Search */}
              <div>
                <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                  Tambah Produk
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
                  <Input
                    ref={searchRef}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk atau SKU..."
                    className="pl-9 h-9 bg-brand-surface"
                  />
                  {productResults.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-brand-line rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {productResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => addItem(u)}
                          className="w-full text-left px-3 py-2 hover:bg-brand-surface-alt text-compact transition-colors"
                        >
                          <span className="font-mono font-semibold text-brand-primary text-[11px]">
                            {u.product.sku}
                          </span>
                          <span className="mx-2 text-brand-ink-dark">{u.product.name}</span>
                          <span className="text-brand-ink-muted text-[11px]">/ {u.unitName}</span>
                          {u.purchasePrice && (
                            <span className="ml-auto float-right text-brand-ink-muted text-[11px]">
                              Rp {u.purchasePrice.toLocaleString("id-ID")}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="border border-brand-line rounded-lg overflow-hidden">
                  <table className="w-full text-compact">
                    <thead className="bg-brand-surface-alt">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-brand-ink-dark">Produk</th>
                        <th className="px-3 py-2 text-left font-semibold text-brand-ink-dark w-20">Satuan</th>
                        <th className="px-3 py-2 text-right font-semibold text-brand-ink-dark w-24">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold text-brand-ink-dark w-32">Harga Beli</th>
                        <th className="px-3 py-2 text-right font-semibold text-brand-ink-dark w-32">Subtotal</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-line">
                      {items.map((it, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="px-3 py-2 font-medium text-brand-ink-dark">{it.productName}</td>
                          <td className="px-3 py-2 text-brand-ink-muted">{it.unitName}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={it.qtyOrdered}
                              onChange={(e) =>
                                updateItem(idx, "qtyOrdered", Math.max(1, parseInt(e.target.value) || 1))
                              }
                              className="h-7 text-right tabular-nums text-compact px-2 w-full"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              value={it.unitCost}
                              onChange={(e) =>
                                updateItem(idx, "unitCost", Math.max(0, parseInt(e.target.value) || 0))
                              }
                              className="h-7 text-right tabular-nums text-compact px-2 w-full"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-brand-ink-dark text-xs">
                            Rp {it.lineTotal.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-brand-danger hover:text-brand-danger/80 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-brand-surface-alt border-t-2 border-brand-line">
                      <tr>
                        <td colSpan={4} className="px-3 py-2.5 font-semibold text-brand-ink-dark text-right">
                          Grand Total PO:
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono tabular-nums font-bold text-brand-primary">
                          Rp {grandTotal.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-line bg-brand-surface-alt rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-ink hover:bg-brand-line/60 transition-colors"
              >
                Batal
              </button>
              <Button
                onClick={() => void handleSubmit()}
                disabled={saving}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover h-9 px-5 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Buat Purchase Order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
