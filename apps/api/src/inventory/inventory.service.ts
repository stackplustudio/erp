import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { formatBaseToMultiUom } from '../master/utils/uom-converter';
import { MovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ───────────────────────────────────────────────────────────────────────────
  // STOCKS MATRIX
  // ───────────────────────────────────────────────────────────────────────────

  async getStocks(
    tenantId: string,
    warehouseId?: string,
    search?: string,
    page = 1,
    limit = 20,
    userRole?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      product: { tenantId, deletedAt: null },
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (search) {
      where.product.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, stocks] = await Promise.all([
      this.prisma.stock.count({ where }),
      this.prisma.stock.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            include: {
              units: { orderBy: { factorToBase: 'desc' } },
            },
          },
          warehouse: true,
          batch: true,
        },
        orderBy: [{ warehouse: { code: 'asc' } }, { product: { name: 'asc' } }],
      }),
    ]);

    // Fetch HPP Costs if allowed
    const shouldMaskCost =
      userRole === 'ORDER_CASHIER' || userRole === 'WAREHOUSE';

    const costs = shouldMaskCost
      ? []
      : await this.prisma.warehouseProductCost.findMany({
          where: {
            warehouseId: warehouseId || undefined,
            product: { tenantId },
          },
        });

    const costMap = new Map<string, number>();
    for (const c of costs) {
      costMap.set(`${c.warehouseId}-${c.productId}`, Number(c.avgCostPerBase));
    }

    const data = stocks.map((s) => {
      const unitsDesc = s.product.units.map((u) => ({
        name: u.name,
        factorToBase: u.factorToBase,
      }));

      const multiUomFormatted = formatBaseToMultiUom(s.qtyBase, unitsDesc);
      const avgCost = costMap.get(`${s.warehouseId}-${s.productId}`) || 0;

      return {
        id: s.id,
        warehouseId: s.warehouseId,
        warehouseName: s.warehouse.name,
        warehouseCode: s.warehouse.code,
        productId: s.productId,
        productSku: s.product.sku,
        productName: s.product.name,
        baseUnitName: s.product.baseUnitName,
        batchNumber: s.batch?.batchNumber || null,
        expiredDate: s.batch?.expiredDate || null,
        qtyBase: s.qtyBase,
        multiUomFormatted,
        minStockAlert: s.product.minStockAlert,
        isLowStock: s.qtyBase <= s.product.minStockAlert,
        avgCostPerBase: shouldMaskCost ? undefined : avgCost,
        totalInventoryValue: shouldMaskCost
          ? undefined
          : Math.round(s.qtyBase * avgCost),
      };
    });

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

  // ───────────────────────────────────────────────────────────────────────────
  // STOCK MOVEMENTS (SINGLE LEDGER)
  // ───────────────────────────────────────────────────────────────────────────

  async getMovements(
    tenantId: string,
    warehouseId?: string,
    productId?: string,
    page = 1,
    limit = 20,
    userRole?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      product: { tenantId },
    };

    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    const [total, movements] = await Promise.all([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { sku: true, name: true, baseUnitName: true } },
          warehouse: { select: { code: true, name: true } },
          batch: { select: { batchNumber: true, expiredDate: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const shouldMaskCost =
      userRole === 'ORDER_CASHIER' || userRole === 'WAREHOUSE';

    const data = movements.map((m) => ({
      ...m,
      unitCost: shouldMaskCost ? undefined : Number(m.unitCost),
    }));

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

  // ───────────────────────────────────────────────────────────────────────────
  // BATCH & FEFO MONITOR
  // ───────────────────────────────────────────────────────────────────────────

  async getBatches(tenantId: string, productId?: string) {
    const where: any = {
      product: { tenantId, deletedAt: null },
    };
    if (productId) where.productId = productId;

    const batches = await this.prisma.batch.findMany({
      where,
      include: {
        product: {
          select: { id: true, sku: true, name: true, baseUnitName: true },
        },
        stocks: {
          include: { warehouse: { select: { code: true, name: true } } },
        },
      },
      orderBy: { expiredDate: 'asc' },
    });

    const now = new Date();
    return batches.map((b) => {
      const exp = new Date(b.expiredDate);
      const daysUntilExpired = Math.ceil(
        (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const totalQty = b.stocks.reduce((acc, s) => acc + s.qtyBase, 0);

      return {
        id: b.id,
        productId: b.productId,
        productSku: b.product.sku,
        productName: b.product.name,
        baseUnitName: b.product.baseUnitName,
        batchNumber: b.batchNumber,
        expiredDate: b.expiredDate,
        daysUntilExpired,
        isExpired: daysUntilExpired <= 0,
        isNearExpired: daysUntilExpired > 0 && daysUntilExpired <= 90,
        totalQtyBase: totalQty,
        warehouses: b.stocks.map((s) => ({
          warehouseCode: s.warehouse.code,
          warehouseName: s.warehouse.name,
          qtyBase: s.qtyBase,
        })),
      };
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TRANSFER STOK ANTAR GUDANG
  // ───────────────────────────────────────────────────────────────────────────

  async transferStock(tenantId: string, userId: string, dto: TransferStockDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Gudang asal dan tujuan tidak boleh sama');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Cek stok gudang asal
      const sourceStock = await tx.stock.findUnique({
        where: {
          warehouseId_productId_batchId: {
            warehouseId: dto.fromWarehouseId,
            productId: dto.productId,
            batchId: dto.batchId || '',
          },
        },
      });

      if (!sourceStock || sourceStock.qtyBase < dto.qtyBase) {
        throw new BadRequestException(
          `Stok tidak mencukupi di gudang asal. Tersedia: ${sourceStock?.qtyBase || 0}`,
        );
      }

      // Ambil HPP gudang asal
      const sourceCost = await tx.warehouseProductCost.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: dto.fromWarehouseId,
            productId: dto.productId,
          },
        },
      });

      const unitCost = sourceCost ? Number(sourceCost.avgCostPerBase) : 0;

      // 2. Kurangi stok gudang asal
      await tx.stock.update({
        where: { id: sourceStock.id },
        data: { qtyBase: { decrement: dto.qtyBase } },
      });

      // 3. Tambah stok gudang tujuan
      await tx.stock.upsert({
        where: {
          warehouseId_productId_batchId: {
            warehouseId: dto.toWarehouseId,
            productId: dto.productId,
            batchId: dto.batchId || '',
          },
        },
        update: { qtyBase: { increment: dto.qtyBase } },
        create: {
          warehouseId: dto.toWarehouseId,
          productId: dto.productId,
          batchId: dto.batchId || null,
          qtyBase: dto.qtyBase,
        },
      });

      // 4. Catat ledger TRANSFER_OUT dan TRANSFER_IN
      const docId = `TRF-${Date.now()}`;

      await tx.stockMovement.create({
        data: {
          warehouseId: dto.fromWarehouseId,
          productId: dto.productId,
          batchId: dto.batchId || null,
          type: MovementType.TRANSFER_OUT,
          qtyBase: -dto.qtyBase,
          unitCost,
          sourceDocType: 'STOCK_TRANSFER',
          sourceDocId: docId,
          notes: dto.notes || 'Transfer keluar antar gudang',
          createdById: userId,
        },
      });

      await tx.stockMovement.create({
        data: {
          warehouseId: dto.toWarehouseId,
          productId: dto.productId,
          batchId: dto.batchId || null,
          type: MovementType.TRANSFER_IN,
          qtyBase: dto.qtyBase,
          unitCost,
          sourceDocType: 'STOCK_TRANSFER',
          sourceDocId: docId,
          notes: dto.notes || 'Transfer masuk antar gudang',
          createdById: userId,
        },
      });

      return {
        transferId: docId,
        qtyBase: dto.qtyBase,
        unitCost,
        status: 'SUCCESS',
      };
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STOCK ADJUSTMENT / OPNAME
  // ───────────────────────────────────────────────────────────────────────────

  async adjustStock(tenantId: string, userId: string, dto: AdjustStockDto) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.stock.upsert({
        where: {
          warehouseId_productId_batchId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
            batchId: dto.batchId || '',
          },
        },
        update: {},
        create: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          batchId: dto.batchId || null,
          qtyBase: 0,
        },
      });

      const delta = dto.actualQtyBase - current.qtyBase;

      const cost = await tx.warehouseProductCost.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
      });

      const unitCost = cost ? Number(cost.avgCostPerBase) : 0;

      await tx.stock.update({
        where: { id: current.id },
        data: { qtyBase: dto.actualQtyBase },
      });

      await tx.stockMovement.create({
        data: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          batchId: dto.batchId || null,
          type: MovementType.ADJUSTMENT,
          qtyBase: delta,
          unitCost,
          sourceDocType: 'STOCK_OPNAME',
          sourceDocId: `ADJ-${Date.now()}`,
          notes: dto.reason,
          createdById: userId,
        },
      });

      return {
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        previousQty: current.qtyBase,
        newQty: dto.actualQtyBase,
        delta,
      };
    });
  }
}
