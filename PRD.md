# 📋 Product Requirements Document (PRD) — StackPlus ERP Micro Distributor & Grosir

> **Status Dokumen**: Active Master Blueprint · **Versi**: v2.0 (Optimized Core Edition) · **Terakhir Diperbarui**: 22 November 2026  
> **Referensi Standar**: `docs/prd-template.md`, `docs/ui.md` (UI System V3), `docs/database-standards.md`, `docs/security-rules.md`, `docs/coding-standards.md`  
> **Konteks**: Diadaptasi dan disempurnakan dari PRD asli ERP Micro Distributor (23 Oktober 2026) agar selaras 100% dengan ekosistem monorepo Maincore StackPlus Studio. Dokumen ini mendefinisikan sistem operasional distributor & grosir (FMCG, sembako, material, farmasi bebas) siap bangun dari nol.

---

# PRD — StackPlus ERP: Back-Office & Distribution Management System

| Parameter | Data Proyek |
|---|---|
| **Produk** | StackPlus ERP (Micro Distributor & Grosir) |
| **Pemilik Produk** | StackPlus Studio (Product Studio Initiative) |
| **Versi PRD** | v2.0 |
| **Status** | Disetujui untuk Pengerjaan (Approved) |
| **Lead Architect** | Budi Cahyono (Senior Architect & Founder) |
| **Engineering Team** | Core Engine Fullstack Team |
| **Target Demo Publik** | `erp.stackplustudio.com` (Portfolio Showroom & Production-Ready) |

---

## 1. Value & Tujuan Bisnis (Why & Value)

### 1.1 Problem Statement
1. **Kebocoran Stok & Selisih Fisik Multi-Satuan:** Distributor grosir menjual barang dalam ragam satuan (Dus $\rightarrow$ Pak $\rightarrow$ Pcs). Pencatatan manual sering memicu selisih stok fisik, barang hilang, dan kekeliruan perhitungan stok dasar.
2. **HPP Bergeser & Margin Fiktif:** Harga beli dari prinsipal/supplier fluktuatif. Tanpa metode *Moving Average Costing* yang presisi dan tercatat *real-time*, distributor sering menjual di bawah modal sebenarnya (*margin bocor*).
3. **Barang Rusak/Kadaluarsa (Expired Loss):** Pada sektor sembako, makanan/minuman, dan kosmetik, ketiadaan sistem alokasi batch dan *First Expired, First Out* (FEFO) menyebabkan barang lama menumpuk di pojok gudang hingga kadaluarsa.
4. **Piutang Macet (Bad Debt):** Sales toko sering memberikan tempo kredit melebihi batas plafon pelanggan (*credit limit*), memicu arus kas (*cash flow*) distributor macet.
5. **Software ERP Terlalu Rumit & Lambat:** Software ERP konvensional (SAP, Odoo, Accurate) terlalu mahal, birokratis, lambat diakses kasir kantor, dan memerlukan pelatihan berminggu-minggu.

### 1.2 Solusi Produk
StackPlus ERP menghadirkan platform **ERP back-office berkecepatan tinggi, ringan, dan presisi** untuk distributor beromzet menengah:
* **True Multi-UOM:** Seluruh kalkulasi stok otomatis dikonversi ke satuan dasar (*base unit*) terkecil secara matematis eksak.
* **Real-time Moving Average HPP & FEFO:** HPP dihitung ulang setiap penerimaan barang; alokasi penjualan otomatis merekomendasikan batch kadaluarsa terdekat.
* **Fast-Paced Keyboard-Driven Sales:** Antarmuka input penjualan didesain untuk kasir kantor dengan navigasi keyboard penuh (tanpa mouse) dan dukungan Barcode Scanner USB.
* **Credit Limit Enforcement:** Pemblokiran otomatis nota kredit yang melebihi plafon piutang dengan alur *override* terkontrol oleh Owner/Finance.
* **Integrated Cash & AR/AP Aging:** Pencatatan kas, piutang, dan hutang otomatis terbentuk dalam satu transaksi atomik.

### 1.3 Business Metric (Target Keberhasilan Produk)
* **Kecepatan Entri Penjualan:** Kasir kantor mampu menyelesaikan 1 transaksi grosir (10 baris item) dalam waktu < 90 detik menggunakan keyboard/barcode.
* **Presisi Stok:** Selisih stok sistem vs fisik saat opname ditekan hingga < 0.5%.
* **Akurasi HPP & Margin:** 100% margin kotor dapat ditelusuri riwayatnya (*audit trail*) ke dokumen penerimaan barang.
* **Performa API (p95):** Latensi query produk/stok/autocomplete < 300 ms pada volume 10.000 SKU produk.

