export interface UnitDefinition {
  name: string;
  factorToBase: number;
}

/**
 * Mengonversi kuantitas pada suatu unit ke kuantitas satuan dasar (base unit).
 */
export function convertUnitToBase(qty: number, factorToBase: number): number {
  if (qty <= 0 || factorToBase <= 0) return 0;
  return Math.round(qty * factorToBase);
}

/**
 * Menghitung total kuantitas dasar dari multi-input satuan.
 * Sesuai PRD FR-001 Skenario 1:
 * 5 Karton (faktor 48) + 3 Dus (faktor 12) = 240 + 36 = 276 Pcs.
 */
export function calculateTotalBaseQty(
  inputs: { qty: number; factorToBase: number }[],
): number {
  return inputs.reduce((total, item) => {
    return total + convertUnitToBase(item.qty, item.factorToBase);
  }, 0);
}

/**
 * Memecah kuantitas satuan dasar menjadi format multi-satuan hierarkis.
 * Sesuai PRD FR-001 Skenario 2:
 * 280 Pcs -> "5 Karton 3 Dus 4 Pcs" (jika Karton=48, Dus=12, Pcs=1).
 */
export function formatBaseToMultiUom(
  totalBaseQty: number,
  units: UnitDefinition[],
): string {
  if (totalBaseQty <= 0) return '0';

  // Urutkan dari faktor terbesar ke terkecil
  const sorted = [...units].sort((a, b) => b.factorToBase - a.factorToBase);

  let remaining = totalBaseQty;
  const parts: string[] = [];

  for (const u of sorted) {
    if (u.factorToBase <= 0) continue;
    const count = Math.floor(remaining / u.factorToBase);
    if (count > 0) {
      parts.push(`${count} ${u.name}`);
      remaining %= u.factorToBase;
    }
  }

  // Jika masih ada sisa dan tidak ada unit yang pas, tampilkan sisanya
  if (remaining > 0 && parts.length === 0) {
    parts.push(`${remaining} Base`);
  }

  return parts.length > 0 ? parts.join(' ') : '0';
}
