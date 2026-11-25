# 🚀 StackPlus ERP — Multi-Tenant Distribution & Wholesale ERP System

> **Status Proyek**: Production Ready · **Versi**: 1.0.0 · **Lisensi**: Proprietary (Stack Plus Studio)

**StackPlus ERP** adalah platform Enterprise Resource Planning (ERP) modern berbasis web yang dirancang khusus untuk bisnis distributor, grosir, dan FMCG (*Fast-Moving Consumer Goods*). Dibangun dengan arsitektur **Turborepo Monorepo** kelas *enterprise*, sistem ini mendukung multi-tenant (multi-perusahaan/cabang), multi-satuan bertingkat (*multi-tier UOM*), kalkulasi HPP *Moving Average* otomatis, pelacakan kedaluwarsa berbasis FEFO (*First-Expired, First-Out*), dan kasir POS berkecepatan tinggi.

---

## 🏛️ Arsitektur Monorepo & Tech Stack

```text
web-erp/
├── apps/
│   ├── api/                    # Backend REST API (NestJS 11, Helmet, JWT, Throttler)
│   │   ├── src/
│   │   │   ├── auth/           # Otentikasi JWT, Multi-Tenant Guard, RBAC Roles
│   │   │   ├── master/         # Master Data (Produk, Satuan UOM, Kontak, Gudang)
│   │   │   ├── inventory/      # Stok, FEFO Batching, Moving Average HPP
│   │   │   ├── sales/          # Kasir Cepat POS, Faktur Penjualan, Credit Limit Guard
│   │   │   ├── purchasing/     # Purchase Order (PO) & Penerimaan Barang (GR)
│   │   │   ├── finance/        # Kas & Bank, Multi-Invoice Payment, AR Aging
│   │   │   └── reports/        # Laba Kotor per Faktur, Laba Rugi (P&L)
│   │   └── test/               # Jest Unit Tests & Supertest E2E Security Tests
│   │
│   └── web/                    # Frontend Web App & Landing Page (Next.js 16, Tailwind v4)
│       ├── src/
│       │   ├── app/            # App Router (Landing Page, Auth, Dashboard Modul)
│       │   ├── components/     # UI Design System (Pill buttons, Cards, Badges)
│       │   └── lib/            # Axios instance terpusat dengan Cookie Auth
│       └── e2e/                # Playwright End-to-End Automation Tests
│
├── packages/
│   └── database/               # Prisma ORM v5 Schema, Migrations, & Seed Data FMCG
│
├── docs/                       # Dokumentasi Teknis, Desain UI, & SOP Testing
└── .github/workflows/          # Pipeline Otomasi CI/CD (Quality Gate & Security Scan)
```

### Ringkasan Teknologi Utama
| Layer | Komponen & Versi | Deskripsi & Peran |
|---|---|---|
| **Frontend** | Next.js 16 (React 19, Turbopack) | App Router modern, server & client components, proxy API rewrite |
| **Styling** | Tailwind CSS v4 | Utility-first CSS sesuai design tokens [`docs/ui.md`](./docs/ui.md) |
| **Backend** | NestJS 11 | Arsitektur modular, Dependency Injection, ValidationPipe |
| **Database** | PostgreSQL + Prisma ORM v5 | Skema relasional multi-tenant, migrasi SQL, atomik transaksi |
| **Keamanan** | Helmet, Throttler, JWT, RBAC | Proteksi IDOR, sanitasi input, rate limiting, dual-token auth |
| **Testing** | Jest, Supertest, Playwright | Unit Test (coverage > 70%), API Security E2E, Browser UI E2E |
| **Tooling** | Turborepo & pnpm v9 | Build caching, remote execution, pipeline task monorepo |

---

## 📦 Fitur Unggulan (PRD Milestone 1 — 5)

### 1. Fondasi Multi-Tenant & Multi-Satuan (UOM Bertingkat)
- **Multi-Tenant Isolation**: Setiap entitas bisnis terisolasi secara aman menggunakan `tenantId` pada setiap baris data.
- **Hierarki Satuan Bertingkat**: Konversi dinamis satuan barang bertingkat (contoh: 1 Dus = 12 Pak = 144 Pcs) dengan konversi ke unit terkecil secara presisi.
- **Multi-Tier Harga Jual**: Mendukung variasi harga bertingkat untuk kategori pelanggan berbeda (*Retail*, *Semi-Grosir*, *Grosir*).

### 2. Multi-Gudang & Inventori FEFO (Moving Average HPP)
- **FEFO Batch Tracking**: Pelacakan nomor batch produksi dan tanggal kedaluwarsa (*expiry date*) untuk mencegah produk basi keluar ke pelanggan.
- **Kalkulasi HPP Dinamis**: Perhitungan Harga Pokok Penjualan (HPP) otomatis menggunakan metode rata-rata tertimbang (*Moving Average*) setiap kali terjadi transaksi pembelian baru.
- **Penerimaan Barang PO**: Alur pemesanan pembelian (PO) dan penerimaan fisik barang (*Goods Receipt*) yang langsung memperbarui stok fisik dan nilai HPP gudang.