---

## 2. Karakter Produk & Parameter UI (Sesuai `docs/ui.md`)

*Sesuai panduan UI System V3, StackPlus ERP dikategorikan sebagai **Product UI Operasional (ERP)** dengan karakteristik: padat data, kontras tinggi, hierarki kaku, dan bebas elemen dekoratif yang memperlambat pekerjaan.*

| Parameter UI | Spesifikasi Desain | Catatan Implementasi di Kode |
|---|---|---|
| **Karakter Produk** | **ERP** (Enterprise Resource Planning - Operasional) | Fokus pada efisiensi entri data, keterbacaan angka, dan kecepatan kerja staf. |
| **Kepadatan Tampilan (Density)** | *Compact* (Tabel & Editor Transaksi) & *Comfortable* (Form Master) | Tinggi baris tabel 36–40px, font `text-compact` (13px/18px) untuk data angka, `text-sm` (14px) untuk teks utama. |
| **Lebar Kontainer Utama** | Wide (1280px) & Extra-Wide (1440px / Fluid) | Editor transaksi (SO/PO) dan tabel mutasi stok meluas hingga 1440px dengan horizontal scroll aman di dalam kontainer. |
| **Layout & Navigasi** | Desktop-First: Sidebar Desktop (Expanded 240px / Collapsed 72px) | Menu dikelompokkan per modul bisnis (Master, Inventory, Sales, Purchasing, Finance, Reports). |
| **Input & Interaksi Cepat** | **Keyboard-First Navigation** | Tombol Tab & Enter berpindah antar sel tabel, panah keyboard memilih autocomplete, shortcut posting dokumen (`F9` / `Ctrl+Enter`). |
| **Dukungan Barcode** | Pemindai Barcode USB (Mode Keyboard Emulation) | Pemindaian barcode otomatis mencari SKU/satuan yang cocok dan menambahkan baris transaksi tanpa klik mouse. |
| **Format Angka & Uang** | Rata Kanan dengan Utility `tabular-nums` | Nilai uang diformat `Rp 1.250.000` tanpa desimal; kuantitas multi-satuan diformat `5 Dus 3 Pak 2 Pcs`. |
| **Dukungan Tema** | Light Mode Resmi (Standar V3) | Surface `#FDFBF7`, background `#FCFBF6`, border interaktif `brand-line-strong` (`#8F897E`). Dilarang dark mode pada MVP. |

---

## 3. Matriks Pengguna & Hak Akses (RBAC)

*Pemisahan peran berjenjang (*role-based permissions*) terlindungi ketat melalui `RolesGuard` dan `PermissionsGuard` di lapisan controller NestJS.*

| Peran (Role) | Deskripsi | Akses Route Frontend | Hak Akses Data Backend |
|---|---|---|---|
| **SUPER_ADMIN** | Tim StackPlus (Platform Maintenance) | `/superadmin/*` | Monitoring lisensi tenant demo, backup global, health probe. Tidak melihat data transaksi bisnis. |
| **OWNER** | Pemilik Toko / Distributor | `/dashboard/*` (Semua Modul) | Hak penuh: setujui override limit kredit, ubah harga, void dokumen, lihat HPP & laporan laba rugi. |
| **FINANCE** | Admin Keuangan & Penagihan | `/sales/payments`, `/purchasing/payments`, `/finance/*`, `/reports/*` | Catat pembayaran piutang/hutang, mutasi kas/bank, cetak kwitansi, lihat aging & laporan laba kotor. |
| **ORDER_CASHIER**| Kasir Kantor & Staf Order | `/sales/orders`, `/sales/invoices`, `/sales/returns`, `/master/customers` | Input SO/Invoice, cetak surat jalan, cek stok gudang. **DILARANG melihat HPP, harga beli, dan margin.** |
| **WAREHOUSE** | Staf / Kepala Gudang | `/inventory/*`, `/purchasing/receipts`, `/purchasing/returns` | Penerimaan barang fisik, opname, transfer gudang, penyesuaian stok. **DILARANG melihat harga beli & HPP.** |
| **PURCHASING** | Staf Pengadaan Barang | `/purchasing/orders`, `/master/suppliers`, `/inventory/stock` | Buat PO ke supplier, monitor barang datang, analisa kebutuhan stok menipis. |

---

## 4. Ruang Lingkup Produk (Scope Boundary)

