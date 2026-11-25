import { test, expect } from '@playwright/test';

test.describe('StackPlus ERP — Comprehensive E2E Testing Suite', () => {
  test('1. Landing Page Showcase & Value Proposition', async ({ page }) => {
    await page.goto('/');

    // Verify Title & Hero Section
    await expect(page).toHaveTitle(/StackPlus/i);
    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Kelola Distribusi Grosir Tanpa Selisih Stok & Piutang Macet');

    // Verify Brand Logo
    const logo = page.locator('header a[href="/"]');
    await expect(logo).toBeVisible();

    // Verify CTA Buttons
    const demoButton = page.locator('main a[href="/login"]').first();
    await expect(demoButton).toBeVisible();
    await expect(demoButton).toContainText('Coba Demo Gratis');

    // Verify Comparison Table
    const compTable = page.locator('#komparasi table');
    await expect(compTable).toBeVisible();
    await expect(compTable).toContainText('Konversi Multi-Satuan Pecahan');
    await expect(compTable).toContainText('Perhitungan HPP Modal Barang');

    // Verify RBAC Roles section
    const rbacSection = page.locator('#rbac');
    await expect(rbacSection).toBeVisible();
    await expect(rbacSection).toContainText('Owner / Direktur');
    await expect(rbacSection).toContainText('Finance & AR');
    await expect(rbacSection).toContainText('Kasir Toko');
    await expect(rbacSection).toContainText('Kepala Gudang');

    // Navigate to Login via Top Nav
    await page.locator('header a[href="/login"]').first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Authentication & 1-Click Role Presets', async ({ page }) => {
    await page.goto('/login');

    // Verify Login Form Elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verify 1-Click Demo Role Presets
    const trialPreset = page.locator('button:has-text("TRIAL 7 HARI")');
    await expect(trialPreset).toBeVisible();
    const ownerPreset = page.locator('button:has-text("OWNER")');
    await expect(ownerPreset).toBeVisible();
    const cashierPreset = page.locator('button:has-text("ORDER_CASHIER")');
    await expect(cashierPreset).toBeVisible();

    // Unauthenticated access check to dashboard
    const context = page.context();
    await context.clearCookies();
    await page.goto('/dashboard');
    // Verify protected route redirects unauthenticated user
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('3. Dashboard Shell & Navigation Layout', async ({ page }) => {
    // Inject auth cookie to access dashboard in browser
    await page.context().addCookies([
      {
        name: 'token',
        value: 'mock-e2e-demo-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify Sidebar exists
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('Katalog Produk');
    await expect(sidebar).toContainText('Kartu Stok');
    await expect(sidebar).toContainText('Kasir Cepat');
    await expect(sidebar).toContainText('Pelunasan Piutang');
    await expect(sidebar).toContainText('Laba Kotor');

    // Verify Top Operational Header
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Showroom FMCG Live');

    // Verify Role Switcher
    const roleSelect = page.locator('header select');
    await expect(roleSelect).toBeVisible();
  });

  test('4. Master Data & Catalog Views', async ({ page }) => {
    await page.context().addCookies([
      { name: 'token', value: 'mock-e2e-demo-token', domain: 'localhost', path: '/' },
    ]);

    // Products Page
    await page.goto('/dashboard/products');
    await expect(page.locator('h1')).toContainText('Katalog Master Produk');
    await expect(page.locator('table')).toBeVisible();

    // Customers Page
    await page.goto('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Master Data Pelanggan');
    await expect(page.locator('table')).toBeVisible();

    // Warehouses Page
    await page.goto('/dashboard/warehouses');
    await expect(page.locator('h1')).toContainText('Master Lokasi & Gudang');
  });

  test('5. Inventory & FEFO Batches', async ({ page }) => {
    await page.context().addCookies([
      { name: 'token', value: 'mock-e2e-demo-token', domain: 'localhost', path: '/' },
    ]);

    // Inventory Stock Cards & Ledger
    await page.goto('/dashboard/inventory');
    await expect(page.locator('h1')).toContainText('Manajemen Persediaan & HPP');
    await expect(page.locator('button:has-text("Saldo Stok Fisik")')).toBeVisible();
    await expect(page.locator('button:has-text("Jurnal Mutasi Ledger")')).toBeVisible();

    // FEFO Batches
    await page.goto('/dashboard/inventory/batches');
    await expect(page.locator('h1')).toContainText('Manajemen Batch & Kedaluwarsa');
    await expect(page.locator('table')).toBeVisible();

    // Warehouse Transfers
    await page.goto('/dashboard/inventory/transfers');
    await expect(page.locator('h1')).toContainText('Transfer Stok Antar Gudang');
  });

  test('6. Fast Cashier POS Operations', async ({ page }) => {
    await page.context().addCookies([
      { name: 'token', value: 'mock-e2e-demo-token', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/dashboard/sales/cashier');
    await expect(page.locator('h1')).toContainText('Kasir Cepat');
    // Verify shortcut indicators
    await expect(page.locator('text=F2 Pelanggan')).toBeVisible();
    await expect(page.locator('text=F4 Cari Produk')).toBeVisible();
    await expect(page.locator('text=F9 Posting Invoice')).toBeVisible();

    // Invoices list
    await page.goto('/dashboard/sales/invoices');
    await expect(page.locator('h1')).toContainText('Daftar Invoice Penjualan');
    await expect(page.locator('table')).toBeVisible();
  });

  test('7. Finance & Managerial Reports', async ({ page }) => {
    await page.context().addCookies([
      { name: 'token', value: 'mock-e2e-demo-token', domain: 'localhost', path: '/' },
    ]);

    // AR Aging Report
    await page.goto('/dashboard/finance/aging');
    await expect(page.locator('h1')).toContainText('Laporan Umur Piutang (AR Aging)');
    await expect(page.getByRole('button', { name: /Belum Jatuh Tempo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /1 — 30 Hari/i })).toBeVisible();

    // Cash & Bank Accounts
    await page.goto('/dashboard/finance/cash');
    await expect(page.locator('h1')).toContainText('Buku Kas & Rekening Bank');

    // Gross Profit Report
    await page.goto('/dashboard/reports/gross-profit');
    await expect(page.locator('h1')).toContainText('Laba Kotor per Faktur');
    await expect(page.locator('text=Total Pendapatan (Omzet)')).toBeVisible();
    await expect(page.locator('text=Total Beban Pokok (HPP)')).toBeVisible();

    // Profit & Loss Report
    await page.goto('/dashboard/reports/profit-loss');
    await expect(page.locator('h1')).toContainText('Laporan Laba Rugi');
  });
});
