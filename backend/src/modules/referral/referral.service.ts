import crypto from 'node:crypto';
import { sql } from 'kysely';
import { db } from '../../db/index.js';
import { newId } from '../../utils/id.js';
import { catatAudit } from '../../utils/audit.js';

const REFERRAL_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export type ReferralStatus = 'NONAKTIF' | 'KEDALUWARSA' | 'HABIS' | 'AKTIF';

export function deriveReferralStatus(ref: {
  is_active: boolean;
  kedaluwarsa: Date | string | null;
  kuota: number;
  jumlah_terpakai: number;
}): ReferralStatus {
  if (!ref.is_active) {
    return 'NONAKTIF';
  }
  if (ref.kedaluwarsa && new Date(ref.kedaluwarsa).getTime() < Date.now()) {
    return 'KEDALUWARSA';
  }
  if (ref.jumlah_terpakai >= ref.kuota) {
    return 'HABIS';
  }
  return 'AKTIF';
}

export function getTodayJakartaString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function generateRandomReferralCode(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += REFERRAL_CHARSET[bytes[i]! % REFERRAL_CHARSET.length];
  }
  return result;
}

export interface CreateReferralInput {
  label: string;
  kuota: number;
  kedaluwarsa?: string | null;
  kode?: string | null;
  createdBy: string;
}

