"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import {
  Package,
  Users,
  Warehouse,
  Boxes,
  ShoppingCart,
  Receipt,
  Truck,
  RotateCcw,
  Wallet,
  CalendarClock,
  BarChart3,
  LogOut,
  X,
  LayoutDashboard,
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Master Data",
    items: [
      { title: "Katalog Produk",   href: "/dashboard/products",   icon: Package },
      { title: "Data Pelanggan",   href: "/dashboard/customers",  icon: Users },
      { title: "Supplier",         href: "/dashboard/suppliers",  icon: Truck },
      { title: "Gudang",           href: "/dashboard/warehouses", icon: Warehouse },
    ],
  },
  {
    group: "Inventori & HPP",
    items: [
      { title: "Kartu Stok",       href: "/dashboard/inventory",           icon: Boxes },
      { title: "Batch & FEFO",     href: "/dashboard/inventory/batches",   icon: CalendarClock },
      { title: "Transfer Gudang",  href: "/dashboard/inventory/transfers", icon: Truck },
    ],
  },
  {
    group: "Penjualan",
    items: [
      { title: "Kasir Cepat",      href: "/dashboard/sales/cashier",  icon: ShoppingCart, badge: "F9" },
      { title: "Riwayat Invoice",  href: "/dashboard/sales/invoices", icon: Receipt },
      { title: "Retur Penjualan",  href: "/dashboard/sales/returns",  icon: RotateCcw },
    ],
  },
  {
    group: "Pembelian",
    items: [
      { title: "Purchase Order",   href: "/dashboard/purchasing/orders",   icon: ShoppingCart },
      { title: "Penerimaan Barang",href: "/dashboard/purchasing/receipts", icon: Boxes },
    ],
  },
  {
    group: "Keuangan & Kas",
    items: [
      { title: "Pelunasan Piutang",href: "/dashboard/finance/payments", icon: Wallet },
      { title: "Buku Kas & Bank",  href: "/dashboard/finance/cash",     icon: Wallet },
      { title: "Aging Piutang",    href: "/dashboard/finance/aging",    icon: CalendarClock },
    ],
  },
  {
    group: "Laporan",
    items: [
      { title: "Laba Kotor",       href: "/dashboard/reports/gross-profit", icon: BarChart3 },
      { title: "Laba Rugi",        href: "/dashboard/reports/profit-loss",  icon: BarChart3 },
    ],
  },
  {
    group: "Pengaturan",
    items: [
      { title: "Manajemen User",   href: "/dashboard/users", icon: Users },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refresh_token");
    router.push("/");
  };

  return (
    <aside className="w-56 shrink-0 border-r border-brand-line bg-brand-surface flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-brand-line flex items-center justify-between shrink-0">
        <BrandLogo variant="badge" href="/dashboard" iconHeight={28} />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md hover:bg-brand-surface-alt text-brand-ink-muted"
            aria-label="Tutup menu"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Navigasi aplikasi" className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group}>
            <div className="px-2 mb-1 text-[10px] font-bold tracking-widest text-brand-ink-muted uppercase">
              {group.group}
            </div>
            <ul className="space-y-0.5 list-none p-0">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                        isActive
                          ? "bg-brand-primary-soft text-brand-primary font-semibold"
                          : "text-brand-ink hover:bg-brand-surface-alt hover:text-brand-ink-dark"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={cn("size-3.5 shrink-0", isActive ? "text-brand-primary" : "text-brand-ink-muted")}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1 py-0.5 bg-brand-primary-soft text-brand-primary border border-brand-primary/20 rounded font-bold shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: Tenant info + logout */}
      <div className="px-2.5 py-3 border-t border-brand-line bg-brand-surface-alt/40 shrink-0">
        <div className="px-2 mb-2">
          <p className="text-xs font-semibold text-brand-ink-dark truncate">PT StackPlus Sembako</p>
          <p className="text-[10px] text-brand-ink-muted truncate">GDG-01 · Gudang Utama</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-brand-danger hover:bg-brand-danger-soft rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-danger"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