### 3. Kasir Penjualan Cepat (Fast POS) & Guard Limit Kredit
- **Keyboard-Driven POS**: Akses cepat kasir dengan hotkey keyboard (`F2` Cari Pelanggan, `F4` Tambah Barang, `F9` Simpan/Bayar) dan kompatibilitas penuh dengan USB Barcode Scanner.
- **Credit Limit Enforcement (FR-004)**: Penolakan otomatis transaksi tempo jika sisa batas kredit pelanggan terlampaui, dilengkapi mekanisme *Manager/Owner Override* yang tercatat di audit log.
- **Snapshot HPP Real-Time**: HPP dicatat pada saat faktur diterbitkan untuk menjamin akurasi laporan laba kotor historis.

### 4. Manajemen Piutang (AR Aging) & Kas Multi-Akun
- **Pelunasan Multi-Invoice (FR-005)**: Pembayaran piutang pelanggan dapat dialokasikan ke beberapa faktur sekaligus dalam satu kali transaksi pembayaran.
- **Buku Kas & Bank**: Pencatatan mutasi kas masuk dan kas keluar lintas rekening kas toko/bank.
- **Laporan Umur Piutang (AR Aging)**: Pengelompokan piutang jatuh tempo dalam rentang waktu: *Belum Jatuh Tempo*, *1–30 Hari*, *31–60 Hari*, dan *>60 Hari*.
- **Retur Penjualan (FR-007)**: Penanganan pengembalian barang rusak atau salah kirim dengan pemulihan stok dan pengurangan saldo piutang.

### 5. Laporan Finansial Manajerial & Demo Showroom
- **Laporan Laba Kotor per Faktur**: Rincian margin keuntungan kotor faktur per faktur (*Omzet vs HPP vs Gross Profit*).
- **Laporan Laba Rugi (P&L)**: Ringkasan pendapatan, beban pokok penjualan, beban operasional, dan laba bersih usaha.
- **1-Click Demo Showroom**: 6 akun demo siap pakai di halaman login (`/login`) untuk presentasi klien instan (Trial, Owner, Finance, Kasir, Gudang, Purchasing).

---

## ⚡ Panduan Memulai Cepat (Quick Start)

### Prasyarat Sistem
- **Node.js**: Versi `>= 20.x`
- **pnpm**: Versi `>= 9.x` (`npm install -g pnpm`)
- **PostgreSQL**: Versi `>= 15.x` (Local, Docker, Supabase, atau Neon)

### 1. Kloning & Instalasi Dependensi
```bash
git clone <repository-url>
cd web-erp
pnpm install
```

### 2. Konfigurasi Variabel Lingkungan
Salin file `.env.example` ke `.env` di root direktori serta di `apps/api/.env` dan `apps/web/.env.local`:
```bash
cp .env.example .env
```
Pastikan `DATABASE_URL` mengarah ke database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web_erp?schema=public"
JWT_SECRET="super-secret-jwt-key-minimum-32-characters-long"
JWT_REFRESH_SECRET="super-secret-refresh-jwt-key-32-characters"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Migrasi & Seeding Data FMCG
Jalankan migrasi skema database dan masukkan data simulasi FMCG:
```bash
pnpm db:generate
pnpm db:push
pnpm --filter @cahyodev/database db:seed
```

### 4. Menjalankan Aplikasi dalam Mode Pengembangan
Jalankan frontend dan backend secara bersamaan menggunakan satu perintah root:
```bash
pnpm dev
```
Aplikasi akan aktif di:
- **Landing Page & Web App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🧪 Pengujian Otomatis & Standar Kualitas

Sistem dilengkapi rangkaian pengujian otomatis bertingkat sesuai [docs/testing-runbook.md](./docs/testing-runbook.md):

```bash
# 1. Typecheck TypeScript seluruh paket
pnpm typecheck

# 2. Linting kode (ESLint + Prettier)
pnpm lint

# 3. Unit Test Backend & Coverage (Jest)
pnpm test:cov

# 4. API Security & E2E Integration (Supertest)
pnpm --filter api test:e2e

# 5. Browser End-to-End Testing (Playwright)
pnpm --filter web test:e2e

# 6. Kompilasi Produksi (Production Build)
pnpm build
```

---

## 🔄 Pipeline CI/CD (GitHub Actions)

Setiap *Pull Request* atau *Push* ke branch `main`, `feat/*`, `fix/*`, dan `chore/*` otomatis menjalankan alur verifikasi mutu di `.github/workflows/ci.yml`:
1. **Setup Environment**: Node.js 20, pnpm v9, PostgreSQL 16 container.
2. **Database Migration**: Generate Prisma Client & Migrate Test DB.
3. **Typecheck & Lint**: Validasi tipe data ketat dan standar kode ESLint.
4. **Unit & Security Tests**: Eksekusi seluruh suite pengujian dengan pelaporan coverage.
5. **API E2E Tests**: Pengujian endpoint kritis terhadap ancaman SQLi dan validasi payload.
6. **Production Build**: Kompilasi artefak web Next.js dan NestJS API.
7. **Docker Validation**: Pengecekan multi-stage Dockerfile untuk container deployment.
8. **Security Scan (`security.yml`)**: Pemindaian rahasia bocor (*Gitleaks*) dan kerentanan dependensi (*Trivy*).

---

## 📄 Hak Cipta & Lisensi

Dikembangkan oleh **Stack Plus Studio**. Hak Cipta Dilindungi Undang-Undang.
Dokumentasi internal dan standar arsitektur dapat diakses di folder [`docs/`](./docs).
