"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Warehouse, CheckCircle2 } from "lucide-react";

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.get<WarehouseItem[]>("/warehouses");
      setWarehouses(res.data || []);
    } catch {
      toast.error("Gagal mengambil data gudang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWarehouses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">Master Lokasi &amp; Gudang</h1>
        <p className="text-sm text-brand-ink-muted mt-0.5">
          Pemisahan stok fisik multi-gudang dan isolasi perhitungan HPP rata-rata bergerak
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-brand-ink-muted">
            Memuat daftar gudang...
          </div>
        ) : (
          warehouses.map((wh) => (
            <div
              key={wh.id}
              className="bg-brand-surface rounded-xl border border-brand-line p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-brand-primary-soft border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <Warehouse className="size-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-primary px-1.5 py-0.5 rounded bg-brand-surface-alt">
                      {wh.code}
                    </span>
                    <h3 className="font-bold text-base mt-0.5">{wh.name}</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-success bg-brand-success-soft px-2 py-0.5 rounded border border-brand-success/20">
                  <CheckCircle2 className="size-3" />
                  <span>Aktif</span>
                </span>
              </div>

              <p className="text-xs text-brand-ink-muted">
                {wh.address || "Alamat gudang belum diatur."}
              </p>

              <div className="pt-3 border-t border-brand-line flex items-center justify-between text-xs text-brand-ink">
                <span>Pencatatan Moving Average HPP:</span>
                <span className="font-semibold text-brand-primary">Otomatis Terisolasi</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
