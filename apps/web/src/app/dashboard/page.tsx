"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  Package,
  Users,
  Boxes,
  ShoppingCart,
  Receipt,
  Truck,
  Wallet,
  CalendarClock,
  BarChart3,
  Warehouse,
  TrendingUp,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const MODULE_CARDS = [
  {
    group: "Penjualan",
    items: [
      { title: "Kasir Cepat", desc: "Buat faktur penjualan dengan barcode USB & hotkey F9", href: "/dashboard/sales/cashier", icon: ShoppingCart, badge: "F9", accent: "text-brand-primary" },
      { title: "Riwayat Invoice", desc: "Daftar seluruh faktur penjualan yang sudah diposting", href: "/dashboard/sales/invoices", icon: Receipt, accent: "text-brand-primary" },
      { title: "Retur Penjualan", desc: "Kelola retur barang dari pelanggan ke gudang", href: "/dashboard/sales/returns", icon: RotateCcw, accent: "text-brand-primary" },
    ],
  },
  {
    group: "Inventori & Gudang",
    items: [
      { title: "Kartu Stok", desc: "Saldo fisik multi-satuan dan nilai HPP per gudang", href: "/dashboard/inventory", icon: Boxes, accent: "text-brand-info" },
      { title: "Batch & Kedaluwarsa", desc: "Pantau nomor batch dan tanggal kedaluwarsa (FEFO)", href: "/dashboard/inventory/batches", icon: CalendarClock, accent: "text-brand-warning" },
      { title: "Transfer Gudang", desc: "Pindahkan stok antar lokasi gudang", href: "/dashboard/inventory/transfers", icon: Truck, accent: "text-brand-info" },
    ],
  },
  {
    group: "Pembelian",
    items: [
      { title: "Purchase Order", desc: "Buat dan kelola PO ke supplier", href: "/dashboard/purchasing/orders", icon: ShoppingCart, accent: "text-brand-ink" },
      { title: "Penerimaan Barang", desc: "Konfirmasi penerimaan fisik ke gudang & update HPP", href: "/dashboard/purchasing/receipts", icon: Boxes, accent: "text-brand-ink" },
    ],
  },
  {
    group: "Keuangan & Kas",
    items: [
      { title: "Pelunasan Piutang", desc: "Alokasikan pembayaran ke satu atau banyak nota sekaligus", href: "/dashboard/finance/payments", icon: Wallet, accent: "text-brand-success" },
      { title: "Buku Kas & Bank", desc: "Mutasi kas tunai dan rekening bank operasional", href: "/dashboard/finance/cash", icon: Wallet, accent: "text-brand-success" },
      { title: "Aging Piutang", desc: "Laporan umur piutang: lancar, 1–30, 31–60, >60 hari", href: "/dashboard/finance/aging", icon: CalendarClock, accent: "text-brand-warning" },
    ],
  },
  {
    group: "Laporan",
    items: [
      { title: "Laba Kotor per Nota", desc: "Margin laba per faktur penjualan dengan detail HPP", href: "/dashboard/reports/gross-profit", icon: TrendingUp, accent: "text-brand-success" },
      { title: "Laba Rugi Sederhana", desc: "Ringkasan pendapatan, HPP, dan laba operasional", href: "/dashboard/reports/profit-loss", icon: BarChart3, accent: "text-brand-success" },
    ],
  },
  {
    group: "Master Data & Pengaturan",
    items: [
      { title: "Katalog Produk", desc: "Kelola produk, satuan konversi multi-UOM, dan harga jual", href: "/dashboard/products", icon: Package, accent: "text-brand-ink-muted" },
      { title: "Data Pelanggan", desc: "Master pelanggan: level harga, tempo, dan limit kredit", href: "/dashboard/customers", icon: Users, accent: "text-brand-ink-muted" },
      { title: "Supplier", desc: "Daftar supplier dan kontrak pengadaan barang", href: "/dashboard/suppliers", icon: Truck, accent: "text-brand-ink-muted" },
      { title: "Gudang", desc: "Daftar lokasi gudang dan konfigurasi kapasitas", href: "/dashboard/warehouses", icon: Warehouse, accent: "text-brand-ink-muted" },
      { title: "Manajemen User", desc: "Kelola akun staf dan hak akses RBAC", href: "/dashboard/users", icon: Users, accent: "text-brand-ink-muted" },
    ],
  },
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brand-line">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-brand-ink-dark">
            Dashboard Operasional
          </h1>
          <p className="text-sm text-brand-ink-muted mt-0.5">
            StackPlus ERP — Micro Distributor &amp; Grosir FMCG Sembako
          </p>
        </div>
        <Link
          href="/dashboard/sales/cashier"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-hover transition-colors shadow-sm"
        >
          <ShoppingCart className="size-3.5" aria-hidden="true" />
          <span>Buka Kasir</span>
          <kbd className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">F9</kbd>
        </Link>
      </div>

      {/* Module Groups */}
      <div className="space-y-8">
        {MODULE_CARDS.map((group) => (
          <section key={group.group} aria-labelledby={`group-${group.group}`}>
            <h2
              id={`group-${group.group}`}
              className="text-[11px] font-bold uppercase tracking-wider text-brand-ink-muted mb-3 px-0.5"
            >
              {group.group}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 list-none p-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-start gap-3.5 p-4 rounded-xl border border-brand-line bg-brand-surface hover:border-brand-primary/40 hover:bg-white hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1"
                    >
                      <div
                        className="size-9 rounded-lg bg-brand-background border border-brand-line flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-colors"
                        aria-hidden="true"
                      >
                        <Icon className={`size-4 ${item.accent}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-ink-dark truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-brand-primary-soft text-brand-primary rounded font-bold border border-brand-primary/20">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-ink-muted mt-0.5 leading-relaxed line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight
                        className="size-3.5 text-brand-ink-muted/40 group-hover:text-brand-primary shrink-0 mt-0.5 transition-colors"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
