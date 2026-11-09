import { randomInt } from 'node:crypto';

// Karakter yang mudah dibaca dan disalin: tanpa 0, O, o, 1, I, l, i
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghjkmnpqrstuvwxyz';
const NUMBERS = '23456789';
const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS;

/**
 * Menghasilkan password sementara 12 karakter menggunakan crypto.randomInt.
 * Menjamin minimal 1 huruf besar, 1 huruf kecil, dan 1 angka,
 * tanpa karakter yang membingungkan/mirip (0, O, o, 1, I, l, i).
 */
export function buatPasswordSementara(): string {
  const chars: string[] = [
    UPPERCASE[randomInt(0, UPPERCASE.length)]!,
    LOWERCASE[randomInt(0, LOWERCASE.length)]!,
    NUMBERS[randomInt(0, NUMBERS.length)]!,
  ];

  for (let i = 0; i < 9; i++) {
    chars.push(ALL_CHARS[randomInt(0, ALL_CHARS.length)]!);
  }

  // Fisher-Yates shuffle cryptographically
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    const temp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = temp;
  }

  return chars.join('');
}

