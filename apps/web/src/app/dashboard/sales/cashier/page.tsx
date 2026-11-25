"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  Search,
  Plus,
  Trash2,
  Barcode,
  X,
  AlertTriangle,
  Receipt,
  ChevronDown,
  Keyboard,
} from "lucide-react";

interface Customer {
  id: string;
  code: string;
  name: string;
  creditLimit: number;
  priceTier?: { name: string };
}
interface Warehouse {
  id: string;
  code: string;
  name: string;
}
interface ProductUnit {
  id: string;
  unitName: string;
  factorToBase: number;
  product: { id: string; sku: string; name: string };
}
interface CartItem {
  productUnitId: string;
  productSku: string;
  productName: string;
  unitName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}
interface CreditLimitError {
  currentAr: number;
  newInvoiceTotal: number;
  creditLimit: number;
  projectedAr: number;
}

const PaymentMethods = [
  { value: "CASH", label: "Tunai (COD)" },
  { value: "CREDIT", label: "Kredit / Tempo" },
  { value: "TRANSFER", label: "Transfer Bank" },
];

export default function CashierPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductUnit[]>([]);
  const [showProductDrop, setShowProductDrop] = useState(false);

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);

  // Credit limit override modal
  const [showOverride, setShowOverride] = useState(false);
  const [pendingError, setPendingError] = useState<CreditLimitError | null>(null);
  const [overridePassword, setOverridePassword] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overriding, setOverriding] = useState(false);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);

  // Keyboard refs
  const barcodeRef = useRef<HTMLInputElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);

  const grandTotal = cart.reduce((s, it) => s + it.lineTotal, 0);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Load master data
  useEffect(() => {
    const loadMaster = async () => {
      const [custRes, whRes] = await Promise.all([
        api.get<{ data: Customer[] }>("/master/customers"),
        api.get<{ data: Warehouse[] }>("/master/warehouses"),
      ]);
      setCustomers(custRes.data.data || []);
      setWarehouses(whRes.data.data || []);
      // Default warehouse to first
      if (whRes.data.data?.length > 0) setWarehouseId(whRes.data.data[0].id);
    };
    void loadMaster();
  }, []);

  // Product search with debounce
  useEffect(() => {
    if (!productSearch) { setProductResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get<{ data: any[] }>("/master/products", {
          params: { search: productSearch, includeUnits: true },
        });
        const units: ProductUnit[] = [];
        (res.data.data || []).forEach((p: any) => {
          (p.units || []).forEach((u: any) => {
            units.push({ id: u.id, unitName: u.unitName, factorToBase: u.factorToBase, product: { id: p.id, sku: p.sku, name: p.name } });
          });
        });
        setProductResults(units);
        setShowProductDrop(true);
      } catch { /* silent */ }
    }, 200);
    return () => clearTimeout(t);
  }, [productSearch]);

  const handleSubmit = useCallback(async () => {
    if (!customerId) { toast.error("Pilih pelanggan terlebih dahulu (F2)"); return; }
    if (!warehouseId) { toast.error("Pilih gudang"); return; }
    if (cart.length === 0) { toast.error("Tambah produk ke keranjang (F4)"); return; }
    setSaving(true);
    try {
      await api.post("/sales/invoices", {
        customerId,
        warehouseId,
        paymentMethod,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        items: cart.map((it) => ({
          productUnitId: it.productUnitId,
          qty: it.qty,
          unitPrice: it.unitPrice,
        })),
      });
      toast.success("Invoice berhasil dibuat!");
      setCart([]);
      setCustomerId("");
      setCustomerSearch("");
      setDueDate("");
      setNotes("");
    } catch (err: any) {
      if (err?.response?.data?.errorCode === "CREDIT_LIMIT_EXCEEDED") {
        setPendingError(err.response.data);
        setShowOverride(true);
      } else {
        toast.error(err?.response?.data?.message || "Gagal membuat invoice");
      }
    } finally {
      setSaving(false);
    }
  }, [customerId, warehouseId, paymentMethod, dueDate, notes, cart]);

  // F2 = focus customer, F4 = add product row, F9 = submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); setShowCustomerDrop(true); }
      if (e.key === "F4") { e.preventDefault(); productSearchRef.current?.focus(); }
      if (e.key === "F9") { e.preventDefault(); void handleSubmit(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart, customerId, warehouseId, paymentMethod, handleSubmit]);

  // Barcode input (USB scanner)
  const handleBarcodeInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = (e.target as HTMLInputElement).value.trim();
    if (!code) return;
    try {
      const res = await api.get<any>(`/master/products/barcode/${code}`);
      const p = res.data;
      if (p?.units?.length > 0) {
        addToCart(p.units[0].id, p.units[0].unitName, p.sku, p.name, p.units[0].priceTiers?.[0]?.price ?? 0);
      }
    } catch {
      toast.error(`Barcode "${code}" tidak ditemukan`);
    }
    (e.target as HTMLInputElement).value = "";
  };

  const addToCart = (
    productUnitId: string,
    unitName: string,
    productSku: string,
    productName: string,
    unitPrice: number,
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.productUnitId === productUnitId);
      if (idx >= 0) {
        return prev.map((it, i) =>
          i === idx
            ? { ...it, qty: it.qty + 1, lineTotal: (it.qty + 1) * it.unitPrice }
            : it,
        );
      }
      return [
        ...prev,
        { productUnitId, productSku, productName, unitName, qty: 1, unitPrice, lineTotal: unitPrice },
      ];
    });
    setProductSearch("");
    setProductResults([]);
    setShowProductDrop(false);
    toast.success(`${productName} / ${unitName} ditambahkan`, { duration: 1500 });
  };

  const updateCartItem = (idx: number, field: "qty" | "unitPrice", val: number) => {
    setCart((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [field]: val };
        updated.lineTotal = updated.qty * updated.unitPrice;
        return updated;
      }),
    );
  };

  const removeCartItem = (idx: number) =>
    setCart((prev) => prev.filter((_, i) => i !== idx));

  const handleOverride = async () => {
    if (!overridePassword || !overrideReason) {
      toast.error("Password dan alasan override wajib diisi");
      return;
    }
    setOverriding(true);
    try {
      // First post invoice with override flag
      const res = await api.post<{ id: string }>("/sales/invoices", {
        customerId,
        warehouseId,
        paymentMethod,
        dueDate: dueDate || undefined,
        notes: `[OVERRIDE] ${overrideReason}` + (notes ? ` | ${notes}` : ""),
        items: cart.map((it) => ({
          productUnitId: it.productUnitId,
          qty: it.qty,
          unitPrice: it.unitPrice,
        })),
        forceOverride: true,
      });

      if (res.data?.id) {
        await api.post(`/sales/invoices/${res.data.id}/override-limit`, {
          ownerPassword: overridePassword,
          reason: overrideReason,
        });
      }

      toast.success("Invoice dibuat dengan override credit limit — tercatat di audit log");
      setShowOverride(false);
      setOverridePassword("");
      setOverrideReason("");
      setPendingError(null);
      setCart([]);
      setCustomerId("");
      setCustomerSearch("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Override gagal — periksa password Owner");
    } finally {
      setOverriding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Kasir Cepat (Point of Sales)</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5 flex flex-wrap items-center gap-2">
            <Keyboard className="size-3.5" aria-hidden="true" />
            <span>F2 Pelanggan · F4 Cari Produk · F9 Posting Invoice · Tab/Enter navigasi</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-ink-muted bg-brand-surface-alt border border-brand-line px-3 py-1.5 rounded-lg shrink-0">
          <Barcode className="size-4 text-brand-primary" aria-hidden="true" />
          <span className="hidden sm:inline">Scan barcode:</span>
          <Input
            ref={barcodeRef}
            onKeyDown={handleBarcodeInput}
            placeholder="Barcode..."
            className="h-7 w-32 text-xs font-mono bg-brand-surface"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Cart */}
        <div className="xl:col-span-2 space-y-4">
          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
            <Input
              ref={productSearchRef}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onFocus={() => productResults.length > 0 && setShowProductDrop(true)}
              placeholder="Cari produk (F4) — SKU, nama, atau scan barcode..."
              className="pl-9 h-10 bg-brand-surface"
            />
            {showProductDrop && productResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-brand-line rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto">
                {productResults.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={() => addToCart(u.id, u.unitName, u.product.sku, u.product.name, 0)}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-surface-alt text-compact transition-colors border-b border-brand-line/60 last:border-0"
                  >
                    <span className="font-mono font-bold text-brand-primary text-[11px]">
                      {u.product.sku}
                    </span>
                    <span className="mx-2 text-brand-ink-dark">{u.product.name}</span>
                    <span className="text-brand-ink-muted text-[11px]">/ {u.unitName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
            <table className="w-full text-left text-compact border-collapse">
              <thead className="bg-brand-surface-alt border-b border-brand-line">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-brand-ink-dark">Produk / Satuan</th>
                  <th className="px-4 py-2.5 font-semibold text-brand-ink-dark w-24 text-right">Qty</th>
                  <th className="px-4 py-2.5 font-semibold text-brand-ink-dark w-32 text-right">Harga Jual</th>
                  <th className="px-4 py-2.5 font-semibold text-brand-ink-dark w-32 text-right">Subtotal</th>
                  <th className="px-4 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-brand-ink-muted">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="size-7 text-brand-ink-muted/40" />
                        <span>Keranjang kosong. Scan barcode atau cari produk (F4)</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((it, idx) => (
                    <tr key={idx} className="hover:bg-brand-surface-alt/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-brand-ink-dark">{it.productName}</div>
                        <div className="text-[11px] text-brand-ink-muted font-mono">{it.productSku} · {it.unitName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) =>
                            updateCartItem(idx, "qty", Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="h-7 text-right tabular-nums text-compact px-2 w-20 ml-auto"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          value={it.unitPrice}
                          onChange={(e) =>
                            updateCartItem(idx, "unitPrice", Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="h-7 text-right tabular-nums text-compact px-2 w-28 ml-auto"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-brand-ink-dark">
                        Rp {it.lineTotal.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeCartItem(idx)}
                          className="text-brand-danger/70 hover:text-brand-danger transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {cart.length > 0 && (
                <tfoot className="border-t-2 border-brand-line bg-brand-surface-alt">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-brand-ink-dark text-right">
                      TOTAL ({cart.length} item):
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-black text-xl text-brand-primary">
                      Rp {grandTotal.toLocaleString("id-ID")}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Right: Order Summary Panel */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-brand-surface border border-brand-line rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-brand-ink-dark text-sm flex items-center gap-2">
              <span>Pelanggan</span>
              <kbd className="text-[10px] font-mono bg-brand-surface-alt px-1 py-0.5 rounded border border-brand-line">F2</kbd>
            </h3>
            <div className="relative">
              <Input
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDrop(true);
                }}
                onFocus={() => setShowCustomerDrop(true)}
                placeholder="Cari nama / kode pelanggan..."
                className="h-9 bg-brand-surface text-compact"
              />
              {showCustomerDrop && customers.filter(
                (c) =>
                  !customerSearch ||
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.code.toLowerCase().includes(customerSearch.toLowerCase()),
              ).length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-brand-line rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                  {customers
                    .filter(
                      (c) =>
                        !customerSearch ||
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(customerSearch.toLowerCase()),
                    )
                    .slice(0, 10)
                    .map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={() => {
                          setCustomerId(c.id);
                          setCustomerSearch(c.name);
                          setShowCustomerDrop(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-brand-surface-alt text-compact border-b border-brand-line/60 last:border-0"
                      >
                        <span className="font-mono text-[11px] text-brand-primary">{c.code}</span>
                        <span className="ml-2 text-brand-ink-dark">{c.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="text-[11px] text-brand-ink-muted space-y-0.5 bg-brand-surface-alt rounded-lg px-3 py-2">
                <div>
                  Limit Kredit:{" "}
                  <span className="font-semibold text-brand-ink-dark">
                    Rp {Number(selectedCustomer.creditLimit).toLocaleString("id-ID")}
                  </span>
                </div>
                {selectedCustomer.priceTier && (
                  <div>
                    Tier Harga: <span className="font-semibold">{selectedCustomer.priceTier.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warehouse & Payment */}
          <div className="bg-brand-surface border border-brand-line rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Gudang
              </label>
              <div className="relative">
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 rounded-lg border border-brand-line bg-brand-surface text-compact text-brand-ink-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
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
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {PaymentMethods.map((pm) => (
                  <button
                    key={pm.value}
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-compact font-semibold transition-colors ${
                      paymentMethod === pm.value
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-brand-surface border-brand-line text-brand-ink hover:bg-brand-surface-alt"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "CREDIT" && (
              <div>
                <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                  Tgl Jatuh Tempo
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 bg-brand-surface text-compact"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                Catatan (opsional)
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                className="h-9 bg-brand-surface text-compact"
              />
            </div>
          </div>

          {/* Summary + Submit */}
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-compact text-brand-ink">
              <span>{cart.length} item</span>
              <span className="font-semibold">Total: Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
            <Button
              onClick={() => void handleSubmit()}
              disabled={saving || cart.length === 0}
              className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover h-11 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center gap-2 justify-center"
            >
              <Receipt className="size-4" />
              {saving ? "Memproses..." : "Posting Invoice (F9)"}
            </Button>
            <p className="text-[10px] text-center text-brand-ink-muted">
              Tekan F9 kapan saja untuk posting · FEFO & stok diproses otomatis
            </p>
          </div>
        </div>
      </div>

      {/* Credit Limit Override Modal */}
      {showOverride && pendingError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-md">
            <div className="px-6 py-5 border-b border-brand-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-warning-soft flex items-center justify-center">
                  <AlertTriangle className="size-5 text-brand-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-ink-dark">Batas Kredit Terlampaui</h3>
                  <p className="text-xs text-brand-ink-muted">Override wajib disetujui oleh Owner</p>
                </div>
              </div>
              <button onClick={() => setShowOverride(false)}>
                <X className="size-5 text-brand-ink-muted" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-brand-warning-soft border border-brand-warning/30 rounded-lg px-4 py-3 space-y-1 text-compact">
                <div className="flex justify-between">
                  <span className="text-brand-ink-muted">Piutang berjalan:</span>
                  <span className="font-semibold tabular-nums">Rp {pendingError.currentAr.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-ink-muted">Invoice baru:</span>
                  <span className="font-semibold tabular-nums">Rp {pendingError.newInvoiceTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-t border-brand-warning/30 pt-1 mt-1">
                  <span className="font-semibold text-brand-warning">Proyeksi AR:</span>
                  <span className="font-bold text-brand-warning tabular-nums">Rp {pendingError.projectedAr.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-ink-muted">Limit:</span>
                  <span className="font-semibold tabular-nums">Rp {pendingError.creditLimit.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                  Password Owner <span className="text-brand-danger">*</span>
                </label>
                <Input
                  type="password"
                  value={overridePassword}
                  onChange={(e) => setOverridePassword(e.target.value)}
                  placeholder="Masukkan password Owner..."
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-ink-dark mb-1.5">
                  Alasan Override <span className="text-brand-danger">*</span>
                </label>
                <Input
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Contoh: Pelanggan VIP, sudah konfirmasi bayar..."
                  className="h-9"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-line flex gap-3">
              <button
                onClick={() => setShowOverride(false)}
                className="flex-1 h-9 rounded-lg border border-brand-line text-sm font-semibold text-brand-ink hover:bg-brand-surface-alt"
              >
                Batalkan
              </button>
              <Button
                onClick={() => void handleOverride()}
                disabled={overriding}
                className="flex-1 bg-brand-warning text-white hover:bg-brand-warning/90 h-9 rounded-lg font-semibold text-sm"
              >
                {overriding ? "Memproses..." : "Override & Posting"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
