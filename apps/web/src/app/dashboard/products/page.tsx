"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, Plus, Barcode, Layers, Package, X } from "lucide-react";

interface ProductUnit {
  id: string;
  name: string;
  factorToBase: number;
  barcode: string | null;
  salePrice: number;
  purchasePrice?: number;
  isBase: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  brand: string | null;
  baseUnitName: string;
  trackBatch: boolean;
  minStockAlert: number;
  units: ProductUnit[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating product
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sembako");
  const [brand, setBrand] = useState("");
  const [baseUnitName, setBaseUnitName] = useState("Pcs");
  const [trackBatch, setTrackBatch] = useState(true);
  const [units, setUnits] = useState([
    { name: "Pcs", factorToBase: 1, barcode: "", salePrice: 15000, purchasePrice: 12000, isBase: true },
    { name: "Dus", factorToBase: 12, barcode: "", salePrice: 170000, purchasePrice: 140000, isBase: false },
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Product[] }>("/products", {
        params: { search: search || undefined },
      });
      setProducts(res.data.data || []);
    } catch {
      toast.error("Gagal mengambil daftar produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddUnit = () => {
    setUnits([
      ...units,
      { name: "", factorToBase: 1, barcode: "", salePrice: 0, purchasePrice: 0, isBase: false },
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    if (units.length <= 1) return;
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleUnitChange = (index: number, field: string, value: any) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    setUnits(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !baseUnitName) {
      toast.error("Lengkapi SKU, Nama, dan Satuan Dasar");
      return;
    }

    try {
      await api.post("/products", {
        sku,
        name,
        category,
        brand,
        baseUnitName,
        trackBatch,
        units,
      });
      toast.success("Produk multi-satuan berhasil ditambahkan!");
      setIsModalOpen(false);
      // Reset form
      setSku("");
      setName("");
      void fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan produk");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Katalog Master Produk</h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            Definisi produk satuan bertingkat (Multi-UOM) dengan dukungan barcode USB
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          <span>Tambah Produk</span>
        </Button>
      </div>

      {/* Filter & Barcode Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-brand-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari SKU, nama produk, atau scan barcode..."
            className="pl-9 h-10 bg-brand-surface"
          />
        </div>
        <span className="text-xs text-brand-ink-muted hidden sm:flex items-center gap-1.5 bg-brand-surface border border-brand-line px-3 py-2 rounded-lg">
          <Barcode className="size-4 text-brand-primary" aria-hidden="true" />
          <span>USB Scanner Aktif</span>
        </span>
      </div>

      {/* Product Table */}
      <div className="bg-brand-surface rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-compact border-collapse min-w-[700px]">
            <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-28">SKU</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nama Produk</th>
                <th scope="col" className="px-4 py-3 font-semibold w-32">Kategori</th>
                <th scope="col" className="px-4 py-3 font-semibold w-24">Satuan Dasar</th>
                <th scope="col" className="px-4 py-3 font-semibold">Hirarki Multi-UOM &amp; Harga Jual</th>
                <th scope="col" className="px-4 py-3 font-semibold w-24 text-center">Batch/FEFO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted text-sm">
                    Memuat katalog produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-ink-muted">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="size-8 text-brand-ink-muted/40" aria-hidden="true" />
                      <span className="text-sm">Belum ada produk yang cocok dengan pencarian.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-brand-primary">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-brand-ink-dark">
                      {p.name}
                      {p.brand && <span className="ml-2 text-xs text-brand-ink-muted">({p.brand})</span>}
                    </td>
                    <td className="px-4 py-3 text-brand-ink">{p.category || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-brand-surface-alt border border-brand-line font-medium text-xs">
                        {p.baseUnitName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {p.units.map((u) => (
                          <div
                            key={u.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-background border border-brand-line text-xs"
                          >
                            <span className="font-semibold text-brand-ink-dark">{u.name}</span>
                            <span className="text-brand-ink-muted">(= {u.factorToBase} {p.baseUnitName})</span>
                            <span className="text-brand-primary font-mono tabular-nums font-medium">
                              Rp {Number(u.salePrice).toLocaleString("id-ID")}
                            </span>
                            {u.barcode && (
                              <span className="font-mono text-[10px] text-brand-ink-muted bg-brand-surface-alt px-1 rounded">
                                {u.barcode}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.trackBatch ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-success-soft text-brand-success border border-brand-success/20">
                          FEFO Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-brand-ink-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Tambah Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-ink-dark/50 flex items-center justify-center p-4">
          <div className="bg-brand-surface rounded-xl border border-brand-line shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-line">
              <div className="flex items-center gap-2.5">
                <Package className="size-5 text-brand-primary" />
                <h2 className="text-lg font-bold">Tambah Produk Multi-Satuan Baru</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-brand-ink-muted hover:text-brand-ink-dark"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">SKU Produk *</label>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Contoh: BRG-005"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Nama Produk *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Tepung Terigu Segitiga 1kg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kategori</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Sembako"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Brand / Merek</label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Bogasari"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Satuan Dasar Terkecil *</label>
                  <Input
                    value={baseUnitName}
                    onChange={(e) => setBaseUnitName(e.target.value)}
                    placeholder="Pcs / Bungkus"
                    required
                  />
                </div>
              </div>

              {/* Multi-UOM Tier Definition */}
              <div className="border border-brand-line rounded-lg p-4 bg-brand-surface-alt/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-brand-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-dark">
                      Satuan & Konversi Bertingkat (Multi-UOM)
                    </span>
                  </div>
                  <Button type="button" onClick={handleAddUnit} variant="outline" size="xs">
                    + Tambah Satuan
                  </Button>
                </div>

                <div className="space-y-2">
                  {units.map((unit, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-brand-surface p-2.5 rounded border border-brand-line text-xs">
                      <div className="col-span-3">
                        <label className="text-[10px] text-brand-ink-muted block">Nama Satuan</label>
                        <Input
                          value={unit.name}
                          onChange={(e) => handleUnitChange(idx, "name", e.target.value)}
                          placeholder="Dus / Pak / Pcs"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-brand-ink-muted block">Faktor ke Base</label>
                        <Input
                          type="number"
                          value={unit.factorToBase}
                          onChange={(e) => handleUnitChange(idx, "factorToBase", Number(e.target.value))}
                          className="h-8 text-xs"
                          min={1}
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-brand-ink-muted block">Barcode (Scanner)</label>
                        <Input
                          value={unit.barcode}
                          onChange={(e) => handleUnitChange(idx, "barcode", e.target.value)}
                          placeholder="899..."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-brand-ink-muted block">Harga Jual (Rp)</label>
                        <Input
                          type="number"
                          value={unit.salePrice}
                          onChange={(e) => handleUnitChange(idx, "salePrice", Number(e.target.value))}
                          className="h-8 text-xs"
                          min={0}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-3">
                        {units.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnit(idx)}
                            className="text-brand-danger hover:opacity-80"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackBatch"
                  checked={trackBatch}
                  onChange={(e) => setTrackBatch(e.target.checked)}
                  className="rounded border-brand-line-strong text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="trackBatch" className="text-xs font-medium cursor-pointer">
                  Aktifkan pelacakan batch & tanggal kadaluarsa (FEFO) untuk produk ini
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-brand-line">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan Produk</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
