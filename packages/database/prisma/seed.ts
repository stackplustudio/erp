import { PrismaClient, MovementType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const tenantId = 'tenant_demo_fmcg_01';

  console.log('🌱 Seeding StackPlus ERP Demo Data...');

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      name: 'PT StackPlus Distribusi Sembako',
      subdomain: 'demo-fmcg',
      businessPhone: '081234567890',
      address: 'Kawasan Pergudangan Kosambi Indah Blok A/12, Tangerang',
      taxNumber: '01.234.567.8-412.000',
      isPkp: true,
      defaultTaxRate: 11,
    },
    create: {
      id: tenantId,
      name: 'PT StackPlus Distribusi Sembako',
      subdomain: 'demo-fmcg',
      businessPhone: '081234567890',
      address: 'Kawasan Pergudangan Kosambi Indah Blok A/12, Tangerang',
      taxNumber: '01.234.567.8-412.000',
      isPkp: true,
      defaultTaxRate: 11,
    },
  });
  console.log('✅ Tenant ready:', tenant.name);

  // 2. Warehouses
  const whMain = await prisma.warehouse.upsert({
    where: { tenantId_code: { tenantId, code: 'GDG-01' } },
    update: { name: 'Gudang Utama Distribusi' },
    create: {
      tenantId,
      code: 'GDG-01',
      name: 'Gudang Utama Distribusi',
      address: 'Blok A/12 Area Bongkar Muat 1',
    },
  });

  const whBranch = await prisma.warehouse.upsert({
    where: { tenantId_code: { tenantId, code: 'GDG-02' } },
    update: { name: 'Toko Cabang & Transit' },
    create: {
      tenantId,
      code: 'GDG-02',
      name: 'Toko Cabang & Transit',
      address: 'Jl. Raya Daan Mogot No. 88, Jakarta Barat',
    },
  });
  console.log('✅ Warehouses ready: GDG-01, GDG-02');

  // 3. Price Tiers
  const tierGrosirBesar = await prisma.priceTier.upsert({
    where: { tenantId_name: { tenantId, name: 'Grosir Besar' } },
    update: { isDefault: false },
    create: { tenantId, name: 'Grosir Besar', isDefault: false },
  });

  const tierSemiGrosir = await prisma.priceTier.upsert({
    where: { tenantId_name: { tenantId, name: 'Semi Grosir' } },
    update: { isDefault: false },
    create: { tenantId, name: 'Semi Grosir', isDefault: false },
  });

  const tierEceran = await prisma.priceTier.upsert({
    where: { tenantId_name: { tenantId, name: 'Eceran' } },
    update: { isDefault: true },
    create: { tenantId, name: 'Eceran', isDefault: true },
  });
  console.log('✅ Price Tiers ready: Grosir Besar, Semi Grosir, Eceran');

  // 4. Users per Role
  const usersToSeed = [
    { email: 'trial@stackplus.studio', name: 'Demo Trial (Akses 7 Hari)', role: 'OWNER' },
    { email: 'owner@demo.stackplus.studio', name: 'Budi Cahyono (Owner)', role: 'OWNER' },
    { email: 'finance@demo.stackplus.studio', name: 'Dewi Lestari (Finance & AR)', role: 'FINANCE' },
    { email: 'kasir@demo.stackplus.studio', name: 'Andi Pratama (Order Cashier)', role: 'ORDER_CASHIER' },
    { email: 'gudang@demo.stackplus.studio', name: 'Rudi Hermawan (Warehouse Lead)', role: 'WAREHOUSE' },
    { email: 'purchasing@demo.stackplus.studio', name: 'Siti Rahma (Procurement)', role: 'PURCHASING' },
    { email: 'admin@stackplus.studio', name: 'Super Admin StackPlus', role: 'SUPER_ADMIN' },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        tenantId,
        warehouseId: whMain.id,
        role: u.role,
        password: hashedPassword,
        name: u.name,
      },
      create: {
        tenantId,
        warehouseId: whMain.id,
        email: u.email,
        name: u.name,
        role: u.role,
        password: hashedPassword,
      },
    });
  }
  console.log('✅ Users with 6 RBAC roles ready (password: password123)');

  // 5. Cash & Bank Accounts
  const cashAccounts = [
    { name: 'Kasir Toko (Cash)', accountNumber: null, isDefault: true, balance: BigInt(5000000) },
    { name: 'Bank BCA Operasional', accountNumber: '731-098-1234', isDefault: false, balance: BigInt(125000000) },
    { name: 'Bank Mandiri Bisnis', accountNumber: '168-00-9876543-1', isDefault: false, balance: BigInt(85000000) },
  ];

  for (const ca of cashAccounts) {
    await prisma.cashAccount.upsert({
      where: { tenantId_name: { tenantId, name: ca.name } },
      update: { balance: ca.balance, isDefault: ca.isDefault },
      create: {
        tenantId,
        name: ca.name,
        accountNumber: ca.accountNumber,
        isDefault: ca.isDefault,
        balance: ca.balance,
      },
    });
  }
  console.log('✅ Cash & Bank accounts ready');

  // 6. Customers
  const customers = [
    {
      code: 'CUST-001',
      name: 'Toko Berkah Jaya',
      phone: '081311223344',
      address: 'Pasar Induk Kramat Jati Los B No. 45',
      priceTierId: tierGrosirBesar.id,
      creditLimit: BigInt(10000000), // Rp 10.000.000 limit
      creditTermDays: 14,
    },
    {
      code: 'CUST-002',
      name: 'Minimarket Sumber Rejeki',
      phone: '081288990011',
      address: 'Jl. Meruya Ilir No. 15, Jakarta Barat',
      priceTierId: tierSemiGrosir.id,
      creditLimit: BigInt(5000000), // Rp 5.000.000 limit
      creditTermDays: 7,
    },
    {
      code: 'CUST-003',
      name: 'Warung Bu Siti',
      phone: '085712345678',
      address: 'Gg. Musholla No. 3, Cengkareng',
      priceTierId: tierEceran.id,
      creditLimit: BigInt(0), // Cash only
      creditTermDays: 0,
    },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { tenantId_code: { tenantId, code: c.code } },
      update: {
        name: c.name,
        phone: c.phone,
        address: c.address,
        priceTierId: c.priceTierId,
        creditLimit: c.creditLimit,
        creditTermDays: c.creditTermDays,
      },
      create: {
        tenantId,
        code: c.code,
        name: c.name,
        phone: c.phone,
        address: c.address,
        priceTierId: c.priceTierId,
        creditLimit: c.creditLimit,
        creditTermDays: c.creditTermDays,
      },
    });
  }
  console.log('✅ Customers ready: CUST-001, CUST-002, CUST-003');

  // 7. Suppliers
  const suppliers = [
    {
      code: 'SUPP-001',
      name: 'PT Salim Sembako Makmur',
      phone: '021-5551234',
      address: 'Jl. Industri Raya Blok D No. 2, Cikarang',
      contactPerson: 'Bpk. Hendra Gunawan',
      paymentTermDays: 30,
    },
    {
      code: 'SUPP-002',
      name: 'CV Pangan Nusantara Bersama',
      phone: '021-5559876',
      address: 'Kawasan Industri Jatake, Tangerang',
      contactPerson: 'Ibu Ratna Susanti',
      paymentTermDays: 14,
    },
  ];

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { tenantId_code: { tenantId, code: s.code } },
      update: {
        name: s.name,
        phone: s.phone,
        address: s.address,
        contactPerson: s.contactPerson,
        paymentTermDays: s.paymentTermDays,
      },
      create: {
        tenantId,
        code: s.code,
        name: s.name,
        phone: s.phone,
        address: s.address,
        contactPerson: s.contactPerson,
        paymentTermDays: s.paymentTermDays,
      },
    });
  }
  console.log('✅ Suppliers ready: SUPP-001, SUPP-002');

  // 8. Products with Multi-UOM
  // Product A: Minyak Goreng 1L
  const pMinyak = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId, sku: 'BRG-001' } },
    update: { name: 'Minyak Goreng Sawit 1 Liter', trackBatch: true },
    create: {
      tenantId,
      sku: 'BRG-001',
      name: 'Minyak Goreng Sawit 1 Liter',
      category: 'Minyak & Lemak',
      brand: 'Bimoli',
      baseUnitName: 'Pcs',
      trackBatch: true,
      minStockAlert: 50,
    },
  });

  // Units for Minyak: Base = Pcs (factor 1), Dus (factor 12)
  const uMinyakPcs = await prisma.productUnit.upsert({
    where: { id: `${pMinyak.id}-pcs` },
    update: {},
    create: {
      id: `${pMinyak.id}-pcs`,
      productId: pMinyak.id,
      name: 'Pcs',
      factorToBase: 1,
      barcode: '8991234560019',
      purchasePrice: BigInt(13000),
      salePrice: BigInt(16000),
      isBase: true,
    },
  });

  const uMinyakDus = await prisma.productUnit.upsert({
    where: { id: `${pMinyak.id}-dus` },
    update: {},
    create: {
      id: `${pMinyak.id}-dus`,
      productId: pMinyak.id,
      name: 'Dus (12 Pcs)',
      factorToBase: 12,
      barcode: '8991234560012',
      purchasePrice: BigInt(156000),
      salePrice: BigInt(180000),
      isBase: false,
    },
  });

  // Product B: Beras Pandan Wangi 5kg
  const pBeras = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId, sku: 'BRG-002' } },
    update: { name: 'Beras Pandan Wangi Super 5kg', trackBatch: true },
    create: {
      tenantId,
      sku: 'BRG-002',
      name: 'Beras Pandan Wangi Super 5kg',
      category: 'Beras & Biji-bijian',
      brand: 'Topi Koki',
      baseUnitName: 'Sak',
      trackBatch: true,
      minStockAlert: 20,
    },
  });

  const uBerasSak = await prisma.productUnit.upsert({
    where: { id: `${pBeras.id}-sak` },
    update: {},
    create: {
      id: `${pBeras.id}-sak`,
      productId: pBeras.id,
      name: 'Sak (5kg)',
      factorToBase: 1,
      barcode: '8991234560027',
      purchasePrice: BigInt(70000),
      salePrice: BigInt(82000),
      isBase: true,
    },
  });

  const uBerasBal = await prisma.productUnit.upsert({
    where: { id: `${pBeras.id}-bal` },
    update: {},
    create: {
      id: `${pBeras.id}-bal`,
      productId: pBeras.id,
      name: 'Bal (5 Sak)',
      factorToBase: 5,
      barcode: '8991234560020',
      purchasePrice: BigInt(350000),
      salePrice: BigInt(395000),
      isBase: false,
    },
  });

  // Product C: Mi Instan Soto
  const pMie = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId, sku: 'BRG-003' } },
    update: { name: 'Mi Instan Rasa Soto Banjar 80g' },
    create: {
      tenantId,
      sku: 'BRG-003',
      name: 'Mi Instan Rasa Soto Banjar 80g',
      category: 'Makanan Instan',
      brand: 'Indomie',
      baseUnitName: 'Bungkus',
      trackBatch: true,
      minStockAlert: 100,
    },
  });

  const uMiePcs = await prisma.productUnit.upsert({
    where: { id: `${pMie.id}-pcs` },
    update: {},
    create: {
      id: `${pMie.id}-pcs`,
      productId: pMie.id,
      name: 'Bungkus',
      factorToBase: 1,
      barcode: '8991234560039',
      purchasePrice: BigInt(2750),
      salePrice: BigInt(3500),
      isBase: true,
    },
  });

  const uMieKarton = await prisma.productUnit.upsert({
    where: { id: `${pMie.id}-karton` },
    update: {},
    create: {
      id: `${pMie.id}-karton`,
      productId: pMie.id,
      name: 'Karton (40 Bks)',
      factorToBase: 40,
      barcode: '8991234560031',
      purchasePrice: BigInt(110000),
      salePrice: BigInt(128000),
      isBase: false,
    },
  });
  console.log('✅ Products with Multi-UOM & barcodes ready: BRG-001, BRG-002, BRG-003');

  // 9. Batches & Initial Stock
  // Minyak Batch B1 (Expired Jan 2027) & B2 (Expired Mar 2027)
  const batchM1 = await prisma.batch.upsert({
    where: { productId_batchNumber: { productId: pMinyak.id, batchNumber: 'BATCH-2027-01' } },
    update: {},
    create: {
      productId: pMinyak.id,
      batchNumber: 'BATCH-2027-01',
      expiredDate: new Date('2027-01-15'),
    },
  });

  const batchM2 = await prisma.batch.upsert({
    where: { productId_batchNumber: { productId: pMinyak.id, batchNumber: 'BATCH-2027-03' } },
    update: {},
    create: {
      productId: pMinyak.id,
      batchNumber: 'BATCH-2027-03',
      expiredDate: new Date('2027-03-10'),
    },
  });

  // Stok Minyak di GDG-01: Batch 1 = 240 Pcs (20 Dus), Batch 2 = 360 Pcs (30 Dus)
  await prisma.stock.upsert({
    where: { warehouseId_productId_batchId: { warehouseId: whMain.id, productId: pMinyak.id, batchId: batchM1.id } },
    update: { qtyBase: 240 },
    create: {
      warehouseId: whMain.id,
      productId: pMinyak.id,
      batchId: batchM1.id,
      qtyBase: 240,
    },
  });

  await prisma.stock.upsert({
    where: { warehouseId_productId_batchId: { warehouseId: whMain.id, productId: pMinyak.id, batchId: batchM2.id } },
    update: { qtyBase: 360 },
    create: {
      warehouseId: whMain.id,
      productId: pMinyak.id,
      batchId: batchM2.id,
      qtyBase: 360,
    },
  });

  // HPP Moving Average GDG-01 for Minyak = Rp 12.800 / Pcs
  await prisma.warehouseProductCost.upsert({
    where: { warehouseId_productId: { warehouseId: whMain.id, productId: pMinyak.id } },
    update: { avgCostPerBase: 12800 },
    create: {
      warehouseId: whMain.id,
      productId: pMinyak.id,
      avgCostPerBase: 12800,
    },
  });

  // Stok Beras GDG-01 = 150 Sak (avgCost Rp 70.000)
  await prisma.stock.upsert({
    where: { warehouseId_productId_batchId: { warehouseId: whMain.id, productId: pBeras.id, batchId: '' } },
    update: { qtyBase: 150 },
    create: {
      warehouseId: whMain.id,
      productId: pBeras.id,
      qtyBase: 150,
    },
  });

  await prisma.warehouseProductCost.upsert({
    where: { warehouseId_productId: { warehouseId: whMain.id, productId: pBeras.id } },
    update: { avgCostPerBase: 70000 },
    create: {
      warehouseId: whMain.id,
      productId: pBeras.id,
      avgCostPerBase: 70000,
    },
  });

  console.log('✅ Stock, Batches (FEFO candidates) and Moving Average costs initialized');
  console.log('🚀 StackPlus ERP Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
