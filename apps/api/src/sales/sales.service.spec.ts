import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * PRD FR-004 — Credit Limit Enforcement
 * PRD FR-003 — FEFO Batch Allocation (via allocateFefoBatches)
 */
describe('SalesService — Credit Limit (FR-004)', () => {
  let service: SalesService;
  let prismaMock: any;

  const tenantId = 'tenant_test';
  const userId = 'user_test';

  beforeEach(async () => {
    prismaMock = {
      productUnit: {
        findUnique: jest.fn(),
      },
      warehouseProductCost: {
        findUnique: jest.fn(),
      },
      customer: {
        findFirst: jest.fn(),
      },
      salesInvoice: {
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      stockMovement: { create: jest.fn() },
      auditLog: { create: jest.fn() },
      stock: { findMany: jest.fn(), updateMany: jest.fn() },
      $transaction: jest.fn((fn: any) => fn(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  describe('createInvoice — credit limit check', () => {
    const baseDto = {
      customerId: 'cust_001',
      warehouseId: 'wh_001',
      paymentMethod: PaymentMethod.CREDIT,
      items: [{ productUnitId: 'pu_001', qty: 1, unitPrice: 2_500_000 }],
    };

    beforeEach(() => {
      // Unit: 1 Karton = 12 Pcs
      prismaMock.productUnit.findUnique.mockResolvedValue({
        id: 'pu_001',
        productId: 'prod_001',
        unitName: 'Karton',
        factorToBase: 12,
        product: { id: 'prod_001', sku: 'BRG-001', name: 'Minyak Goreng' },
      });

      prismaMock.warehouseProductCost.findUnique.mockResolvedValue({
        avgCostPerBase: 9000,
      });
    });

    it('FR-004: harus throw ConflictException (CREDIT_LIMIT_EXCEEDED) ketika piutang + invoice baru > limit', async () => {
      // Customer: limit Rp 10.000.000
      prismaMock.customer.findFirst.mockResolvedValue({
        id: 'cust_001',
        name: 'Toko Maju',
        creditLimit: BigInt(10_000_000),
        creditTermDays: 30,
      });

      // Existing AR: Rp 8.000.000 outstanding
      prismaMock.salesInvoice.aggregate.mockResolvedValue({
        _sum: { grandTotal: BigInt(8_000_000), paidAmount: BigInt(0) },
      });

      // New invoice total: Rp 2.500.000
      // 8.000.000 + 2.500.000 = 10.500.000 > 10.000.000 → EXCEED

      await expect(
        service.createInvoice(tenantId, userId, baseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('FR-004: harus lolos jika piutang + invoice baru <= limit', async () => {
      // Customer: limit Rp 10.000.000
      prismaMock.customer.findFirst.mockResolvedValue({
        id: 'cust_001',
        name: 'Toko Maju',
        creditLimit: BigInt(10_000_000),
        creditTermDays: 30,
      });

      // Existing AR: Rp 5.000.000
      prismaMock.salesInvoice.aggregate.mockResolvedValue({
        _sum: { grandTotal: BigInt(5_000_000), paidAmount: BigInt(0) },
      });

      // New invoice total: Rp 2.500.000
      // 5.000.000 + 2.500.000 = 7.500.000 <= 10.000.000 → OK

      // Setup stok cukup untuk 12 pcs
      prismaMock.stock.findMany.mockResolvedValue([
        {
          id: 'stock_001',
          batchId: 'batch_001',
          qtyBase: 60,
          batch: {
            batchNumber: 'BATCH-2027-01',
            expiredDate: new Date('2027-01-31'),
          },
        },
      ]);
      prismaMock.stock.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.salesInvoice.create.mockResolvedValue({
        id: 'inv_001',
        invoiceNumber: 'INV/2026/11/00001',
      });
      prismaMock.salesInvoice.update.mockResolvedValue({});
      prismaMock.stockMovement.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      await expect(
        service.createInvoice(tenantId, userId, baseDto),
      ).resolves.toBeDefined();
    });

    it('FR-004: customer tanpa credit limit (0) harus selalu lolos', async () => {
      prismaMock.customer.findFirst.mockResolvedValue({
        id: 'cust_001',
        name: 'Toko Tunai',
        creditLimit: BigInt(0), // No limit
        creditTermDays: 0,
      });

      prismaMock.stock.findMany.mockResolvedValue([
        {
          id: 'stock_001',
          batchId: null,
          qtyBase: 100,
          batch: null,
        },
      ]);
      prismaMock.stock.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.salesInvoice.create.mockResolvedValue({ id: 'inv_002' });
      prismaMock.salesInvoice.update.mockResolvedValue({});
      prismaMock.stockMovement.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      await expect(
        service.createInvoice(tenantId, userId, {
          ...baseDto,
          paymentMethod: PaymentMethod.CASH,
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('createInvoice — zero-negative stock guard', () => {
    it('harus throw BadRequestException jika stok tidak cukup setelah FEFO', async () => {
      prismaMock.productUnit.findUnique.mockResolvedValue({
        id: 'pu_001',
        productId: 'prod_001',
        unitName: 'Karton',
        factorToBase: 12,
        product: { id: 'prod_001', sku: 'BRG-001', name: 'Minyak Goreng' },
      });
      prismaMock.warehouseProductCost.findUnique.mockResolvedValue({
        avgCostPerBase: 9000,
      });
      prismaMock.customer.findFirst.mockResolvedValue({
        id: 'cust_001',
        creditLimit: BigInt(0),
      });

      // Stok hanya 5 unit dasar, butuh 12
      prismaMock.stock.findMany.mockResolvedValue([
        {
          id: 'stock_001',
          batchId: 'batch_001',
          qtyBase: 5,
          batch: {
            batchNumber: 'BATCH-2027-01',
            expiredDate: new Date('2027-01-31'),
          },
        },
      ]);

      await expect(
        service.createInvoice(tenantId, userId, {
          customerId: 'cust_001',
          warehouseId: 'wh_001',
          paymentMethod: PaymentMethod.CASH,
          items: [{ productUnitId: 'pu_001', qty: 1, unitPrice: 10000 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