### In-Scope (Fitur Komersial v2.0)
1. **Multi-Tenancy & Gudang:** Isolasi data berbasis `tenantId` dan pembatasan scope staf gudang per `warehouseId`.
2. **Master Data & Multi-UOM Hierarkis:**
   - Produk multi-satuan (Dus, Pak, Pcs) dengan faktor konversi eksak terhadap satuan dasar.
   - Level harga pelanggan (Grosir Besar, Grosir Kecil, Eceran) & harga khusus per pelanggan (*contract price*).
3. **Manajemen Persediaan & HPP Moving Average:**
   - Pencatatan stok multi-gudang berbasis kartu stok tunggal (*single ledger* `StockMovement`).
   - Perhitungan otomatis HPP bergerak (*Moving Average*) per produk per gudang saat penerimaan barang.
   - Pelacakan Batch & Tanggal Kadaluarsa (Expired Date) dengan rekomendasi pengeluaran **FEFO**.
   - Stok Opname berkala & Penyesuaian Stok (*Adjustment*) dengan jejak audit alasan.
   - Transfer Stok antar gudang (Status: *Requested* $\rightarrow$ *In-Transit* $\rightarrow$ *Received*).
4. **Alur Pembelian (Purchasing):**
   - Purchase Order (PO) $\rightarrow$ Penerimaan Barang Parsial/Penuh (*Goods Receipt*) $\rightarrow$ Faktur Pembelian Supplier $\rightarrow$ Pembayaran Hutang Usaha (AP).
5. **Alur Penjualan Grosir (Sales & Distribution):**
   - Sales Order (SO) $\rightarrow$ Faktur Penjualan (Invoice) $\rightarrow$ Surat Jalan (*Delivery Note*).
   - Validasi limit kredit pelanggan + mekanisme *Override Limit* beralasan oleh Owner/Finance.
   - Cetak Faktur A4/A5 PDF dan format struk kasir matrix 80mm.
   - Pembayaran Piutang Usaha (AR) bertahap/penuh (*Multi-Invoice Settlement*).
   - Retur Penjualan & Retur Pembelian otomatis membalik stok dan menghasilkan Nota Kredit/Debit.
6. **Kas & Bank Sederhana:**
   - Multi-akun kas (Kasir Toko, Rekening BCA, Rekening Mandiri).
   - Mutasi kas otomatis dari pembayaran piutang/hutang serta pencatatan biaya operasional.
7. **Laporan & Dashboard Manajerial:**
   - Dashboard analitik: Piutang & Hutang jatuh tempo (Aging 0, 1-30, 31-60, >60 hari), stok kritis/expired.
   - Laporan Laba Kotor per Invoice dan Laporan Laba Rugi Sederhana (Omzet - HPP - Biaya Operasional).
   - Ekspor laporan ke Excel (XLSX) dan PDF.

### Out-of-Scope (Fase Lanjutan / Tidak Dikerjakan Sekarang)
* Integrasi mesin kasir POS offline (sistem berbasis web online real-time).
* Aplikasi mobile sales keliling (*Sales Canvasser Native App* dengan pelacakan GPS rute).
* Sistem akuntansi buku besar resmi (*General Ledger, Jurnal Memorial Debit/Kredit Kompleks*).
* Integrasi otomatis e-Faktur DJP (faktur pajak manual via nomor seri PPN).

---

## 5. Spesifikasi Fitur & Acceptance Criteria (BDD)

### FR-001: Konversi Satuan Multi-UOM Eksak
* **Prioritas**: Must Have (P0)
* **Kriteria Pengujian (Acceptance Criteria)**:
  * **Skenario 1 (Konversi Multi-Tingkat ke Satuan Dasar)**:
    * *Given* produk `"Minyak Goreng 1L"` memiliki satuan dasar `Pcs`.
    * *And* didefinisikan satuan `Dus` (faktor 12 ke Pcs) dan `Karton Besar` (faktor 48 ke Pcs).
    * *When* staf gudang menerima 5 Karton Besar dan 3 Dus.
    * *Then* sistem mengonversi stok masuk menjadi: $(5 \times 48) + (3 \times 12) = 240 + 36 = 276 \text{ Pcs}$ pada tabel `Stock`.
  * **Skenario 2 (Tampilan Format Multi-Satuan Pecah)**:
    * *Given* stok fisik minyak goreng di sistem berjumlah $280 \text{ Pcs}$.
    * *When* staf melihat daftar stok di layar antarmuka.
    * *Then* sistem menampilkan teks `5 Karton 3 Dus 4 Pcs` dengan angka eksak `280 Pcs` pada kartu stok.

