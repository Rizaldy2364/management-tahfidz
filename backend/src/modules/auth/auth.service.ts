import bcrypt from 'bcryptjs';
import { sql } from 'kysely';
import { db } from '../../db/index.js';
import { newId } from '../../utils/id.js';
import { catatAudit } from '../../utils/audit.js';
import {
  normalisasiPengenalLogin,
  normalisasiPengenalPendaftaran,
} from '../../utils/identitas.js';
import type { AuthUser } from '../../plugins/auth.js';

// Hash dummy valid dengan cost 12 untuk mencegah timing attack saat username tidak ditemukan
const DUMMY_HASH = '$2b$12$2jCYSQxYfnXO4W4/sKdaP.altzSai/IHZrIYIly8YILheM5/RGX1G';

export type LoginResult =
  | { success: true; user: AuthUser }
  | {
      success: false;
      status: number;
      code: string;
      message: string;
    };

export type ChangePasswordResult =
  | { success: true }
  | {
      success: false;
      status: number;
      code: string;
      message: string;
    };

export interface RegisterSantriInput {
  kode: string;
  nama: string;
  kontak: string;
  password: string;
  konfirmasi_password: string;
}

export type RegisterSantriResult =
  | {
      success: true;
      user: {
        id: string;
        nama: string;
        username: string;
        peran: 'SANTRI';
        status: 'MENUNGGU';
      };
    }
  | {
      success: false;
      status: number;
      code: string;
      message: string;
    };

