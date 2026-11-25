import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';

/**
 * PRD FR-005 — Multi-invoice AR settlement with aging buckets
 */
describe('FinanceService — AR Settlement (FR-005)', () => {
  let service: FinanceService;
  let prismaMock: any;

  const tenantId = 'tenant_test';
  const userId = 'user_finance';

  beforeEach(async () => {
    prismaMock = {
      cashAccount: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      customer: { findFirst: jest.fn() },
      customerPayment: {
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      salesInvoice: {
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
      paymentAllocation: { create: jest.fn() },
      cashMutation: { create: jest.fn() },
      auditLog: { create: jest.fn() },
      $transaction: jest.fn((fn: any) => fn(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  describe('settlePayment', () => {
    beforeEach(() => {
      prismaMock.cashAccount.findFirst.mockResolvedValue({
        id: 'kas_001',
        name: 'Kas Utama',
        balance: BigInt(5_000_000),
        type: 'CASH',
        isActive: true,
      });
      prismaMock.customer.findFirst.mockResolvedValue({
        id: 'cust_001',
        name: 'Toko Maju',
      });
      prismaMock.customerPayment.create.mockResolvedValue({ id: 'pay_001' });
      prismaMock.cashAccount.update.mockResolvedValue({});
      prismaMock.cashMutation.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});
    });

    it('FR-005: invoice Rp 1M → PAID, invoice Rp 1.5M → PARTIAL (Rp 500K tersisa)', async () => {
      // INV-001: Rp 1.000.000 unpaid
      // INV-002: Rp 1.500.000 unpaid
      // Payment: Rp 2.000.000 → INV-001 Rp 1M (PAID) + INV-002 Rp 1M (PARTIAL)

      prismaMock.salesInvoice.findFirst
        .mockResolvedValueOnce({
          id: 'inv_001',
          invoiceNumber: 'INV/2026/11/00001',
          grandTotal: BigInt(1_000_000),
          paidAmount: BigInt(0),
          customerId: 'cust_001',
        })
        .mockResolvedValueOnce({
          id: 'inv_002',
          invoiceNumber: 'INV/2026/11/00002',
          grandTotal: BigInt(1_500_000),
          paidAmount: BigInt(0),
          customerId: 'cust_001',
        });

      prismaMock.salesInvoice.update.mockResolvedValue({});
      prismaMock.paymentAllocation.create.mockResolvedValue({});

      const result = await service.settlePayment(tenantId, userId, {
        customerId: 'cust_001',
        cashAccountId: 'kas_001',
        totalAmount: 2_000_000,
        allocations: [
          { invoiceId: 'inv_001', amount: 1_000_000 },
          { invoiceId: 'inv_002', amount: 1_000_000 },
        ],
      });

      expect(result.paymentId).toBe('pay_001');
      expect(prismaMock.salesInvoice.update).toHaveBeenCalledTimes(2);

      // INV-001 should be PAID
      expect(prismaMock.salesInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv_001' },
          data: expect.objectContaining({ paymentStatus: PaymentStatus.PAID }),
        }),
      );

      // INV-002 should be PARTIAL
      expect(prismaMock.salesInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv_002' },
          data: expect.objectContaining({
            paymentStatus: PaymentStatus.PARTIAL,
          }),
        }),
      );

      // Cash mutation IN should be created
      expect(prismaMock.cashMutation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'IN',
            amount: BigInt(2_000_000),
          }),
        }),
      );
    });

    it('harus throw BadRequestException jika total alokasi != total pembayaran', async () => {
      await expect(
        service.settlePayment(tenantId, userId, {
          customerId: 'cust_001',
          cashAccountId: 'kas_001',
          totalAmount: 2_000_000,
          allocations: [
            { invoiceId: 'inv_001', amount: 1_000_000 },
            // Missing Rp 500K allocation → total = 1.5M != 2M
            { invoiceId: 'inv_002', amount: 500_000 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAgingReport', () => {
    it('harus mengklasifikasikan invoice ke bucket aging yang benar', async () => {
      const today = new Date();
      const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000);

      prismaMock.salesInvoice.findMany.mockResolvedValue([
        // Current (not yet due)
        {
          id: 'inv_1',
          invoiceNumber: 'INV-001',
          grandTotal: BigInt(1_000_000),
          paidAmount: BigInt(0),
          dueDate: new Date(today.getTime() + 10 * 86400000),
          paymentStatus: PaymentStatus.UNPAID,
          customer: {
            id: 'c1',
            name: 'Toko A',
            code: 'T-001',
            creditLimit: BigInt(0),
          },
        },
        // 1-30 days overdue
        {
          id: 'inv_2',
          invoiceNumber: 'INV-002',
          grandTotal: BigInt(2_000_000),
          paidAmount: BigInt(0),
          dueDate: daysAgo(15),
          paymentStatus: PaymentStatus.UNPAID,
          customer: {
            id: 'c2',
            name: 'Toko B',
            code: 'T-002',
            creditLimit: BigInt(0),
          },
        },
        // >60 days overdue
        {
          id: 'inv_3',
          invoiceNumber: 'INV-003',
          grandTotal: BigInt(3_000_000),
          paidAmount: BigInt(0),
          dueDate: daysAgo(90),
          paymentStatus: PaymentStatus.UNPAID,
          customer: {
            id: 'c3',
            name: 'Toko C',
            code: 'T-003',
            creditLimit: BigInt(0),
          },
        },
      ]);

      const result = await service.getAgingReport(tenantId);

      expect(result.buckets.current.total).toBe(1_000_000);
      expect(result.buckets.days1to30.total).toBe(2_000_000);
      expect(result.buckets.days61plus.total).toBe(3_000_000);
      expect(result.grandTotal).toBe(6_000_000);
    });
  });
});
