/**
 * Menghitung Moving Average HPP (Cost of Goods Sold) per unit dasar.
 * Sesuai PRD FR-002:
 * HPP Baru = ((Stok Lama * HPP Lama) + (Qty Masuk * Harga Beli Masuk)) / (Stok Lama + Qty Masuk)
 */
export function calculateMovingAverageCost(
  currentQty: number,
  currentAvgCost: number,
  incomingQty: number,
  incomingCost: number,
): number {
  if (incomingQty <= 0) {
    return currentAvgCost;
  }

  // Jika stok saat ini 0 atau negatif, HPP baru mengikuti harga beli masuk langsung
  if (currentQty <= 0) {
    return incomingCost;
  }

  const currentTotalValue = currentQty * currentAvgCost;
  const incomingTotalValue = incomingQty * incomingCost;
  const newTotalQty = currentQty + incomingQty;

  const newAvgCost = (currentTotalValue + incomingTotalValue) / newTotalQty;

  // Bulatkan hingga 4 desimal untuk presisi moving average sesuai schema Decimal(18, 4)
  return Math.round(newAvgCost * 10000) / 10000;
}

export interface BatchCandidate {
  id: string;
  batchNumber: string;
  expiredDate: Date;
  availableQty: number;
}

export interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  allocatedQty: number;
}

/**
 * Mengalokasikan pengeluaran barang berbasis FEFO (First Expired, First Out).
 * Sesuai PRD FR-003:
 * Mengambil batch yang belum expired dengan tanggal kadaluarsa paling awal terlebih dahulu.
 */
export function allocateFefoBatches(
  requestedQty: number,
  batches: BatchCandidate[],
  currentDate = new Date(),
): {
  success: boolean;
  allocations: BatchAllocation[];
  unallocatedQty: number;
} {
  if (requestedQty <= 0) {
    return { success: true, allocations: [], unallocatedQty: 0 };
  }

  // 1. Saring hanya batch yang belum expired
  const validBatches = batches
    .filter((b) => new Date(b.expiredDate).getTime() >= currentDate.getTime())
    // 2. Urutkan berdasarkan expiredDate asc (terdekat expired lebih dulu)
    .sort(
      (a, b) =>
        new Date(a.expiredDate).getTime() - new Date(b.expiredDate).getTime(),
    );

  let remaining = requestedQty;
  const allocations: BatchAllocation[] = [];

  for (const b of validBatches) {
    if (remaining <= 0) break;
    if (b.availableQty <= 0) continue;

    const takeQty = Math.min(b.availableQty, remaining);
    allocations.push({
      batchId: b.id,
      batchNumber: b.batchNumber,
      allocatedQty: takeQty,
    });
    remaining -= takeQty;
  }

  return {
    success: remaining === 0,
    allocations,
    unallocatedQty: remaining,
  };
}