export const authService = {
  async login(username: string, password: string): Promise<LoginResult> {
    const normalizedUsername = normalisasiPengenalLogin(username);

    // 1. Cari user berdasarkan username (tidak peka huruf besar-kecil)
    const user = await db
      .selectFrom('users')
      .where(sql`lower(username)`, '=', normalizedUsername.toLowerCase())
      .selectAll()
      .executeTakeFirst();

    // 2. Bila tidak ada, tetap jalankan bcrypt.compare terhadap hash palsu
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return {
        success: false,
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Email/nomor atau password salah',
      };
    }

    const now = new Date();

    // 3. Bila locked_until masih di masa depan: balas 423 dengan sisa menit penguncian tanpa periksa password
    if (user.locked_until && new Date(user.locked_until) > now) {
      const remainingMs = new Date(user.locked_until).getTime() - now.getTime();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
      return {
        success: false,
        status: 423,
        code: 'ACCOUNT_LOCKED',
        message: `Akun terkunci. Coba lagi dalam ${remainingMinutes} menit.`,
      };
    }

    // Ambil konfigurasi pondok_settings baris pertama (hanya ada satu)
    const settings = await db
      .selectFrom('pondok_settings')
      .selectAll()
      .executeTakeFirst();

    const batasGagal = settings?.batas_gagal_login ?? 5;
    const durasiKunciMenit = settings?.durasi_kunci_menit ?? 15;

    // Periksa password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    // 5. Bila password salah: naikkan failed_login_attempts
    if (!isPasswordValid) {
      const newAttempts = (user.failed_login_attempts ?? 0) + 1;

      if (newAttempts >= batasGagal) {
        const lockedUntil = new Date(Date.now() + durasiKunciMenit * 60000);
        await db
          .updateTable('users')
          .set({
            failed_login_attempts: 0,
            locked_until: lockedUntil,
            updated_at: new Date(),
          })
          .where('id', '=', user.id)
          .execute();

        return {
          success: false,
          status: 423,
          code: 'ACCOUNT_LOCKED',
          message: `Akun terkunci. Coba lagi dalam ${durasiKunciMenit} menit.`,
        };
      }

      await db
        .updateTable('users')
        .set({
          failed_login_attempts: newAttempts,
          updated_at: new Date(),
        })
        .where('id', '=', user.id)
        .execute();

      return {
        success: false,
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Email/nomor atau password salah',
      };
    }

    // 4. Bila status NONAKTIF: balas 403 Akun dinonaktifkan (setelah password dinyatakan benar)
    if (user.status === 'NONAKTIF') {
      return {
        success: false,
        status: 403,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Akun dinonaktifkan',
      };
    }

    // 6. Bila berhasil: reset failed_login_attempts = 0 dan locked_until = null
    await db
      .updateTable('users')
      .set({
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date(),
      })
      .where('id', '=', user.id)
      .execute();

    return {
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        peran: user.peran,
        status: user.status,
        wajib_ganti_password: Boolean(user.wajib_ganti_password),
      },
    };
  },

  async changePassword(
    userId: string,
    passwordLama: string,
    passwordBaru: string
  ): Promise<ChangePasswordResult> {
    const user = await db
      .selectFrom('users')
      .where('id', '=', userId)
      .select(['id', 'username', 'password_hash'])
      .executeTakeFirst();

    if (!user) {
      return {
        success: false,
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'Pengguna tidak ditemukan',
      };
    }

    const isOldValid = await bcrypt.compare(passwordLama, user.password_hash);
    if (!isOldValid) {
      return {
        success: false,
        status: 400,
        code: 'INVALID_OLD_PASSWORD',
        message: 'Password lama salah',
      };
    }

    if (passwordBaru.length < 8) {
      return {
        success: false,
        status: 400,
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password baru minimal 8 karakter',
      };
    }

    if (passwordBaru === passwordLama) {
      return {
        success: false,
        status: 400,
        code: 'PASSWORD_SAME_AS_OLD',
        message: 'Password baru tidak boleh sama dengan password lama',
      };
    }

    if (passwordBaru.toLowerCase() === user.username.toLowerCase()) {
      return {
        success: false,
        status: 400,
        code: 'PASSWORD_SAME_AS_USERNAME',
        message: 'Password baru tidak boleh sama dengan username',
      };
    }

    const newHash = await bcrypt.hash(passwordBaru, 12);

    await db
      .updateTable('users')
      .set({
        password_hash: newHash,
        wajib_ganti_password: false,
        updated_at: new Date(),
      })
      .where('id', '=', userId)
      .execute();

    return { success: true };
  },

  async registerSantri(input: RegisterSantriInput): Promise<RegisterSantriResult> {
    const { kode, nama, kontak, password, konfirmasi_password } = input;

    // Normalisasi pengenal pendaftaran (email atau nomor HP)
    const norm = normalisasiPengenalPendaftaran(kontak);
    if (!norm.success) {
      return {
        success: false,
        status: 400,
        code: 'INVALID_KONTAK',
        message: norm.message,
      };
    }

    const normalizedKontak = norm.pengenal;
    const username = normalizedKontak;

    if (!nama || nama.trim().length === 0 || nama.trim().length > 100) {
      return {
        success: false,
        status: 400,
        code: 'INVALID_NAMA',
        message: 'Nama wajib 1-100 karakter',
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        status: 400,
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password minimal 8 karakter',
      };
    }

    if (password !== konfirmasi_password) {
      return {
        success: false,
        status: 400,
        code: 'PASSWORD_MISMATCH',
        message: 'Konfirmasi password tidak cocok',
      };
    }

    if (password.toLowerCase() === username.toLowerCase()) {
      return {
        success: false,
        status: 400,
        code: 'PASSWORD_SAME_AS_USERNAME',
        message: 'Password tidak boleh sama dengan username/kontak',
      };
    }

    if (!kode || kode.trim().length === 0) {
      return {
        success: false,
        status: 400,
        code: 'REFERRAL_NOT_FOUND',
        message: 'Kode referral tidak ditemukan',
      };
    }

    return await db.transaction().execute(async (trx) => {
      // 1. Cek bentrok username di users
      const existingUser = await trx
        .selectFrom('users')
        .where(sql`lower(username)`, '=', username.toLowerCase())
        .select('id')
        .executeTakeFirst();

      if (existingUser) {
        return {
          success: false,
          status: 409,
          code: 'USERNAME_EXISTS',
          message: 'Email atau nomor sudah terdaftar',
        };
      }

      // 2. Kunci baris kode referral dengan SELECT ... FOR UPDATE
      const ref = await trx
        .selectFrom('kode_referral')
        .where(sql`lower(kode)`, '=', kode.trim().toLowerCase())
        .selectAll()
        .forUpdate()
        .executeTakeFirst();

      // Periksa berurutan dengan pesan spesifik:
      // a. kode tidak ditemukan → Kode referral tidak ditemukan
      if (!ref) {
        return {
          success: false,
          status: 400,
          code: 'REFERRAL_NOT_FOUND',
          message: 'Kode referral tidak ditemukan',
        };
      }

      // b. nonaktif → Kode referral sudah dinonaktifkan
      if (!ref.is_active) {
        return {
          success: false,
          status: 400,
          code: 'REFERRAL_INACTIVE',
          message: 'Kode referral sudah dinonaktifkan',
        };
      }

      // c. lewat tanggal → Kode referral sudah kedaluwarsa
      if (ref.kedaluwarsa && new Date(ref.kedaluwarsa).getTime() < Date.now()) {
        return {
          success: false,
          status: 400,
          code: 'REFERRAL_EXPIRED',
          message: 'Kode referral sudah kedaluwarsa',
        };
      }

      // d. kuota penuh → Kuota kode referral sudah habis
      if (ref.jumlah_terpakai >= ref.kuota) {
        return {
          success: false,
          status: 400,
          code: 'REFERRAL_QUOTA_FULL',
          message: 'Kuota kode referral sudah habis',
        };
      }

      // Hash password dengan bcryptjs cost 12
      const passwordHash = await bcrypt.hash(password, 12);
      const newUserId = newId();

      // Buat user
      await trx
        .insertInto('users')
        .values({
          id: newUserId,
          nama: nama.trim(),
          kontak: normalizedKontak,
          username,
          password_hash: passwordHash,
          peran: 'SANTRI',
          status: 'MENUNGGU',
          wajib_ganti_password: false,
          failed_login_attempts: 0,
          locked_until: null,
          kode_referral_id: ref.id,
        })
        .execute();

      // Naikkan jumlah_terpakai sebesar 1
      await trx
        .updateTable('kode_referral')
        .set({
          jumlah_terpakai: ref.jumlah_terpakai + 1,
        })
        .where('id', '=', ref.id)
        .execute();

      // Catat audit (pelaku = user baru)
      await catatAudit(trx, {
        pelaku_id: newUserId,
        aksi: 'DAFTAR_SANTRI',
        objek: 'users',
        detail: {
          id: newUserId,
          nama: nama.trim(),
          username,
          kode_referral_id: ref.id,
        },
      });

      return {
        success: true,
        user: {
          id: newUserId,
          nama: nama.trim(),
          username,
          peran: 'SANTRI' as const,
          status: 'MENUNGGU' as const,
        },
      };
    });
  },
};
