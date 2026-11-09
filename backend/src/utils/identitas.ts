export type NormalisasiPendaftaranResult =
  | { success: true; pengenal: string; tipe: 'email' | 'phone' }
  | { success: false; message: string };

/**
 * Normalisasi pengenal untuk pendaftaran (ketat):
 * - Hapus spasi di tepi.
 * - Bila mengandung '@': dianggap email, diubah ke huruf kecil, harus format email valid, maks 254 karakter.
 * - Selain itu: dianggap nomor HP, hapus spasi dan '-', harus cocok ^\+?\d{8,15}$.
 * - Bila tidak lolos: pesan error "Masukkan email yang valid atau nomor HP 8-15 digit".
 */
export function normalisasiPengenalPendaftaran(raw: string): NormalisasiPendaftaranResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      success: false,
      message: 'Masukkan email yang valid atau nomor HP 8-15 digit',
    };
  }

  if (trimmed.includes('@')) {
    const lowerEmail = trimmed.toLowerCase();
    if (lowerEmail.length > 254) {
      return {
        success: false,
        message: 'Masukkan email yang valid atau nomor HP 8-15 digit',
      };
    }

    // Format email valid: cek username @ domain . tld
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(lowerEmail)) {
      return {
        success: false,
        message: 'Masukkan email yang valid atau nomor HP 8-15 digit',
      };
    }

    return {
      success: true,
      pengenal: lowerEmail,
      tipe: 'email',
    };
  }

  // Dianggap nomor HP
  const cleanedPhone = trimmed.replace(/[\s-]/g, '');
  if (!/^\+?\d{8,15}$/.test(cleanedPhone)) {
    return {
      success: false,
      message: 'Masukkan email yang valid atau nomor HP 8-15 digit',
    };
  }

  return {
    success: true,
    pengenal: cleanedPhone,
    tipe: 'phone',
  };
}

/**
 * Normalisasi pengenal untuk login (longgar):
 * - Hapus spasi di tepi.
 * - Bila mengandung '@' -> huruf kecil.
 * - Bila berbentuk nomor HP (hanya angka, spasi, '-', boleh diawali '+') -> hapus spasi dan '-'.
 * - Selain itu (mis. 'admin') -> pakai apa adanya dalam huruf kecil.
 * - Login TIDAK boleh menolak username biasa seperti 'admin'.
 */
export function normalisasiPengenalLogin(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  if (/^\+?[\d\s-]+$/.test(trimmed)) {
    const cleaned = trimmed.replace(/[\s-]/g, '');
    if (/^\+?\d+$/.test(cleaned)) {
      return cleaned;
    }
  }

  return trimmed.toLowerCase();
}