### FR-002: Perhitungan Otomatis HPP Moving Average
* **Prioritas**: Must Have (P0)
* **Kriteria Pengujian**:
  * *Given* stok produk A di Gudang Utama saat ini $100 \text{ Pcs}$ dengan HPP tercatat $\text{Rp } 10.000/\text{Pcs}$ (Total nilai persediaan = Rp 1.000.000).
  * *When* staf gudang memposting Penerimaan Barang baru sebanyak $50 \text{ Pcs}$ dengan harga beli modal $\text{Rp } 13.000/\text{Pcs}$.
  * *Then* sistem menghitung HPP baru:
    $$\text{HPP Baru} = \frac{(100 \times 10.000) + (50 \times 13.000)}{100 + 50} = \frac{1.000.000 + 650.000}{150} = \text{Rp } 11.000/\text{Pcs}$$
  * *And* menyimpan snapshot HPP Rp 11.000 pada tabel biaya produk gudang dan mutasi stok terkait.

### FR-003: Alokasi Batch Pengeluaran Barang FEFO (First Expired, First Out)
* **Prioritas**: Must Have (P0)
* **Kriteria Pengujian**:
  * *Given* di gudang terdapat Batch B1 ($40 \text{ Pcs}$, Expired: 15 Jan 2027) dan Batch B2 ($60 \text{ Pcs}$, Expired: 10 Mar 2027).
  * *When* kasir membuat faktur penjualan untuk $50 \text{ Pcs}$.
  * *Then* sistem otomatis mengalokasikan: $40 \text{ Pcs}$ diambil dari Batch B1 dan sisa $10 \text{ Pcs}$ diambil dari Batch B2.
  * *And* menolak secara otomatis alokasi dari batch yang tanggal kadaluarsanya sudah terlewati.

### FR-004: Penjualan Kredit & Penegakan Limit Piutang (Credit Limit)
* **Prioritas**: Must Have (P0)
* **Kriteria Pengujian**:
  * **Skenario 1 (Melebihi Plafon Kredit Ditolak)**:
    * *Given* Toko Berkah memiliki sisa limit piutang Rp 2.000.000 (dari total limit Rp 10.000.000).
    * *When* kasir mencoba memposting invoice kredit sebesar Rp 2.500.000.
    * *Then* sistem menolak dengan HTTP 409 Conflict (`CREDIT_LIMIT_EXCEEDED`) dan memblokir pencetakan nota.
  * **Skenario 2 (Mekanisme Override Limit oleh Owner)**:
    * *Given* invoice diblokir karena limit kredit terlampaui.
    * *When* Owner memasukkan password otorisasi dan mengisi alasan: `"Pelanggan VIP, janji bayar sore ini"`.
    * *Then* invoice berhasil diposting, stok berkurang, dan log otorisasi tercatat permanen di `AuditLog`.

### FR-005: Siklus Pembayaran Piutang Multi-Invoice (AR Settlement)
* **Prioritas**: Must Have (P0)
* **Kriteria Pengujian**:
  * *Given* Toko Berkah memiliki Invoice INV-001 (Sisa Rp 1.000.000) dan INV-002 (Sisa Rp 1.500.000).
  * *When* Finance menginput pembayaran transfer sebesar Rp 2.000.000 ke rekening BCA.
  * *Then* sistem melunasi penuh INV-001 (Status `PAID`), mengurangi sisa INV-002 menjadi Rp 500.000 (Status `PARTIAL`), dan menambah saldo akun Kas BCA sebesar Rp 2.000.000 secara atomik.

### FR-006: Transfer Stok Antar Gudang
* **Prioritas**: Should Have (P1)
* **Kriteria Pengujian**:
  * *Given* Gudang Pusat mengirimkan 20 Dus ke Toko Cabang.
  * *When* status transfer diubah menjadi `SHIPPED`.
  * *Then* stok fisik berkurang di Gudang Pusat dan tercatat dalam status `IN_TRANSIT`.
  * *When* staf Toko Cabang mengonfirmasi penerimaan (`RECEIVED`).
  * *Then* stok fisik bertambah di Toko Cabang dengan HPP yang terbawa dari gudang asal.

### FR-007: Siklus Retur Penjualan (Sales Return)
* **Prioritas**: Should Have (P1)
* **Kriteria Pengujian**:
  * *Given* pelanggan mengembalikan 2 Dus barang rusak dari faktur INV-001.
  * *When* retur penjualan disetujui.
  * *Then* stok bertambah kembali di gudang, piutang pelanggan berkurang sebesar nominal retur via Nota Kredit, dan kartu stok mencatat mutasi jenis `SALE_RETURN`.

---

## 6. Kebijakan & Rancangan Database (`docs/database-standards.md`)

