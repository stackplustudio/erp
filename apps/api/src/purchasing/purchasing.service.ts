import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoDto } from './dto/create-po.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { calculateMovingAverageCost } from '../inventory/utils/inventory-math';
import { MovementType, PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchasingService {
  constructor(private prisma: PrismaService) {}

  async getPurchaseOrders(
    tenantId: string,
    status?: PurchaseStatus,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: true,
          warehouse: true,
          items: {
            include: {
              productUnit: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createPurchaseOrder(
    tenantId: string,
    userId: string,
    dto: CreatePoDto,
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Purchase order wajib memiliki minimal 1 item',
      );
    }

    // Auto-generate PO Number
    const count = await this.prisma.purchaseOrder.count({
      where: { tenantId },
    });
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '/');
    const poNumber = `PO/${dateStr}/${String(count + 1).padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // Hitung subtotal & konversi kuantitas dasar
      let subtotal = BigInt(0);

      const itemsData = [];
      for (const item of dto.items) {
        const unit = await tx.productUnit.findUnique({
          where: { id: item.productUnitId },
        });
        if (!unit) {
          throw new NotFoundException(
            `Unit ID ${item.productUnitId} tidak ditemukan`,
          );
        }

        const lineTotal = BigInt(item.qtyOrdered) * BigInt(item.unitCost);
        subtotal += lineTotal;

        const qtyBase = item.qtyOrdered * unit.factorToBase;

        itemsData.push({
          productUnitId: item.productUnitId,
          qtyOrdered: item.qtyOrdered,
          qtyReceived: 0,
          qtyBase,
          unitCost: BigInt(item.unitCost),
          lineTotal,
        });
      }

      const grandTotal = subtotal; // Sebelum PPN jika non-pkp atau sudah include

      const po = await tx.purchaseOrder.create({
        data: {
          tenantId,
          poNumber,
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          status: PurchaseStatus.ORDERED,
          subtotal,
          grandTotal,
          orderDate: new Date(),
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
          notes: dto.notes,
          createdById: userId,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: { include: { productUnit: true } },
          supplier: true,
          warehouse: true,
        },
      });

      return po;
    });
  }

  async receiveGoods(
    tenantId: string,
    userId: string,
    poId: string,
    dto: ReceiveGoodsDto,
  ) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
      include: {
        items: {
          include: {
            productUnit: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order ${poId} tidak ditemukan`);
    }

    if (po.status === PurchaseStatus.CANCELLED) {
      throw new BadRequestException(
        'PO yang sudah dibatalkan tidak dapat diterima',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const rec of dto.items) {
        const poItem = po.items.find((i) => i.id === rec.poItemId);
        if (!poItem) continue;

        const product = poItem.productUnit.product;
        const factorToBase = poItem.productUnit.factorToBase;
        const incomingBaseQty = rec.qtyReceived * factorToBase;
        const costPerBase = Number(poItem.unitCost) / factorToBase;

        // 1. Tangani Batch jika ada
        let batchId: string | null = null;
        if (rec.batchNumber && rec.expiredDate) {
          const batch = await tx.batch.upsert({
            where: {
              productId_batchNumber: {
                productId: product.id,
                batchNumber: rec.batchNumber,
              },
            },
            update: { expiredDate: new Date(rec.expiredDate) },
            create: {
              productId: product.id,
              batchNumber: rec.batchNumber,
              expiredDate: new Date(rec.expiredDate),
            },
          });
          batchId = batch.id;
        }

        // 2. Baca stok & HPP saat ini untuk Gudang PO
        const currentCost = await tx.warehouseProductCost.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: po.warehouseId,
              productId: product.id,
            },
          },
        });

        // Hitung total kuantitas stok produk saat ini di gudang tersebut
        const currentStocks = await tx.stock.findMany({
          where: {
            warehouseId: po.warehouseId,
            productId: product.id,
          },
        });
        const currentTotalStock = currentStocks.reduce(
          (acc, s) => acc + s.qtyBase,
          0,
        );

        const currentAvgCost = currentCost
          ? Number(currentCost.avgCostPerBase)
          : 0;

        // 3. Kalkulasi Moving Average HPP Baru (PRD FR-002)
        const newAvgCost = calculateMovingAverageCost(
          currentTotalStock,
          currentAvgCost,
          incomingBaseQty,
          costPerBase,
        );

        // 4. Update HPP Gudang
        await tx.warehouseProductCost.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: po.warehouseId,
              productId: product.id,
            },
          },
          update: { avgCostPerBase: newAvgCost },
          create: {
            warehouseId: po.warehouseId,
            productId: product.id,
            avgCostPerBase: newAvgCost,
          },
        });

        // 5. Tambah stok fisik
        await tx.stock.upsert({
          where: {
            warehouseId_productId_batchId: {
              warehouseId: po.warehouseId,
              productId: product.id,
              batchId: batchId || '',
            },
          },
          update: { qtyBase: { increment: incomingBaseQty } },
          create: {
            warehouseId: po.warehouseId,
            productId: product.id,
            batchId: batchId || null,
            qtyBase: incomingBaseQty,
          },
        });

        // 6. Catat Stock Movement tunggal (PURCHASE_RECEIPT)
        await tx.stockMovement.create({
          data: {
            warehouseId: po.warehouseId,
            productId: product.id,
            batchId,
            type: MovementType.PURCHASE_RECEIPT,
            qtyBase: incomingBaseQty,
            unitCost: newAvgCost,
            sourceDocType: 'PURCHASE_RECEIPT',
            sourceDocId: po.poNumber,
            notes: `Penerimaan PO ${po.poNumber}`,
            createdById: userId,
          },
        });

        // 7. Update qtyReceived pada PO Item
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { qtyReceived: { increment: rec.qtyReceived } },
        });
      }

      // Update status PO ke RECEIVED
      const updatedPo = await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: PurchaseStatus.RECEIVED },
        include: { items: true },
      });

      return {
        poNumber: updatedPo.poNumber,
        status: updatedPo.status,
        message:
          'Barang berhasil diterima dan HPP Moving Average telah diperbarui otomatis',
      };
    });
  }
}
