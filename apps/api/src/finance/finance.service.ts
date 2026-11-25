import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettlePaymentDto } from './dto/settle-payment.dto';
import { PaymentStatus, CashMutationType, PaymentMethod } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getCashAccounts(tenantId: string) {
    const data = await this.prisma.cashAccount.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return { data };
  }

  async getCashMutations(
    tenantId: string,
    cashAccountId?: string,
    page = 1,
    limit = 30,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { cashAccount: { tenantId } };
    if (cashAccountId) where.cashAccountId = cashAccountId;

    const [total, data] = await Promise.all([
      this.prisma.cashMutation.count({ where }),
      this.prisma.cashMutation.findMany({
        where,
        skip,
        take: limit,
        include: {
          cashAccount: { select: { name: true, accountNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * PRD FR-005 — Multi-invoice AR settlement in one atomic transaction
   */
  async settlePayment(tenantId: string, userId: string, dto: SettlePaymentDto) {
    const cashAccount = await this.prisma.cashAccount.findFirst({
      where: { id: dto.cashAccountId, tenantId },
    });
    if (!cashAccount) {
      throw new NotFoundException(
        'Kas / rekening tidak ditemukan atau tidak aktif',
      );
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
    });
    if (!customer) throw new NotFoundException('Pelanggan tidak ditemukan');

    const totalAllocated = dto.allocations.reduce((s, a) => s + a.amount, 0);
    if (Math.round(totalAllocated) !== Math.round(dto.totalAmount)) {
      throw new BadRequestException(
        `Total alokasi (Rp ${totalAllocated.toLocaleString('id-ID')}) harus sama dengan total pembayaran (Rp ${dto.totalAmount.toLocaleString('id-ID')})`,
      );
    }

    const count = await this.prisma.customerPayment.count({
      where: { tenantId },
    });
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '/');
    const paymentNumber = `PAY/${dateStr}/${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Buat CustomerPayment
      const payment = await tx.customerPayment.create({
        data: {
          tenantId,
          paymentNumber,
          customerId: dto.customerId,
          cashAccountId: dto.cashAccountId,
          totalAmount: BigInt(Math.round(dto.totalAmount)),
          paymentDate: new Date(),
          notes: dto.notes,
          createdById: userId,
        },
      });

      // 2. Alokasi per invoice
      for (const alloc of dto.allocations) {
        const invoice = await tx.salesInvoice.findFirst({
          where: { id: alloc.invoiceId, tenantId, customerId: dto.customerId },
        });
        if (!invoice)
          throw new NotFoundException(
            `Invoice ${alloc.invoiceId} tidak ditemukan`,
          );

        const outstanding =
          Number(invoice.grandTotal) - Number(invoice.paidAmount);
        if (alloc.amount > outstanding + 1) {
          // +1 for rounding tolerance
          throw new BadRequestException(
            `Alokasi Rp ${alloc.amount.toLocaleString('id-ID')} melebihi sisa hutang invoice ${invoice.invoiceNumber} (Rp ${outstanding.toLocaleString('id-ID')})`,
          );
        }

        const newPaid = Number(invoice.paidAmount) + alloc.amount;
        const newStatus: PaymentStatus =
          Math.round(newPaid) >= Math.round(Number(invoice.grandTotal))
            ? PaymentStatus.PAID
            : PaymentStatus.PARTIAL;

        await tx.salesInvoice.update({
          where: { id: alloc.invoiceId },
          data: {
            paidAmount: { increment: BigInt(Math.round(alloc.amount)) },
            paymentStatus: newStatus,
          },
        });

        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: alloc.invoiceId,
            allocatedAmount: BigInt(Math.round(alloc.amount)),
          },
        });
      }

      // 3. Tambah saldo kas
      await tx.cashAccount.update({
        where: { id: dto.cashAccountId },
        data: { balance: { increment: BigInt(Math.round(dto.totalAmount)) } },
      });

      // 4. Catat mutasi kas masuk
      await tx.cashMutation.create({
        data: {
          cashAccountId: dto.cashAccountId,
          type: CashMutationType.IN,
          amount: BigInt(Math.round(dto.totalAmount)),
          description: `Pembayaran AR ${customer.name} — ${dto.allocations.length} invoice`,
          sourceDocType: 'CUSTOMER_PAYMENT',
          sourceDocId: payment.id,
          createdById: userId,
        },
      });

      // 5. Audit
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'SETTLE_AR_PAYMENT',
          entityName: 'CustomerPayment',
          entityId: payment.id,
          newData: {
            customerId: dto.customerId,
            totalAmount: dto.totalAmount,
            allocations: dto.allocations.length,
          },
        },
      });

      return {
        paymentId: payment.id,
        message: `Pembayaran Rp ${dto.totalAmount.toLocaleString('id-ID')} berhasil dicatat ke ${cashAccount.name}`,
      };
    });
  }

  /**
   * PRD FR-005 — AR Aging Report
   */
  async getAgingReport(tenantId: string) {
    const unpaidInvoices = await this.prisma.salesInvoice.findMany({
      where: {
        tenantId,
        paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] },
        isVoid: false,
      },
      include: {
        customer: {
          select: { id: true, name: true, code: true, creditLimit: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = {
      current: { label: 'Belum Jatuh Tempo', invoices: [] as any[], total: 0 },
      days1to30: { label: '1 — 30 Hari', invoices: [] as any[], total: 0 },
      days31to60: { label: '31 — 60 Hari', invoices: [] as any[], total: 0 },
      days61plus: { label: '>60 Hari', invoices: [] as any[], total: 0 },
    };

    for (const inv of unpaidInvoices) {
      const outstanding = Number(inv.grandTotal) - Number(inv.paidAmount);
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
      const overdueDays = dueDate
        ? Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          )
        : -1;

      const item = {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customer.id,
        customerName: inv.customer.name,
        customerCode: inv.customer.code,
        creditLimit: Number(inv.customer.creditLimit),
        grandTotal: Number(inv.grandTotal),
        paidAmount: Number(inv.paidAmount),
        outstanding,
        dueDate: inv.dueDate,
        overdueDays,
      };

      if (overdueDays <= 0) {
        buckets.current.invoices.push(item);
        buckets.current.total += outstanding;
      } else if (overdueDays <= 30) {
        buckets.days1to30.invoices.push(item);
        buckets.days1to30.total += outstanding;
      } else if (overdueDays <= 60) {
        buckets.days31to60.invoices.push(item);
        buckets.days31to60.total += outstanding;
      } else {
        buckets.days61plus.invoices.push(item);
        buckets.days61plus.total += outstanding;
      }
    }

    const grandTotal = Object.values(buckets).reduce((s, b) => s + b.total, 0);

    return { buckets, grandTotal, invoiceCount: unpaidInvoices.length };
  }

  async getUnpaidInvoicesByCustomer(tenantId: string, customerId: string) {
    const data = await this.prisma.salesInvoice.findMany({
      where: {
        tenantId,
        customerId,
        paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] },
        isVoid: false,
      },
      orderBy: { createdAt: 'asc' },
    });
    return { data };
  }
}