### 6.1 Keputusan Arsitektur Data
* **Isolasi Multi-Tenant Mutlak:** Setiap tabel memiliki kolom `tenantId String` terindeks. Akses data antar penyewa diblokir di level query.
* **Integritas Transaksi Atomik:** Setiap perubahan dokumen (Posting SO/PO/Invoice) wajib dieksekusi di dalam `prisma.$transaction`. Stok dan piutang/hutang **DILARANG** berubah parsial jika terjadi kegagalan sistem.
* **Kebijakan Soft Delete:** Model master (`Product`, `Customer`, `Supplier`, `Warehouse`) dan dokumen transaksi menerapkan `deletedAt DateTime?`. Data transaksi terposting tidak boleh dihapus permanen.
* **Aturan Tipe Angka:**
  * Seluruh kuantitas stok disimpan dalam satuan dasar terkecil sebagai integer (`qtyBase: Int`).
  * Seluruh nilai nominal mata uang disimpan dalam satuan integer Rupiah bulat (`BigInt`/`Int`). Dilarang `Float`.
  * HPP dan biaya per satuan dasar disimpan menggunakan tipe `Decimal(18, 4)` untuk mencegah distorsi pembulatan moving average.

### 6.2 Prisma Schema Preview (Entitas Inti ERP)

