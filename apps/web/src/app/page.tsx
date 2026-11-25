import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  Gauge,
  Keyboard,
  Layers,
  Receipt,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-ink-dark selection:bg-brand-primary-soft selection:text-brand-primary">
      {/* Skip to main content — keyboard accessibility */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-primary focus:text-white focus:font-bold focus:text-sm"
      >
        Langsung ke konten utama
      </a>

      {/* ── Top Navigation Bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-brand-line/70 bg-brand-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo variant="full" href="/" iconHeight={32} />

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-xs font-semibold text-brand-ink"
          >
            <a
              href="#fitur"
              className="hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:rounded"
            >
              Fitur Unggulan
            </a>
            <a
              href="#multi-uom"
              className="hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:rounded"
            >
              Multi-UOM &amp; HPP
            </a>
            <a
              href="#komparasi"
              className="hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:rounded"
            >
              Keunggulan
            </a>
            <a
              href="#rbac"
              className="hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:rounded"
            >
              6 Peran RBAC
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg text-brand-ink hover:text-brand-ink-dark hover:bg-brand-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary"
            >
              <span>Coba Demo Gratis</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <main id="konten-utama">
        <section
          aria-labelledby="hero-heading"
          className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Industry Badge */}
              <div
                aria-label="Spesialisasi produk"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary-soft text-brand-primary border border-brand-primary/25 text-xs font-bold tracking-wide"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span>ERP Khusus Micro Distributor &amp; Grosir FMCG / Sembako</span>
              </div>

              {/* Main Value Proposition Headline */}
              <h1
                id="hero-heading"
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-ink-dark leading-[1.12]"
              >
                Kelola Distribusi Grosir Tanpa Selisih Stok &amp; Piutang Macet
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base text-brand-ink-muted max-w-2xl mx-auto leading-relaxed">
                Dari konversi satuan karton ke pcs secara otomatis, HPP modal bergerak setiap kali
                barang masuk, hingga sistem yang otomatis memprioritaskan barang mendekati
                kedaluwarsa — semua berjalan tanpa pengaturan manual.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary"
                >
                  <span>Coba Demo Gratis — Akses Penuh 7 Hari</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href="#fitur"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl border border-brand-line bg-brand-surface hover:bg-brand-surface-alt font-semibold text-sm text-brand-ink transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:rounded-xl"
                >
                  <span>Lihat Fitur Lengkap</span>
                  <ChevronRight className="size-4 text-brand-ink-muted" aria-hidden="true" />
                </a>
              </div>

              {/* Micro Commitments */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-brand-ink-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-brand-success"
                    aria-hidden="true"
                  />
                  Data sembako demo sudah siap diuji
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-brand-success"
                    aria-hidden="true"
                  />
                  Stok gudang tidak bisa minus
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-brand-success"
                    aria-hidden="true"
                  />
                  Tanpa kartu kredit
                </span>
              </div>
            </div>

            {/* ── Interactive Live Preview Mockup Card ──────────────────── */}
            <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
              <figure
                aria-label="Pratinjau tampilan sistem: katalog stok multi-satuan dan kasir"
                className="rounded-3xl border border-brand-line bg-brand-surface shadow-2xl overflow-hidden p-2 sm:p-4"
              >
                {/* Window Header */}
                <div className="px-4 py-2.5 border-b border-brand-line/80 flex items-center justify-between bg-brand-surface-alt/70 rounded-2xl mb-3">
                  <div className="flex items-center gap-2">
                    {/* Traffic light dots — decorative only */}
                    <span className="size-3 rounded-full bg-brand-danger/60" aria-hidden="true" />
                    <span className="size-3 rounded-full bg-brand-warning/60" aria-hidden="true" />
                    <span className="size-3 rounded-full bg-brand-success/60" aria-hidden="true" />
                    <span className="ml-2 font-mono text-xs text-brand-ink-muted">
                      StackPlus ERP · Operasional Kasir &amp; Saldo Stok Fisik
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      aria-label="Hotkey kasir: tombol F9"
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-brand-primary-soft text-brand-primary font-bold"
                    >
                      HOTKEY: F9 KASIR
                    </span>
                    <span className="text-brand-ink-muted hidden sm:inline">
                      Gudang Utama (GDG-01)
                    </span>
                  </div>
                </div>

                {/* Grid Dashboard Mockup */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-1">
                  {/* Left: Saldo Stok Multi-UOM Preview */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-brand-line p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                          Stok Multi-Satuan — Minyak Goreng Sawit 1L
                        </h3>
                        <p className="text-sm font-bold text-brand-ink-dark mt-0.5">
                          BRG-001
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-success-soft text-brand-success font-semibold border border-brand-success/30">
                        Stok Aman
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-brand-primary-soft/40 border border-brand-primary/20 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-brand-ink-muted">Saldo Fisik Gudang</div>
                        <div className="text-base font-extrabold text-brand-primary font-mono mt-0.5">
                          5 Karton · 3 Dus · 4 Pcs
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-brand-ink-muted">Total Satuan Dasar</div>
                        <div className="text-sm font-bold text-brand-ink-dark font-mono">
                          724 Pcs
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-compact">
                      <div className="p-2.5 rounded-lg border border-brand-line bg-brand-surface-alt/50">
                        <div className="text-[11px] text-brand-ink-muted">HPP Modal Rata-Rata</div>
                        <div className="font-mono font-bold text-brand-ink-dark mt-0.5">
                          Rp 11.000 / Pcs
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg border border-brand-line bg-brand-surface-alt/50">
                        <div className="text-[11px] text-brand-ink-muted">
                          Batch Terdekat Kedaluwarsa
                        </div>
                        <div className="font-mono font-bold text-brand-warning mt-0.5">
                          BATCH-2027-01 (67 hari)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Cashier & Credit Limit Preview */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-brand-line p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                          Kasir Cepat &amp; Kontrol Kredit
                        </span>
                        <span
                          className="font-mono text-[10px] text-brand-primary font-bold"
                          aria-label="Status: transaksi aktif"
                        >
                          LIVE
                        </span>
                      </div>
                      <div className="text-compact">
                        <div className="flex justify-between py-1 border-b border-brand-line/60">
                          <span className="text-brand-ink-muted">Pelanggan:</span>
                          <span className="font-semibold text-brand-ink-dark">
                            Toko Berkah Jaya
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-brand-line/60">
                          <span className="text-brand-ink-muted">Limit Kredit:</span>
                          <span className="font-mono font-semibold text-brand-ink-dark">
                            Rp 10.000.000
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-brand-line/60">
                          <span className="text-brand-ink-muted">Piutang Berjalan:</span>
                          <span className="font-mono font-semibold text-brand-warning">
                            Rp 7.500.000
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-brand-surface-alt border border-brand-line text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Total Nota Kasir:</span>
                        <span className="text-brand-primary font-mono text-sm">
                          Rp 1.250.000
                        </span>
                      </div>
                      <div className="text-[10px] text-brand-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        <span>Dalam batas kredit (proyeksi AR: Rp 8.750.000)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Overview & Core Modules Section ─────────────────────────── */}
        <section
          id="fitur"
          aria-labelledby="fitur-heading"
          className="py-12 sm:py-20 bg-brand-surface border-y border-brand-line"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Modul Bisnis Terintegrasi
              </span>
              <h2
                id="fitur-heading"
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-ink-dark"
              >
                Dirancang Khusus Mengatasi Masalah Riil Distributor Sembako
              </h2>
              <p className="text-sm text-brand-ink-muted">
                Bukan software umum yang dipaksakan. Setiap modul dibangun atas skenario nyata
                gudang grosir: pembelian kartonan, penjualan eceran/dus, limit kredit tempo, dan
                alokasi pelunasan bertahap.
              </p>
            </div>

            <ul
              id="multi-uom"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0"
            >
              {/* Feature 1 — primary feature, visual emphasis */}
              <li className="md:col-span-2 lg:col-span-1 p-6 rounded-2xl border-2 border-brand-primary/30 bg-brand-primary-soft/20 hover:border-brand-primary/60 transition-all space-y-3">
                <div
                  className="size-11 rounded-xl bg-brand-primary text-white flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Layers className="size-5" />
                </div>
                <h3 className="font-bold text-base text-brand-ink-dark">
                  Multi-UOM: Karton, Dus, hingga Pcs dalam Satu Produk
                </h3>
                <p className="text-compact text-brand-ink-muted leading-relaxed">
                  Satu barang bisa punya banyak satuan sekaligus — dijual per karton, per dus, atau
                  per pcs. Stok otomatis dikonversi dan ditampilkan dalam format pecahan{" "}
                  <span className="font-mono text-brand-ink-dark">5 Karton 3 Dus 4 Pcs</span>{" "}
                  tanpa hitung manual.
                </p>
                <div className="pt-1">
                  <span className="inline-block text-[11px] font-semibold text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-lg border border-brand-primary/20">
                    Fitur Andalan
                  </span>
                </div>
              </li>

              {/* Feature 2 */}
              <li className="p-6 rounded-2xl border border-brand-line bg-brand-background hover:border-brand-primary/40 transition-all space-y-3">
                <div
                  className="size-11 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Scale className="size-5" />
                </div>
                <h3 className="font-bold text-base text-brand-ink-dark">
                  HPP Modal Dihitung Ulang Tiap Barang Masuk
                </h3>
                <p className="text-compact text-brand-ink-muted leading-relaxed">
                  Setiap kali penerimaan barang datang dengan harga baru, harga pokok rata-rata
                  gudang otomatis diperbarui hingga 4 desimal. Nilai persediaan dan margin laba
                  selalu akurat tanpa rekapitulasi akhir bulan.
                </p>
              </li>

              {/* Feature 3 */}
              <li className="p-6 rounded-2xl border border-brand-line bg-brand-background hover:border-brand-primary/40 transition-all space-y-3">
                <div
                  className="size-11 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <CalendarClock className="size-5" />
                </div>
                <h3 className="font-bold text-base text-brand-ink-dark">
                  Barang Mendekati Kedaluwarsa Keluar Duluan (Otomatis)
                </h3>
                <p className="text-compact text-brand-ink-muted leading-relaxed">
                  Sistem otomatis memilih batch dengan tanggal kedaluwarsa paling dekat saat
                  pengiriman dibuat. Stok lama tidak tertahan di gudang, dan batch yang sudah
                  kedaluwarsa otomatis diblokir dari nota penjualan.
                </p>
              </li>

              {/* Feature 4 */}
              <li className="p-6 rounded-2xl border border-brand-line bg-brand-background hover:border-brand-primary/40 transition-all space-y-3">
                <div
                  className="size-11 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Keyboard className="size-5" />
                </div>
                <h3 className="font-bold text-base text-brand-ink-dark">
                  Kasir Tanpa Sentuhan Mouse (F9 + Barcode USB)
                </h3>
                <p className="text-compact text-brand-ink-muted leading-relaxed">
                  Navigasi penuh lewat keyboard Tab/Enter, cari pelanggan langsung dengan F2, dan
                  scan barcode USB langsung posting ke nota. Transaksi kasir rata-rata selesai dalam
                  200ms dari pemindaian hingga konfirmasi.
                </p>
              </li>

              {/* Feature 5 */}
              <li className="p-6 rounded-2xl border border-brand-line bg-brand-background hover:border-brand-primary/40 transition-all space-y-3">
                <div
                  className="size-11 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <CreditCard className="size-5" />
                </div>
                <h3 className="font-bold text-base text-brand-ink-dark">
                  Kasir Tidak Bisa Posting Jika Limit Kredit Pelanggan Terlampaui
                </h3>
                <p className="text-compact text-brand-ink-muted leading-relaxed">
                  Jika piutang berjalan ditambah nota baru melebihi batas kredit yang ditetapkan,
                  transaksi ditahan dan hanya bisa dilanjutkan dengan password otorisasi Owner.
                  Jejak otorisasi tersimpan otomatis.
                </p>
              </li>

              {/* Feature 6 */}
              <li className="p-6 rounded-2xl border border-brand-line bg-brand-background hover:border-brand-primary/40 transition-all space-y-3">
                <div
                  className="size-11 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Wallet className="size-5" />
                </div>
                <h3 className="font-bold text-base text-brand-ink-dark">
                  Satu Setoran Pelunasan untuk Banyak Nota Sekaligus
                </h3>
                <p className="text-compact text-brand-ink-muted leading-relaxed">
                  Pembayaran dari pelanggan langsung dialokasikan ke beberapa nota piutang
                  sekaligus. Dilengkapi laporan umur piutang: lancar, 1–30 hari, 31–60 hari, dan
                  lebih dari 60 hari.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Comparison Table: StackPlus vs Others ───────────────────── */}
        <section
          id="komparasi"
          aria-labelledby="komparasi-heading"
          className="py-12 sm:py-20 bg-brand-background"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Mengapa StackPlus ERP?
              </span>
              <h2
                id="komparasi-heading"
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-ink-dark"
              >
                Solusi Tepat Dibandingkan Software Akuntansi Umum atau Excel
              </h2>
              <p className="text-sm text-brand-ink-muted">
                Software akuntansi umum seringkali gagal menangani logika pecahan grosir sembako
                dan pergerakan batch fisik di gudang.
              </p>
            </div>

            {/* Responsive scroll wrapper for narrow screens */}
            <div className="overflow-x-auto rounded-2xl border border-brand-line shadow-md">
              <table className="w-full min-w-[560px] text-left text-compact border-collapse bg-brand-surface">
                <caption className="sr-only">
                  Perbandingan fitur StackPlus ERP dengan ERP umum dan Excel
                </caption>
                <thead className="bg-brand-surface-alt border-b border-brand-line text-brand-ink-dark">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-bold w-1/3">
                      Kebutuhan Bisnis Grosir
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 font-bold text-brand-primary w-1/3 bg-brand-primary-soft/30"
                    >
                      StackPlus ERP (FMCG Micro)
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold text-brand-ink-muted w-1/3">
                      ERP Umum / Excel Tradisional
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  <tr className="hover:bg-brand-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                      Konversi Multi-Satuan Pecahan
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-success bg-brand-primary-soft/10">
                      <span aria-label="Ya">✓</span> Otomatis (Karton, Dus, Renceng, Pcs)
                    </td>
                    <td className="px-5 py-3.5 text-brand-danger">
                      <span aria-label="Tidak">✕</span> Manual kalkulasi, rawan selisih pecahan
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                      Perhitungan HPP Modal Barang
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-success bg-brand-primary-soft/10">
                      <span aria-label="Ya">✓</span> Moving average diperbarui saat PO tiba
                    </td>
                    <td className="px-5 py-3.5 text-brand-danger">
                      <span aria-label="Tidak">✕</span> Sering statis atau dihitung akhir bulan
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                      Proteksi Stok Gudang Tidak Bisa Minus
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-success bg-brand-primary-soft/10">
                      <span aria-label="Ya">✓</span> Dikunci di level database, tidak bisa diakali
                    </td>
                    <td className="px-5 py-3.5 text-brand-danger">
                      <span aria-label="Tidak">✕</span> Stok gudang bisa minus, chaos persediaan
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                      Prioritas Barang Mendekati Kedaluwarsa
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-success bg-brand-primary-soft/10">
                      <span aria-label="Ya">✓</span> Otomatis, batch paling dekat kedaluwarsa
                      terpotong dulu
                    </td>
                    <td className="px-5 py-3.5 text-brand-danger">
                      <span aria-label="Tidak">✕</span> Cek fisik manual, barang kedaluwarsa
                      terlewat
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                      Kerahasiaan HPP dari Staf
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-success bg-brand-primary-soft/10">
                      <span aria-label="Ya">✓</span> HPP disembunyikan dari Kasir &amp; Staf Gudang
                    </td>
                    <td className="px-5 py-3.5 text-brand-danger">
                      <span aria-label="Tidak">✕</span> Modal toko terlihat oleh seluruh staf
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-brand-ink-dark">
                      Blokir Transaksi Jika Kredit Pelanggan Habis
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-success bg-brand-primary-soft/10">
                      <span aria-label="Ya">✓</span> Peringatan otomatis + override password Owner
                    </td>
                    <td className="px-5 py-3.5 text-brand-danger">
                      <span aria-label="Tidak">✕</span> Piutang melampaui batas, baru ketahuan
                      saat macet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Role-Based Access Control (RBAC) Section ────────────────── */}
        <section
          id="rbac"
          aria-labelledby="rbac-heading"
          className="py-12 sm:py-20 bg-brand-surface border-t border-brand-line"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Keamanan Hak Akses
              </span>
              <h2
                id="rbac-heading"
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-ink-dark"
              >
                6 Peran Kerja Terpisah untuk Disiplin Operasional
              </h2>
              <p className="text-sm text-brand-ink-muted">
                Masing-masing divisi memiliki wewenang yang tegas untuk mencegah kebocoran
                informasi modal dan fraud transaksi.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0">
              <li className="p-5 rounded-2xl border border-brand-line bg-brand-background space-y-2 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-ink-dark">1. Owner / Direktur</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-primary text-white font-bold">
                    FULL ACCESS
                  </span>
                </div>
                <p className="text-xs text-brand-ink-muted">
                  Akses seluruh laporan laba rugi, HPP modal riil, margin kotor, dan wewenang
                  override batas kredit pelanggan.
                </p>
              </li>

              <li className="p-5 rounded-2xl border border-brand-line bg-brand-background space-y-2 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-ink-dark">2. Finance &amp; AR</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-success text-white font-bold">
                    KEUANGAN
                  </span>
                </div>
                <p className="text-xs text-brand-ink-muted">
                  Pengelolaan pelunasan piutang, mutasi buku kas &amp; rekening bank, dan laporan
                  umur piutang.
                </p>
              </li>

              <li className="p-5 rounded-2xl border border-brand-line bg-brand-background space-y-2 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-ink-dark">3. Kasir Toko</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-warning text-white font-bold">
                    HPP TERSEMBUNYI
                  </span>
                </div>
                <p className="text-xs text-brand-ink-muted">
                  Fokus transaksi kasir cepat (F9) dan cetak nota faktur. Harga beli dan HPP modal
                  tidak terlihat sama sekali.
                </p>
              </li>

              <li className="p-5 rounded-2xl border border-brand-line bg-brand-background space-y-2 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-ink-dark">4. Kepala Gudang</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-info text-white font-bold">
                    HPP TERSEMBUNYI
                  </span>
                </div>
                <p className="text-xs text-brand-ink-muted">
                  Pantau saldo fisik multi-satuan, cek mutasi barang per gudang, transfer
                  antar-gudang, dan pengawasan batch mendekati kedaluwarsa.
                </p>
              </li>

              <li className="p-5 rounded-2xl border border-brand-line bg-brand-background space-y-2 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-ink-dark">5. Staf Pengadaan</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-ink-dark text-white font-bold">
                    PURCHASING
                  </span>
                </div>
                <p className="text-xs text-brand-ink-muted">
                  Terbitkan Purchase Order ke supplier dan konfirmasi penerimaan fisik barang ke
                  gudang tujuan.
                </p>
              </li>

              <li className="p-5 rounded-2xl border border-brand-line bg-brand-background space-y-2 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-ink-dark">6. Super Admin</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-surface-alt text-brand-ink-dark border border-brand-line font-bold">
                    SISTEM
                  </span>
                </div>
                <p className="text-xs text-brand-ink-muted">
                  Manajemen akun karyawan, konfigurasi gudang, tenant multi-perusahaan, dan
                  pemeliharaan master data.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Final Call to Action Banner ─────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          className="py-12 sm:py-20 bg-brand-primary text-white"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-white">
              Uji Coba Sekarang Tanpa Biaya
            </span>
            <h2
              id="cta-heading"
              className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
            >
              Lihat Langsung Bagaimana StackPlus Mengelola Gudang &amp; Kasir Anda
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Masuk ke showroom demo dengan data sembako yang sudah terisi. Coba kasir F9, periksa
              stok multi-satuan, dan atur batas kredit pelanggan — langsung tanpa instalasi.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-primary hover:bg-brand-background font-extrabold text-base shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              >
                <span>Buka Demo — Akses Penuh 7 Hari</span>
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-brand-background border-t border-brand-line text-xs text-brand-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo variant="full" href="/" iconHeight={28} />

          <nav aria-label="Tautan footer">
            <ul className="flex items-center gap-6 list-none p-0">
              <li>
                <Link
                  href="/login"
                  className="hover:text-brand-ink-dark transition-colors font-medium"
                >
                  Login Karyawan
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-brand-ink-dark transition-colors font-medium"
                >
                  Akun Trial 7 Hari
                </Link>
              </li>
              <li>
                <a
                  href="#fitur"
                  className="hover:text-brand-ink-dark transition-colors font-medium"
                >
                  Fitur Lengkap
                </a>
              </li>
            </ul>
          </nav>

          <div className="text-center sm:text-right">
            <div>© {new Date().getFullYear()} StackPlus Studio. Hak Cipta Dilindungi.</div>
            <div className="text-[11px] mt-0.5">Micro Distributor &amp; Grosir FMCG ERP System</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
