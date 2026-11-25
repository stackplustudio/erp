import {
  convertUnitToBase,
  calculateTotalBaseQty,
  formatBaseToMultiUom,
} from './uom-converter';

describe('UOM Converter (PRD FR-001 Compliance)', () => {
  describe('convertUnitToBase', () => {
    it('mengonversi 5 Dus (faktor 12) menjadi 60 Pcs', () => {
      expect(convertUnitToBase(5, 12)).toBe(60);
    });

    it('mengembalikan 0 untuk input <= 0 atau faktor <= 0', () => {
      expect(convertUnitToBase(0, 12)).toBe(0);
      expect(convertUnitToBase(-5, 12)).toBe(0);
      expect(convertUnitToBase(5, 0)).toBe(0);
      expect(convertUnitToBase(5, -1)).toBe(0);
    });
  });

  describe('calculateTotalBaseQty (FR-001 Skenario 1)', () => {
    it('mengonversi 5 Karton Besar (faktor 48) dan 3 Dus (faktor 12) menjadi 276 Pcs', () => {
      const inputs = [
        { qty: 5, factorToBase: 48 },
        { qty: 3, factorToBase: 12 },
      ];
      expect(calculateTotalBaseQty(inputs)).toBe(276);
    });

    it('mengembalikan 0 jika array kosong', () => {
      expect(calculateTotalBaseQty([])).toBe(0);
    });
  });

  describe('formatBaseToMultiUom (FR-001 Skenario 2)', () => {
    const units = [
      { name: 'Karton', factorToBase: 48 },
      { name: 'Dus', factorToBase: 12 },
      { name: 'Pcs', factorToBase: 1 },
    ];

    it('memecah 280 Pcs menjadi "5 Karton 3 Dus 4 Pcs"', () => {
      // 5 * 48 = 240 (sisa 40)
      // 3 * 12 = 36 (sisa 4)
      // 4 * 1 = 4 (sisa 0)
      expect(formatBaseToMultiUom(280, units)).toBe('5 Karton 3 Dus 4 Pcs');
    });

    it('memecah kuantitas pas tanpa sisa terkecil, misal 96 Pcs menjadi "2 Karton"', () => {
      expect(formatBaseToMultiUom(96, units)).toBe('2 Karton');
    });

    it('memecah hanya Dus dan Pcs jika di bawah 48 Pcs', () => {
      expect(formatBaseToMultiUom(25, units)).toBe('2 Dus 1 Pcs');
    });

    it('mengembalikan "0" jika kuantitas <= 0', () => {
      expect(formatBaseToMultiUom(0, units)).toBe('0');
      expect(formatBaseToMultiUom(-10, units)).toBe('0');
    });
  });
});
