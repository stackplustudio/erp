import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * PRD: Gross Profit Report per Invoice
   * Gross Profit = grandTotal - SUM(item.cogsPerBase * item.qtyBase)
   */
  async getGrossProfitReport(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      tenantId,
      isVoid: false,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const invoices = await this.prisma.salesInvoice.findMany({
      where,
      include: {
        customer: { select: { code: true, name: true } },
        items: {
          include: {
            productUnit: {
              include: { product: { select: { sku: true, name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let totalCogs = 0;

    const data = invoices.map((inv) => {
      const revenue = Number(inv.grandTotal);
      let invoiceCogs = 0;

      const items = inv.items.map((it) => {
        const itemCogs = Number(it.cogsPerBase) * it.qtyBase;
        const itemRevenue = Number(it.lineTotal);
        const itemProfit = itemRevenue - itemCogs;
        const itemMargin =
          itemRevenue > 0 ? (itemProfit / itemRevenue) * 100 : 0;
        invoiceCogs += itemCogs;

        return {
          productSku: it.productUnit.product.sku,
          productName: it.productUnit.product.name,
          unitName: it.productUnit.name,
          qty: it.qtyOrdered,
          qtyBase: it.qtyBase,
          unitPrice: Number(it.unitPrice),
          lineTotal: itemRevenue,
          cogsPerBase: Number(it.cogsPerBase),
          itemCogs,
          itemProfit,
          itemMarginPercent: Math.round(itemMargin * 10) / 10,
        };
      });

      const invoiceProfit = revenue - invoiceCogs;
      const marginPercent = revenue > 0 ? (invoiceProfit / revenue) * 100 : 0;

      totalRevenue += revenue;
      totalCogs += invoiceCogs;

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerCode: inv.customer.code,
        customerName: inv.customer.name,
        createdAt: inv.createdAt,
        revenue,
        cogs: invoiceCogs,
        grossProfit: invoiceProfit,
        marginPercent: Math.round(marginPercent * 10) / 10,
        items,
      };
    });

    const totalGrossProfit = totalRevenue - totalCogs;
    const overallMargin =
      totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    return {
      summary: {
        totalRevenue,
        totalCogs,
        totalGrossProfit,
        overallMarginPercent: Math.round(overallMargin * 10) / 10,
        invoiceCount: invoices.length,
      },
      data,
    };
  }

  /**
   * PRD: Profit & Loss (P&L) Summary
   */
  async getProfitLossSummary(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereInvoice: any = { tenantId, isVoid: false };
    const whereExpenses: any = {
      cashAccount: { tenantId },
      type: 'OUT',
      sourceDocType: { not: 'PURCHASE_ORDER' },
    };

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      whereInvoice.createdAt = dateFilter;
      whereExpenses.createdAt = dateFilter;
    }

    const [invoices, expenses] = await Promise.all([
      this.prisma.salesInvoice.findMany({
        where: whereInvoice,
        include: { items: true },
      }),
      this.prisma.cashMutation.findMany({
        where: whereExpenses,
        include: { cashAccount: true },
      }),
    ]);

    let totalRevenue = 0;
    let totalCogs = 0;

    invoices.forEach((inv) => {
      totalRevenue += Number(inv.grandTotal);
      inv.items.forEach((it) => {
        totalCogs += Number(it.cogsPerBase) * it.qtyBase;
      });
    });

    const grossProfit = totalRevenue - totalCogs;
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      revenue: {
        salesRevenue: totalRevenue,
        totalRevenue,
      },
      costOfGoodsSold: {
        cogs: totalCogs,
        totalCogs,
      },
      grossProfit,
      operatingExpenses: {
        totalExpenses,
        breakdown: expenses.map((e) => ({
          description: e.description,
          amount: Number(e.amount),
          account: e.cashAccount.name,
          date: e.createdAt,
        })),
      },
      netProfit,
      netMarginPercent: Math.round(netMarginPercent * 10) / 10,
    };
  }
}
