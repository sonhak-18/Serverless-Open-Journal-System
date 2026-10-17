/**
 * Standarisasi Penomoran ISSN (ISO 3297) & Barcode EAN-13 (GS1).
 * Mengatur kaidah numerasi baku terbitan berkala ilmiah:
 * - Algoritma Modulo 11 untuk 8 digit ISSN (XXXX-XXXX).
 * - Prefix 977 GS1 dan Algoritma Modulo 10 untuk 13 digit EAN-13 barcode.
 */

// Tabel Pola Modulasi EAN-13 (Left-Odd L, Left-Even G, Right R)
const L_PATTERNS = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G_PATTERNS = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R_PATTERNS = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];

const PARITY_MAP = [
  'LLLLLL', // 0
  'LLGLGG', // 1
  'LLGGLG', // 2
  'LLGGGL', // 3
  'LGLLGG', // 4
  'LGGLLG', // 5
  'LGGGLL', // 6
  'LGLGLG', // 7
  'LGLGGL', // 8
  'LGGLGL', // 9
];

/**
 * Menghitung Digit Pemeriksa (Check Digit) ISSN 8 digit (ISO 3297 Modulo 11).
 * Bobot pengali: 8, 7, 6, 5, 4, 3, 2.
 */
export function calculateIssnCheckDigit(base7: string): string {
  const digits = base7.replace(/\D/g, '').slice(0, 7);
  if (digits.length !== 7) return '';
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += (8 - i) * parseInt(digits[i], 10);
  }
  const remainder = sum % 11;
  if (remainder === 0) return '0';
  const check = 11 - remainder;
  return check === 10 ? 'X' : String(check);
}

/**
 * Validasi apakah nomor ISSN memenuhi format baku dan modulo 11 ISO 3297.
 */
export function validateIssn(issn: string): { isValid: boolean; normalized: string; error?: string } {
  if (!issn || typeof issn !== 'string') {
    return { isValid: false, normalized: '', error: 'Nomor ISSN kosong' };
  }

  const clean = issn.trim().toUpperCase().replace(/^ISSN\s*/i, '').replace(/[^0-9X-]/g, '');
  const match = clean.match(/^(\d{4})-?(\d{3}[\dX])$/);
  if (!match) {
    return { isValid: false, normalized: clean, error: 'Format harus 8 digit dengan strip (XXXX-XXXX)' };
  }

  const base7 = match[1] + match[2].slice(0, 3);
  const expectedCheck = calculateIssnCheckDigit(base7);
  const actualCheck = match[2].slice(3);

  if (expectedCheck !== actualCheck) {
    return {
      isValid: false,
      normalized: `${match[1]}-${match[2].slice(0, 3)}${expectedCheck}`,
      error: `Check digit tidak valid. Angka ke-8 seharusnya "${expectedCheck}" (ditemukan "${actualCheck}").`,
    };
  }

  return {
    isValid: true,
    normalized: `${match[1]}-${match[2]}`,
  };
}

/**
 * Menghitung Check Digit EAN-13 berbasis Modulo 10 (GS1 International).
 */
export function calculateEan13CheckDigit(base12: string): string {
  const digits = base12.replace(/\D/g, '').slice(0, 12);
  if (digits.length !== 12) return '0';
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const weight = i % 2 === 0 ? 1 : 3;
    sum += weight * parseInt(digits[i], 10);
  }
  const remainder = sum % 10;
  return remainder === 0 ? '0' : String(10 - remainder);
}

/**
 * Mengonversi ISSN ke representasi 13 digit EAN-13 GS1 resmi:
 * Prefix 977 + 7 digit pertama ISSN + 2 digit varian (00) + 1 digit check digit EAN-13.
 */
export function issnToEan13(issn: string, variant: string = '00'): { ean13: string; formatted: string } {
  const clean = issn.replace(/\D/g, '').slice(0, 7);
  if (clean.length < 7) {
    return { ean13: '9770000000000', formatted: '9 770000 000000' };
  }
  const safeVariant = variant.replace(/\D/g, '').slice(0, 2).padStart(2, '0');
  const base12 = `977${clean}${safeVariant}`;
  const checkDigit = calculateEan13CheckDigit(base12);
  const full = `${base12}${checkDigit}`;
  
  // Format baku visual: 9 77XXXX XXX00C
  const formatted = `${full[0]} ${full.slice(1, 4)}${full.slice(4, 7)} ${full.slice(7, 10)}${full.slice(10, 12)}${full[12]}`;
  return { ean13: full, formatted };
}

/**
 * Menghasilkan rangkaian SVG Rects untuk Barcode EAN-13 yang 100% otentik dan bisa dipindai.
 */
export function generateEan13BarcodeSvgBars(ean13: string): {
  rects: Array<{ x: number; y: number; width: number; height: number }>;
  formattedCode: string;
} {
  const digits = ean13.replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
  const first = parseInt(digits[0], 10);
  const parity = PARITY_MAP[first] || 'LLLLLL';

  let bits = '101'; // Left guard
  for (let i = 1; i <= 6; i++) {
    const d = parseInt(digits[i], 10);
    const patternType = parity[i - 1];
    bits += patternType === 'L' ? L_PATTERNS[d] : G_PATTERNS[d];
  }
  bits += '01010'; // Center guard
  for (let i = 7; i <= 12; i++) {
    const d = parseInt(digits[i], 10);
    bits += R_PATTERNS[d];
  }
  bits += '101'; // Right guard

  const barWidth = 1.35;
  const startX = 14;
  const rects: Array<{ x: number; y: number; width: number; height: number }> = [];

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      const isGuard = i < 3 || (i >= 45 && i < 50) || i >= 92;
      const height = isGuard ? 38 : 32;
      rects.push({
        x: Number((startX + i * barWidth).toFixed(2)),
        y: 2,
        width: barWidth,
        height,
      });
    }
  }

  // Format teks angka barcode
  const formattedCode = `${digits[0]}  ${digits.slice(1, 7)}  ${digits.slice(7, 13)}`;
  return { rects, formattedCode };
}
