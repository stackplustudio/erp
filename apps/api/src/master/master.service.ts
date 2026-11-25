import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  // ───────────────────────────────────────────────────────────────────────────
  // PRODUCTS & MULTI-UOM
  // ───────────────────────────────────────────────────────────────────────────

  async getProducts(
    tenantId: string,
    search?: string,
    category?: string,
    page = 1,
    limit = 20,
    userRole?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { units: { some: { barcode: { contains: search } } } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          units: {
            orderBy: { factorToBase: 'asc' },
          },
        },
      }),
    ]);

    // Mask sensitive purchasePrice for ORDER_CASHIER and WAREHOUSE (PRD 8.1)
    const shouldMaskCost =
      userRole === 'ORDER_CASHIER' || userRole === 'WAREHOUSE';

    const sanitized = products.map((p) => ({
      ...p,
      units: p.units.map((u) => {
        if (shouldMaskCost) {
          const { purchasePrice, ...rest } = u;
          return rest;
        }
        return u;
      }),
    }));

    return {
      data: sanitized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(tenantId: string, id: string, userRole?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        units: { orderBy: { factorToBase: 'asc' } },
        batches: {
          where: { expiredDate: { gte: new Date() } },
          orderBy: { expiredDate: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }

    const shouldMaskCost =
      userRole === 'ORDER_CASHIER' || userRole === 'WAREHOUSE';

    if (shouldMaskCost) {
      return {
        ...product,
        units: product.units.map((u) => {
          const { purchasePrice, ...rest } = u;
          return rest;
        }),
      };
    }

    return product;
  }

  async getProductByBarcode(
    tenantId: string,
    barcode: string,
    userRole?: string,
  ) {
    const unit = await this.prisma.productUnit.findFirst({
      where: {
        barcode,
        product: { tenantId, deletedAt: null },
      },
      include: {
        product: {
          include: {
            units: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(
        `Barcode "${barcode}" tidak ditemukan di database produk`,
      );
    }

    const shouldMaskCost =
      userRole === 'ORDER_CASHIER' || userRole === 'WAREHOUSE';

    if (shouldMaskCost) {
      const { purchasePrice, ...safeUnit } = unit;
      return {
        ...safeUnit,
        product: {
          ...unit.product,
          units: unit.product.units.map((u) => {
            const { purchasePrice: _, ...rest } = u;
            return rest;
          }),
        },
      };
    }

    return unit;
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    const existingSku = await this.prisma.product.findUnique({
      where: { tenantId_sku: { tenantId, sku: dto.sku } },
    });

    if (existingSku) {
      throw new ConflictException(
        `Produk dengan SKU "${dto.sku}" sudah terdaftar`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId,
          sku: dto.sku,
          name: dto.name,
          category: dto.category,
          brand: dto.brand,
          baseUnitName: dto.baseUnitName,
          trackBatch: dto.trackBatch ?? false,
          minStockAlert: dto.minStockAlert ?? 10,
        },
      });

      if (dto.units && dto.units.length > 0) {
        await tx.productUnit.createMany({
          data: dto.units.map((u) => ({
            productId: product.id,
            name: u.name,
            factorToBase: u.factorToBase,
            barcode: u.barcode || null,
            purchasePrice: BigInt(u.purchasePrice || 0),
            salePrice: BigInt(u.salePrice || 0),
            isBase: u.isBase ?? u.factorToBase === 1,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: { units: true },
      });
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // WAREHOUSES
  // ───────────────────────────────────────────────────────────────────────────

  async getWarehouses(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CUSTOMERS & CREDIT LIMITS
  // ───────────────────────────────────────────────────────────────────────────

  async getCustomers(tenantId: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { priceTier: true },
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

  async createCustomer(tenantId: string, dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });

    if (existing) {
      throw new ConflictException(
        `Pelanggan dengan kode "${dto.code}" sudah ada`,
      );
    }

    return this.prisma.customer.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        priceTierId: dto.priceTierId,
        creditTermDays: dto.creditTermDays ?? 0,
        creditLimit: BigInt(dto.creditLimit ?? 0),
      },
      include: { priceTier: true },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUPPLIERS
  // ───────────────────────────────────────────────────────────────────────────

  async getSuppliers(tenantId: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
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

  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });

    if (existing) {
      throw new ConflictException(
        `Supplier dengan kode "${dto.code}" sudah ada`,
      );
    }

    return this.prisma.supplier.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        contactPerson: dto.contactPerson,
        paymentTermDays: dto.paymentTermDays ?? 0,
      },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRICE TIERS
  // ───────────────────────────────────────────────────────────────────────────

  async getPriceTiers(tenantId: string) {
    return this.prisma.priceTier.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }
}
