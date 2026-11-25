import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvoiceDto,
  OverrideCreditLimitDto,
} from './dto/create-invoice.dto';
import { allocateFefoBatches } from '../inventory/utils/inventory-math';
import { MovementType, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async getInvoices(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.salesInvoice.count({ where }),
      this.prisma.salesInvoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, code: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          items: {
            include: {
              productUnit: {
                include: { product: { select: { sku: true, name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createInvoice(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice wajib memiliki minimal 1 item');
    }

    // --- Validasi & hitung subtotal ---
    const resolvedItems: Array<{
      productUnitId: string;
      productId: string;
      unitName: string;
      factorToBase: number;
      qty: number;
      qtyBase: number;
      unitPrice: number;
      lineTotal: number;
      cogsPerBase: number;
    }> = [];

    for (const item of dto.items) {
      const unit = await this.prisma.productUnit.findUnique({
        where: { id: item.productUnitId },
        include: { product: true },
      });
      if (!unit) {
        throw new NotFoundException(
          `Unit produk ${item.productUnitId} tidak ditemukan`,
        );
      }

      const qtyBase = item.qty * unit.factorToBase;

      // Ambil HPP rata-rata bergerak
      const costRecord = await this.prisma.warehouseProductCost.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: unit.productId,
          },
        },
      });
      const cogsPerBase = costRecord ? Number(costRecord.avgCostPerBase) : 0;

      resolvedItems.push({
        productUnitId: item.productUnitId,
        productId: unit.productId,
        unitName: unit.name,
        factorToBase: unit.factorToBase,
        qty: item.qty,
        qtyBase,
        unitPrice: item.unitPrice,
        lineTotal: item.qty * item.unitPrice,
        cogsPerBase,
      });
    }

    const grandTotal = resolvedItems.reduce((s, it) => s + it.lineTotal, 0);

    // --- PRD FR-004: Credit Limit Check ---
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Pelanggan ${dto.customerId} tidak ditemukan`,
      );
    }

    if (customer.creditLimit && Number(customer.creditLimit) > 0) {
      const existingAr = await this.prisma.salesInvoice.aggregate({
        where: {
          tenantId,
          customerId: dto.customerId,
          paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] },
          isVoid: false,
        },
        _sum: { grandTotal: true, paidAmount: true },
      });

      const totalOutstanding =
        Number(existingAr._sum.grandTotal ?? 0) -
        Number(existingAr._sum.paidAmount ?? 0);
      const projectedAr = totalOutstanding + grandTotal;

      if (projectedAr > Number(customer.creditLimit)) {
        throw new ConflictException({
          errorCode: 'CREDIT_LIMIT_EXCEEDED',
          message: `Batas kredit terlampaui. Piutang berjalan: Rp ${totalOutstanding.toLocaleString('id-ID')}, Invoice baru: Rp ${grandTotal.toLocaleString('id-ID')}, Limit: Rp ${Number(customer.creditLimit).toLocaleString('id-ID')}`,
          currentAr: totalOutstanding,
          newInvoiceTotal: grandTotal,
          creditLimit: Number(customer.creditLimit),
          projectedAr,
        });
      }
    }

    // --- Auto-generate Invoice Number ---
    const count = await this.prisma.salesInvoice.count({ where: { tenantId } });
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '/');
    const invoiceNumber = `INV/${dateStr}/${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // PRD FR-003: FEFO allocation & zero-negative guard per produk
      for (const item of resolvedItems) {
        // Ambil semua batch aktif untuk produk ini di gudang
        const availableBatches = await tx.stock.findMany({
          where: {
            warehouseId: dto.warehouseId,
            productId: item.productId,
            qtyBase: { gt: 0 },
          },
          include: { batch: true },
          orderBy: { batch: { expiredDate: 'asc' } },
        });

        // Konversi ke format FEFO allocator
        const batchesForFefo = availableBatches.map((s) => ({
          id: s.id,
          batchNumber: s.batch?.batchNumber ?? 'NO-BATCH',
          expiredDate: s.batch?.expiredDate ?? new Date('2099-12-31'),
          availableQty: s.qtyBase,
        }));

        const { success, allocations } = allocateFefoBatches(
          item.qtyBase,
          batchesForFefo,
        );

        if (!success) {
          const totalAllocated = allocations.reduce(
            (s, a) => s + a.allocatedQty,
            0,
          );
          throw new BadRequestException(
            `Stok tidak cukup untuk produk ${item.unitName}. Dibutuhkan ${item.qtyBase} unit dasar, tersedia ${totalAllocated} unit dasar (setelah FEFO filter batch kadaluarsa).`,
          );
        }

        // Kurangi stok per batch (zero-negative guard dengan WHERE qtyBase >= qty)
        for (const alloc of allocations) {
          const updated = await tx.stock.updateMany({
            where: {
              id: alloc.batchId,
              qtyBase: { gte: alloc.allocatedQty },
            },
            data: { qtyBase: { decrement: alloc.allocatedQty } },
          });
          if (updated.count === 0) {
            throw new BadRequestException(
              `Race condition terdeteksi: stok batch ${alloc.batchNumber} tidak mencukupi. Coba lagi.`,
            );
          }
        }
      }

      // Buat Invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          tenantId,
          invoiceNumber,
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
          subtotal: BigInt(Math.round(grandTotal)),
          grandTotal: BigInt(Math.round(grandTotal)),
          paidAmount: BigInt(0),
          invoiceDate: new Date(),
          dueDate: dto.dueDate
            ? new Date(dto.dueDate)
            : new Date(Date.now() + 30 * 86400000),
          overrideReason: dto.notes,
          createdById: userId,
          isVoid: false,
          items: {
            create: resolvedItems.map((item) => ({
              productUnitId: item.productUnitId,
              qtyOrdered: item.qty,
              qtyBase: item.qtyBase,
              unitPrice: BigInt(Math.round(item.unitPrice)),
              lineTotal: BigInt(Math.round(item.lineTotal)),
              cogsPerBase: item.cogsPerBase,
            })),
          },
        },
        include: {
          customer: true,
          items: { include: { productUnit: { include: { product: true } } } },
        },
      });

      // Catat Stock Movement per item
      for (const item of resolvedItems) {
        await tx.stockMovement.create({
          data: {
            warehouseId: dto.warehouseId,
            productId: item.productId,
            type: MovementType.SALE_DELIVERY,
            qtyBase: -item.qtyBase,
            unitCost: item.cogsPerBase,
            sourceDocType: 'SALES_INVOICE',
            sourceDocId: invoiceNumber,
            notes: `Penjualan ${invoiceNumber}`,
            createdById: userId,
          },
        });
      }

      // Jika COD, langsung PAID
      if (dto.paymentMethod === PaymentMethod.CASH) {
        await tx.salesInvoice.update({
          where: { id: invoice.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAmount: BigInt(Math.round(grandTotal)),
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'CREATE_INVOICE',
          entityName: 'SalesInvoice',
          entityId: invoice.id,
          newData: { invoiceNumber, grandTotal, customerId: dto.customerId },
        },
      });

      return invoice;
    });
  }

  async overrideCreditLimit(
    tenantId: string,
    invoiceId: string,
    userId: string,
    dto: OverrideCreditLimitDto,
  ) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan');

    // Verifikasi password Owner
    const owner = await this.prisma.user.findFirst({
      where: { tenantId, role: 'OWNER' },
    });
    if (!owner)
      throw new NotFoundException('User OWNER tidak ditemukan di tenant ini');

    const passwordMatch = await bcrypt.compare(
      dto.ownerPassword,
      owner.password,
    );
    if (!passwordMatch)
      throw new ForbiddenException('Password Owner tidak valid');

    const updated = await this.prisma.salesInvoice.update({
      where: { id: invoiceId },
      data: {
        overrideLimitBy: userId,
        overrideReason: dto.reason,
      },
    });

    // Audit
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'OVERRIDE_CREDIT_LIMIT',
        entityName: 'SalesInvoice',
        entityId: invoiceId,
        newData: { reason: dto.reason, overrideBy: userId },
      },
    });

    return {
      message: 'Credit limit override berhasil dicatat',
      invoiceId: updated.id,
    };
  }

  async voidInvoice(
    tenantId: string,
    invoiceId: string,
    userId: string,
    reason: string,
  ) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id: invoiceId, tenantId, isVoid: false },
      include: {
        items: { include: { productUnit: true } },
      },
    });
    if (!invoice)
      throw new NotFoundException(
        'Invoice tidak ditemukan atau sudah dibatalkan',
      );

    if (invoice.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Invoice yang sudah PAID tidak dapat di-void tanpa proses retur',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Kembalikan stok
      for (const item of invoice.items) {
        await tx.stock.updateMany({
          where: {
            warehouseId: invoice.warehouseId,
            productId: item.productUnit.productId,
          },
          data: { qtyBase: { increment: item.qtyBase } },
        });

        await tx.stockMovement.create({
          data: {
            warehouseId: invoice.warehouseId,
            productId: item.productUnit.productId,
            type: MovementType.ADJUSTMENT,
            qtyBase: item.qtyBase,
            unitCost: item.cogsPerBase,
            sourceDocType: 'VOID_INVOICE',
            sourceDocId: invoice.invoiceNumber,
            notes: `Void: ${reason}`,
            createdById: userId,
          },
        });
      }

      await tx.salesInvoice.update({
        where: { id: invoiceId },
        data: { isVoid: true, voidReason: reason },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'VOID_INVOICE',
          entityName: 'SalesInvoice',
          entityId: invoiceId,
          newData: { reason },
        },
      });

      return { message: `Invoice ${invoice.invoiceNumber} berhasil di-void` };
    });
  }
}