export const referralService = {
  async createReferral(input: CreateReferralInput) {
    const { label, kuota, kedaluwarsa, kode, createdBy } = input;

    if (!label || label.trim().length === 0 || label.trim().length > 100) {
      return {
        success: false as const,
        status: 400,
        code: 'INVALID_LABEL',
        message: 'Label wajib diisi (1-100 karakter)',
      };
    }

    if (!Number.isInteger(kuota) || kuota < 1) {
      return {
        success: false as const,
        status: 400,
        code: 'INVALID_KUOTA',
        message: 'Kuota harus berupa bilangan bulat minimal 1',
      };
    }

    let kedaluwarsaDate: Date | null = null;
    if (kedaluwarsa && kedaluwarsa.trim().length > 0) {
      const trimmedDate = kedaluwarsa.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        return {
          success: false as const,
          status: 400,
          code: 'INVALID_DATE_FORMAT',
          message: 'Format tanggal kedaluwarsa harus YYYY-MM-DD',
        };
      }

      const todayJakarta = getTodayJakartaString();
      if (trimmedDate < todayJakarta) {
        return {
          success: false as const,
          status: 400,
          code: 'DATE_IN_PAST',
          message: 'Tanggal kedaluwarsa harus hari ini atau setelahnya',
        };
      }

      kedaluwarsaDate = new Date(`${trimmedDate}T23:59:59+07:00`);
      if (isNaN(kedaluwarsaDate.getTime())) {
        return {
          success: false as const,
          status: 400,
          code: 'INVALID_DATE',
          message: 'Tanggal kedaluwarsa tidak valid',
        };
      }
    }

    let finalKode: string;

    if (kode && kode.trim().length > 0) {
      const manualKode = kode.trim().toUpperCase();
      if (!/^[A-Z0-9-]{4,20}$/.test(manualKode)) {
        return {
          success: false as const,
          status: 400,
          code: 'INVALID_CODE_FORMAT',
          message:
            'Kode manual harus 4-20 karakter dan hanya boleh berisi huruf besar, angka, dan tanda strip (-)',
        };
      }

      const existing = await db
        .selectFrom('kode_referral')
        .where(sql`lower(kode)`, '=', manualKode.toLowerCase())
        .select('id')
        .executeTakeFirst();

      if (existing) {
        return {
          success: false as const,
          status: 409,
          code: 'CODE_ALREADY_EXISTS',
          message: 'Kode sudah dipakai',
        };
      }

      finalKode = manualKode;
    } else {
      let attempts = 0;
      let generated = '';
      while (attempts < 10) {
        generated = generateRandomReferralCode(8);
        const existing = await db
          .selectFrom('kode_referral')
          .where('kode', '=', generated)
          .select('id')
          .executeTakeFirst();

        if (!existing) {
          break;
        }
        attempts++;
      }

      if (!generated || attempts >= 10) {
        return {
          success: false as const,
          status: 500,
          code: 'CODE_GEN_FAILED',
          message: 'Gagal membuat kode referral unik otomatis',
        };
      }

      finalKode = generated;
    }

    const id = newId();

    await db
      .insertInto('kode_referral')
      .values({
        id,
        kode: finalKode,
        label: label.trim(),
        kuota,
        jumlah_terpakai: 0,
        kedaluwarsa: kedaluwarsaDate,
        is_active: true,
        created_by: createdBy,
      })
      .execute();

    await catatAudit(db, {
      pelaku_id: createdBy,
      aksi: 'BUAT_KODE_REFERRAL',
      objek: 'kode_referral',
      detail: {
        id,
        kode: finalKode,
        label: label.trim(),
        kuota,
        kedaluwarsa: kedaluwarsaDate,
      },
    });

    const created = await db
      .selectFrom('kode_referral')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirstOrThrow();

    const sisa_kuota = Math.max(0, created.kuota - created.jumlah_terpakai);
    const status = deriveReferralStatus(created);

    return {
      success: true as const,
      data: {
        ...created,
        sisa_kuota,
        status,
      },
    };
  },

  async listReferrals() {
    const list = await db
      .selectFrom('kode_referral')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();

    return list.map((item) => ({
      ...item,
      sisa_kuota: Math.max(0, item.kuota - item.jumlah_terpakai),
      status: deriveReferralStatus(item),
    }));
  },

  async getSummary() {
    const allCodes = await db.selectFrom('kode_referral').selectAll().execute();
    const now = Date.now();
    const in7Days = now + 7 * 24 * 60 * 60 * 1000;

    let kodeAktif = 0;
    let pendaftarLewatKode = 0;
    let sisaKuota = 0;
    let kedaluwarsa7Hari = 0;

    for (const code of allCodes) {
      pendaftarLewatKode += Number(code.jumlah_terpakai ?? 0);
      const status = deriveReferralStatus(code);
      if (status === 'AKTIF') {
        kodeAktif++;
        const sisa = Math.max(0, code.kuota - code.jumlah_terpakai);
        sisaKuota += sisa;
        if (code.kedaluwarsa) {
          const expTime = new Date(code.kedaluwarsa).getTime();
          if (expTime > now && expTime <= in7Days) {
            kedaluwarsa7Hari++;
          }
        }
      }
    }

    return {
      kode_aktif: kodeAktif,
      pendaftar_lewat_kode: pendaftarLewatKode,
      sisa_kuota: sisaKuota,
      kedaluwarsa_7_hari: kedaluwarsa7Hari,
    };
  },

  async getPendaftar(id: string) {
    const code = await db
      .selectFrom('kode_referral')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (!code) {
      return {
        success: false as const,
        status: 404,
        code: 'NOT_FOUND',
        message: 'Kode referral tidak ditemukan',
      };
    }

    const pendaftar = await db
      .selectFrom('users')
      .where('kode_referral_id', '=', id)
      .select(['id', 'nama', 'kontak', 'status', 'created_at'])
      .orderBy('created_at', 'desc')
      .execute();

    return {
      success: true as const,
      data: {
        referral: {
          id: code.id,
          kode: code.kode,
          label: code.label,
        },
        pendaftar,
      },
    };
  },

  async deactivateReferral(id: string, userId: string) {
    const code = await db
      .selectFrom('kode_referral')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (!code) {
      return {
        success: false as const,
        status: 404,
        code: 'NOT_FOUND',
        message: 'Kode referral tidak ditemukan',
      };
    }

    if (!code.is_active) {
      return {
        success: true as const,
      };
    }

    await db
      .updateTable('kode_referral')
      .set({ is_active: false })
      .where('id', '=', id)
      .execute();

    await catatAudit(db, {
      pelaku_id: userId,
      aksi: 'NONAKTIFKAN_KODE_REFERRAL',
      objek: 'kode_referral',
      detail: {
        id: code.id,
        kode: code.kode,
      },
    });

    return {
      success: true as const,
    };
  },
};