```prisma
// Penyewa Multi-Tenant Platform
model Tenant {
  id              String         @id @default(cuid())
  name            String         // Nama Toko / Distributor
  subdomain       String         @unique
  businessPhone   String?
  address         String?
  taxNumber       String?        // NPWP Distributor
  isPkp           Boolean        @default(false)
  defaultTaxRate  Int            @default(11) // PPN 11%
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  users           User[]
  warehouses      Warehouse[]
  products        Product[]
  priceTiers      PriceTier[]
  customers       Customer[]
  suppliers       Supplier[]
  cashAccounts    CashAccount[]
  salesInvoices   SalesInvoice[]
  purchaseOrders  PurchaseOrder[]
  auditLogs       AuditLog[]

  @@index([subdomain])
}

// Multi-Gudang
model Warehouse {
  id              String         @id @default(cuid())
  tenantId        String
  name            String         // "Gudang Utama", "Gudang Transit"
  code            String         // "GDG-01"
  address         String?
  isActive        Boolean        @default(true)
  deletedAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  stocks          Stock[]
  stockMovements  StockMovement[]
  productCosts    WarehouseProductCost[]

  @@unique([tenantId, code])
  @@index([tenantId])
}

// Master Produk Multi-UOM
model Product {
  id              String         @id @default(cuid())
  tenantId        String
  sku             String         // "BRG-001"
  name            String
  category        String?
  brand           String?
  baseUnitName    String         // Satuan terkecil: "Pcs", "Kg", "Btl"
  trackBatch      Boolean        @default(false)
  minStockAlert   Int            @default(10) // Dalam satuan dasar
  isActive        Boolean        @default(true)
  deletedAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  units           ProductUnit[]
  stocks          Stock[]
  stockMovements  StockMovement[]
  costs           WarehouseProductCost[]
  batches         Batch[]

  @@unique([tenantId, sku])
  @@index([tenantId, name])
}

// Satuan Bertingkat (Multi-UOM)
model ProductUnit {
  id              String         @id @default(cuid())
  productId       String
  name            String         // "Dus", "Pak", "Pcs"
  factorToBase    Int            // Pengali ke base unit (Dus = 144)
  barcode         String?        // EAN-13 / UPC barcode scanner
  purchasePrice   BigInt         // Harga beli modal default
  salePrice       BigInt         // Harga jual eceran/default
  isBase          Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  product         Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  tierPrices      ProductPriceTier[]
  invoiceItems    SalesInvoiceItem[]

  @@index([productId])
  @@index([barcode])
}

// Level Harga Pelanggan (Grosir Besar, Grosir Kecil)
model PriceTier {
  id              String         @id @default(cuid())
  tenantId        String
  name            String         // "Grosir Besar", "Semi Grosir", "Ecer"
  isDefault       Boolean        @default(false)

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customers       Customer[]
  tierPrices      ProductPriceTier[]

  @@unique([tenantId, name])
}

model ProductPriceTier {
  id              String         @id @default(cuid())
  productUnitId   String
  priceTierId     String
  price           BigInt         // Harga khusus level tersebut

  productUnit     ProductUnit    @relation(fields: [productUnitId], references: [id], onDelete: Cascade)
  priceTier       PriceTier      @relation(fields: [priceTierId], references: [id], onDelete: Cascade)

  @@unique([productUnitId, priceTierId])
}

// Pelanggan & Plafon Kredit
model Customer {
  id              String         @id @default(cuid())
  tenantId        String
  code            String         // "CUST-001"
  name            String         // "Toko Berkah Jaya"
  phone           String?
  address         String?
  priceTierId     String
  creditTermDays  Int            @default(0) // 0 = Cash, 14, 30 hari
  creditLimit     BigInt         @default(0) // Plafon maksimal piutang (0 = tanpa limit)
  isActive        Boolean        @default(true)
  deletedAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  priceTier       PriceTier      @relation(fields: [priceTierId], references: [id])
  salesInvoices   SalesInvoice[]
  payments        CustomerPayment[]

  @@unique([tenantId, code])
  @@index([tenantId, name])
}

// Batch & Kadaluarsa
model Batch {
  id              String         @id @default(cuid())
  productId       String
  batchNumber     String         // "BATCH-2026-X1"
  expiredDate     DateTime       @db.Date
  createdAt       DateTime       @default(now())

  product         Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  stocks          Stock[]
  movements       StockMovement[]

  @@unique([productId, batchNumber])
  @@index([expiredDate])
}

// Saldo Stok Fisik per Gudang
model Stock {
  id              String         @id @default(cuid())
  warehouseId     String
  productId       String
  batchId         String?
  qtyBase         Int            @default(0) // Kuantitas dalam satuan dasar

  warehouse       Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  product         Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  batch           Batch?         @relation(fields: [batchId], references: [id], onDelete: SetNull)

  @@unique([warehouseId, productId, batchId])
  @@index([warehouseId, productId])
}

// HPP Moving Average per Gudang
model WarehouseProductCost {
  id              String         @id @default(cuid())
  warehouseId     String
  productId       String
  avgCostPerBase  Decimal        @db.Decimal(18, 4) // HPP moving average eksak
  lastUpdated     DateTime       @updatedAt

  warehouse       Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  product         Product        @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([warehouseId, productId])
}

// Buku Besar Mutasi Stok Tunggal (Single Source of Truth)
model StockMovement {
  id              String         @id @default(cuid())
  warehouseId     String
  productId       String
  batchId         String?
  type            MovementType
  qtyBase         Int            // Nilai bertanda (+ masuk, - keluar)
  unitCost        Decimal        @db.Decimal(18, 4) // HPP saat mutasi terjadi
  sourceDocType   String         // "SALES_INVOICE", "PURCHASE_RECEIPT", "ADJUSTMENT"
  sourceDocId     String
  notes           String?
  createdById     String
  createdAt       DateTime       @default(now())

  warehouse       Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  product         Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  batch           Batch?         @relation(fields: [batchId], references: [id], onDelete: SetNull)

  @@index([warehouseId, productId, createdAt])
  @@index([sourceDocType, sourceDocId])
}

enum MovementType {
  OPENING_STOCK
  PURCHASE_RECEIPT
  SALE_DELIVERY
  SALE_RETURN
  PURCHASE_RETURN
  TRANSFER_OUT
  TRANSFER_IN
  STOCK_OPNAME
  ADJUSTMENT
}

// Faktur Penjualan (Sales Invoice)
model SalesInvoice {
  id              String         @id @default(cuid())
  tenantId        String
  invoiceNumber   String         // "INV/2026/11/0001"
  customerId      String
  warehouseId     String
  subtotal        BigInt
  taxAmount       BigInt         @default(0) // PPN
  grandTotal      BigInt
  paidAmount      BigInt         @default(0) // Total yang sudah dicicil
  paymentStatus   PaymentStatus  @default(UNPAID)
  invoiceDate     DateTime       @db.Date
  dueDate         DateTime       @db.Date
  paymentMethod   PaymentMethod  @default(CREDIT)
  overrideLimitBy String?        // Diisi ID Owner jika melewati limit kredit
  overrideReason  String?
  isVoid          Boolean        @default(false)
  voidReason      String?
  createdById     String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer       @relation(fields: [customerId], references: [id])
  items           SalesInvoiceItem[]
  paymentAllocations PaymentAllocation[]

  @@unique([tenantId, invoiceNumber])
  @@index([tenantId, customerId])
  @@index([tenantId, dueDate])
}

model SalesInvoiceItem {
  id              String         @id @default(cuid())
  invoiceId       String
  productUnitId   String
  qtyOrdered      Int            // Kuantitas satuan transaksi
  qtyBase         Int            // Kuantitas konversi dasar
  unitPrice       BigInt         // Harga per satuan transaksi
  lineTotal       BigInt
  cogsPerBase     Decimal        @db.Decimal(18, 4) // Snapshot HPP untuk laba kotor

  invoice         SalesInvoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  productUnit     ProductUnit    @relation(fields: [productUnitId], references: [id])

  @@index([invoiceId])
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
}

enum PaymentMethod {
  CASH
  TRANSFER
  CREDIT
}

// Pembayaran Piutang & Alokasi Multi-Invoice
model CustomerPayment {
  id              String         @id @default(cuid())
  tenantId        String
  paymentNumber   String         // "PAY/2026/11/0001"
  customerId      String
  cashAccountId   String
  totalAmount     BigInt
  paymentDate     DateTime       @db.Date
  receiptUrl      String?
  notes           String?
  isVoid          Boolean        @default(false)
  createdById     String
  createdAt       DateTime       @default(now())

  customer        Customer       @relation(fields: [customerId], references: [id])
  cashAccount     CashAccount    @relation(fields: [cashAccountId], references: [id])
  allocations     PaymentAllocation[]

  @@index([tenantId, customerId])
}

model PaymentAllocation {
  id              String         @id @default(cuid())
  paymentId       String
  invoiceId       String
  allocatedAmount BigInt

  payment         CustomerPayment @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  invoice         SalesInvoice    @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([paymentId])
  @@index([invoiceId])
}

// Akun Kas & Bank
model CashAccount {
  id              String         @id @default(cuid())
  tenantId        String
  name            String         // "Kas Kasir Toko", "Bank BCA Operasional"
  accountNumber   String?
  balance         BigInt         @default(0)
  isDefault       Boolean        @default(false)
  createdAt       DateTime       @default(now())

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  mutations       CashMutation[]
  payments        CustomerPayment[]

  @@unique([tenantId, name])
}

model CashMutation {
  id              String         @id @default(cuid())
  cashAccountId   String
  type            CashMutationType
  amount          BigInt
  sourceDocType   String         // "AR_PAYMENT", "AP_PAYMENT", "EXPENSE"
  sourceDocId     String
  description     String
  createdById     String
  createdAt       DateTime       @default(now())

  cashAccount     CashAccount    @relation(fields: [cashAccountId], references: [id], onDelete: Cascade)

  @@index([cashAccountId, createdAt])
}

enum CashMutationType {
  IN
  OUT
}

// Jejak Audit Append-Only
model AuditLog {
  id              String         @id @default(cuid())
  tenantId        String
  userId          String
  action          String         // "POST_INVOICE", "OVERRIDE_CREDIT_LIMIT", "VOID_PAYMENT"
  entityName      String         // "SalesInvoice", "Customer"
  entityId        String
  oldData         Json?
  newData         Json?
  reason          String?
  ipAddress       String?
  createdAt       DateTime       @default(now())

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, entityName, entityId])
  @@index([tenantId, createdAt])
}
```

