import {
  calculateMovingAverageCost,
  allocateFefoBatches,
  BatchCandidate,
} from './inventory-math';

describe('Inventory Math (PRD FR-002 & FR-003 Compliance)', () => {
  describe('calculateMovingAverageCost (FR-002)', () => {
    it('menghitung HPP baru sesuai kriteria BDD FR-002: 100@10.000 + 50@13.000 = Rp 11.000', () => {
      // (100 * 10.000) + (50 * 13.000) = 1.000.000 + 650.000 = 1.650.000 / 150 = 11.000
      const newHpp = calculateMovingAverageCost(100, 10000, 50, 13000);
      expect(newHpp).toBe(11000);
    });

    it('menggunakan harga beli masuk jika stok saat ini 0', () => {
      const newHpp = calculateMovingAverageCost(0, 0, 50, 12500);
      expect(newHpp).toBe(12500);
    });

    it('mengembalikan HPP lama jika tidak ada barang masuk (incomingQty <= 0)', () => {
      const newHpp = calculateMovingAverageCost(100, 10000, 0, 15000);
      expect(newHpp).toBe(10000);
    });

    it('mendukung pecahan desimal hingga 4 digit eksak', () => {
      // 10 @ 10.50 + 20 @ 11.20 = (105 + 224) / 30 = 329 / 30 = 10.9667
      const newHpp = calculateMovingAverageCost(10, 10.5, 20, 11.2);
      expect(newHpp).toBe(10.9667);
    });
  });

  describe('allocateFefoBatches (FR-003)', () => {
    const referenceDate = new Date('2026-11-25');

    const batches: BatchCandidate[] = [
      {
        id: 'b2',
        batchNumber: 'B2',
        expiredDate: new Date('2027-03-10'),
        availableQty: 60,
      },
      {
        id: 'b1',
        batchNumber: 'B1',
        expiredDate: new Date('2027-01-15'),
        availableQty: 40,
      },
      {
        id: 'b_expired',
        batchNumber: 'B_EXPIRED',
        expiredDate: new Date('2026-10-01'), // Sudah expired
        availableQty: 100,
      },
    ];

    it('mengalokasikan 40 dari B1 dan 10 dari B2 untuk permintaan 50 Pcs (FR-003)', () => {
      const result = allocateFefoBatches(50, batches, referenceDate);

      expect(result.success).toBe(true);
      expect(result.unallocatedQty).toBe(0);
      expect(result.allocations).toHaveLength(2);
      expect(result.allocations[0]).toEqual({
        batchId: 'b1',
        batchNumber: 'B1',
        allocatedQty: 40,
      });
      expect(result.allocations[1]).toEqual({
        batchId: 'b2',
        batchNumber: 'B2',
        allocatedQty: 10,
      });
    });

    it('otomatis menolak alokasi dari batch yang sudah kadaluarsa', () => {
      // Hanya B1 (40) dan B2 (60) yang valid = total 100. Jika minta 110, sisa 10 unallocated
      const result = allocateFefoBatches(110, batches, referenceDate);

      expect(result.success).toBe(false);
      expect(result.unallocatedQty).toBe(10);
      expect(result.allocations.some((a) => a.batchId === 'b_expired')).toBe(
        false,
      );
    });

    it('mengembalikan sukses kosong jika requestedQty <= 0', () => {
      const result = allocateFefoBatches(0, batches, referenceDate);
      expect(result.success).toBe(true);
      expect(result.allocations).toHaveLength(0);
    });
  });
});
