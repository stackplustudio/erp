"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ChevronDown, Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_ROLES = [
  { role: "OWNER",          label: "Owner",     badge: "bg-brand-primary text-white" },
  { role: "FINANCE",        label: "Finance",   badge: "bg-brand-success text-white" },
  { role: "ORDER_CASHIER",  label: "Kasir",     badge: "bg-brand-warning text-white" },
  { role: "WAREHOUSE",      label: "Gudang",    badge: "bg-brand-info text-white" },
  { role: "PURCHASING",     label: "Purchasing",badge: "bg-brand-ink-dark text-white" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState("OWNER");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("demo_active_role");
    if (saved) setActiveRole(saved);
  }, []);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    localStorage.setItem("demo_active_role", role);
  };

  const currentRole = DEMO_ROLES.find((r) => r.role === activeRole);

  return (
    <div className="flex min-h-screen bg-brand-background text-brand-ink-dark">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-ink-dark/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — always visible desktop, drawer on mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:static md:flex",
          sidebarOpen ? "flex" : "hidden md:flex"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Operational Bar */}
        <header className="h-14 border-b border-brand-line bg-brand-surface px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-4">
          {/* Left: mobile hamburger + demo badge */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-brand-surface-alt text-brand-ink-muted"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary-soft text-brand-primary font-bold border border-brand-primary/20 hidden sm:inline-block">
              Showroom FMCG Live
            </span>
          </div>

          {/* Right: shortcuts + role switcher */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 text-brand-ink">
              <span className="text-brand-ink-muted">Shortcut:</span>
              <kbd className="px-1.5 py-0.5 bg-brand-surface-alt border border-brand-line rounded font-mono text-[11px]">F9</kbd>
              <span>Kasir</span>
            </div>

            <div className="hidden lg:block h-4 w-px bg-brand-line" />

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-brand-primary shrink-0" aria-hidden="true" />
              <div className="relative">
                <select
                  value={activeRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  aria-label="Ganti peran demo aktif"
                  className="pl-2 pr-7 py-1 rounded-lg border border-brand-line bg-brand-surface-alt text-brand-ink-dark font-semibold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40 appearance-none max-w-[160px]"
                >
                  {DEMO_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.role}: {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-brand-ink-muted pointer-events-none" />
              </div>
              {currentRole && (
                <span className={`hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${currentRole.badge}`}>
                  {currentRole.label.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-5 lg:p-7 max-w-screen-xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