---

## 7. Integrasi Pihak Ketiga & Environment Variables (`docs/env-and-secrets.md`)

### 7.1 Layanan Eksternal (Third-Party Services)
| Layanan | Provider Terpilih | Fungsi Bisnis | Kredensial & Pengelolaan |
|---|---|---|---|
| **Cloud Storage** | Supabase Storage / Cloudflare R2 | Penyimpanan logo tenant, foto struk transfer, dan berkas retur | Akun Studio / Bucket Privat |
| **PDF Generation Engine** | `@react-pdf/renderer` / Puppeteer Core | Cetak faktur A4/A5, surat jalan, dan laporan aging PDF | Render di sisi server (Node.js) |
| **Excel Export Engine** | `exceljs` | Ekspor rekap mutasi stok, kartu stok, dan laporan laba kotor | Render stream di server |

### 7.2 Daftar Environment Variables Baru
| Variabel | Sifat | Deskripsi | Contoh Nilai Placeholder |
|---|---|---|---|
| `STORAGE_BUCKET_PRIVATE` | Konfigurasi | Nama bucket penyimpanan struk transaksi | `erp-private-receipts` |
| `DEFAULT_TENANT_DEMO_ID` | Konfigurasi | ID tenant khusus untuk demo publik portofolio | `tenant_demo_fmcg_01` |
| `MAX_TRANSACTION_ROWS` | Konfigurasi | Batas maksimal baris item dalam 1 faktur | `100` |

---

## 8. Standar Non-Fungsional (NFR) & Target Infrastruktur

### 8.1 Standar Kualitas Teknis (NFR)
* **Integritas Konkurensi Stok (Zero Negative Stock):** Pengurangan stok wajib mengeksekusi conditional update `UPDATE Stock SET qtyBase = qtyBase - :qty WHERE qtyBase >= :qty`. Jika stok tidak mencukupi, transaksi otomatis abort dengan HTTP 409.
* **Kecepatan Autocomplete Produk:** Respon pencarian SKU/Barcode pada form transaksi < 200 ms dengan memanfaatkan index gabungan `@@index([tenantId, barcode])` dan paginasi ringan (maksimal 15 rekomendasi).
* **Keamanan Field Sensitif:** Harga modal beli (`purchasePrice`), HPP moving average, dan margin kotor **DIHAPUS secara otomatis** dari response DTO NestJS jika request berasal dari akun `ORDER_CASHIER` atau `WAREHOUSE`.
* **Testing Coverage:** Unit tests kalkulasi murni (UOM conversion, Moving Average HPP, FEFO order, aging range) **WAJIB mencapai coverage 100%**.

### 8.2 Infrastruktur & Deployment (`docs/deployment.md`)
| Lapisan | Pilihan Utama | Catatan Konfigurasi |
|---|---|---|
| **Frontend Web** | Vercel (Next.js 16 App Router) | Domain: `erp.stackplustudio.com`, optimasi font Inter |
| **Backend API Gateway** | Railway (NestJS 11 Container) | Domain: `api-erp.stackplustudio.com`, Cookie Lax `withCredentials: true` |
| **Database PostgreSQL** | Neon PostgreSQL (Pooled Port 6543) | Direct connection Port 5432 untuk Prisma Migration |

---

## 9. Rencana Rilis & Milestone

| Milestone | Deliverable Bisnis | Estimasi | Check Validasi |
|---|---|---|---|
| **M1: Fondasi Multi-Tenant & Master UOM** | Setup repo, isolasi `tenantId`, master produk multi-satuan, level harga, pelanggan, supplier | Minggu ke-2 | `pnpm --filter database exec prisma migrate dev --name init-erp` & Unit test konversi UOM 100% lolos |
| **M2: Inventori, HPP, & Pembelian (PO)** | Modul gudang, penerimaan barang, kalkulasi HPP moving average otomatis, alur batch & FEFO | Minggu ke-5 | Unit test kalkulasi HPP moving average & verifikasi kartu stok invarian |
| **M3: Penjualan Kasir Cepat & Cetak Faktur** | Sales Order, Invoice Penjualan, validasi limit piutang, cetak PDF Surat Jalan/Faktur, input barcode | Minggu ke-8 | Playwright E2E alur penjualan kasir & uji coba barcode scanner USB |
| **M4: Piutang, Hutang, & Kasir Multi-Akun** | Pembayaran multi-invoice, kartu piutang/hutang, mutasi kas bank, laporan aging 0-60 hari, modul retur | Minggu ke-10 | Test rekonsiliasi saldo piutang & mutasi kas otomatis |
| **M5: Laporan Laba Rugi, Demo Showroom, & QA** | Laporan laba kotor, ekspor Excel, akun demo showroom per peran, uji beban k6 | Minggu ke-12 | CI/CD GitHub Actions Green ✅, audit security Trivy & Gitleaks bersih |

---

## 10. Kriteria UAT, Serah-Terima, & Garansi

### 10.1 Protokol UAT Distributor (`docs/uat-and-acceptance.md`)
* Pengujian UAT dijalankan pada environment staging dengan mengimpor 1.000 data produk riil distributor sembako/FMCG.
* Kriteria Lulus:
  1. Kasir dapat menginput 10 item barang berbeda dalam waktu < 90 detik via keyboard tanpa galat.
  2. Nilai HPP pada laporan laba kotor cocok dengan rumus kartu persediaan manual akuntan.
  3. Total saldo piutang di laporan aging 100% sama dengan penjumlahan sisa faktur belum lunas.

### 10.2 Ketentuan Garansi Pasca-Peluncuran (`docs/maintenance-and-support.md`)
* **Masa Garansi:** 60 hari kalender pemeliharaan intensif pasca peluncuran versi demo publik.
* **Cakupan:** Perbaikan bug matematis pada kalkulasi stok, HPP, dan saldo piutang tanpa biaya tambahan.

---

## 11. Log Perubahan & Change Request (CR) (`docs/change-request.md`)

*Seluruh penyesuaian fungsional di luar PRD v2.0 dicatat di tabel berikut:*

| No. CR | Tanggal | Fitur yang Diminta | Dampak Estimasi | Status |
|---|---|---|---|:--:|
| **CR-001** | *Pending* | Fitur cetak label barcode produk (Zebra / thermal label sticker) | Penambahan modul barcode builder, estimasi +3 hari | Usulan Fase 2.1 |

---

*Dokumen ini merupakan acuan mutlak implementasi StackPlus ERP. Seluruh kode backend dan frontend wajib mematuhi kriteria di atas.*
