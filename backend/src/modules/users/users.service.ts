import bcrypt from 'bcryptjs';
import { sql } from 'kysely';
import { db } from '../../db/index.js';
import { newId } from '../../utils/id.js';
import { catatAudit } from '../../utils/audit.js';
import { buatPasswordSementara } from '../../utils/password-sementara.js';
import type { AuthUser } from '../../plugins/auth.js';

export interface CreateStafInput {
  nama: string;
  email: string;
  peran: string;
  kontak?: string | null;
}

export interface ListStafQuery {
  peran?: string;
  status?: 'AKTIF' | 'NONAKTIF';
  q?: string;
  belum_ganti_password?: boolean | string;
  page?: number;
  limit?: number;
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; status: number; code: string; message: string };

export const usersService = {
  /**
   * Membuat akun staf baru (WAKIL_ADMIN atau PENASMI)
   */
  async createStaf(
    input: CreateStafInput,
    requester: AuthUser
  ): Promise<
    ServiceResult<{
      user: {
        id: string;
        nama: string;
        username: string;
        peran: 'WAKIL_ADMIN' | 'PENASMI';
        status: 'AKTIF';
        kontak: string | null;
        wajib_ganti_password: boolean;
      };
      password_sementara: string;
    }>
  > {
    const { peran, email, nama, kontak } = input;

    // 1. Validasi peran
    if (peran !== 'WAKIL_ADMIN' && peran !== 'PENASMI') {
      return {
        success: false,
        status: 400,
        code: 'INVALID_ROLE',
        message: 'Peran staf harus WAKIL_ADMIN atau PENASMI',
      };
    }

    // 2. Hak akses peran: Wakil Admin tidak boleh membuat Wakil Admin
    if (requester.peran === 'WAKIL_ADMIN' && peran === 'WAKIL_ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Anda tidak memiliki hak akses untuk membuat akun Wakil Admin',
      };
    }

    // 3. Validasi nama
    const trimmedNama = (nama ?? '').trim();
    if (trimmedNama.length < 1 || trimmedNama.length > 100) {
      return {
        success: false,
        status: 400,
        code: 'INVALID_NAMA',
        message: 'Nama staf wajib 1-100 karakter',
      };
    }

    // 4. Validasi email (wajib, harus ada @, maks 254 char, bukan nomor HP)
    const trimmedEmail = (email ?? '').trim().toLowerCase();
    if (!trimmedEmail || trimmedEmail.length > 254 || !trimmedEmail.includes('@')) {
      return {
        success: false,
        status: 400,
        code: 'INVALID_EMAIL',
        message: 'Masukkan email yang valid',
      };
    }

    // Format email valid: cek username @ domain . tld
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return {
        success: false,
        status: 400,
        code: 'INVALID_EMAIL',
        message: 'Masukkan email yang valid',
      };
    }

    // 5. Cek duplikasi username (case-insensitive)
    const existingUser = await db
      .selectFrom('users')
      .where(sql`lower(username)`, '=', trimmedEmail)
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

    // 6. Validasi kontak opsional
    let normalizedKontak: string | null = null;
    if (kontak && typeof kontak === 'string') {
      const trimmedKontak = kontak.trim();
      if (trimmedKontak.length > 0) {
        const cleanedPhone = trimmedKontak.replace(/[\s-]/g, '');
        if (!/^\+?\d{8,15}$/.test(cleanedPhone)) {
          return {
            success: false,
            status: 400,
            code: 'INVALID_KONTAK',
            message: 'Nomor kontak harus 8-15 digit angka (boleh diawali +)',
          };
        }
        normalizedKontak = cleanedPhone;
      }
    }

    // 7. Buat password sementara dan hash bcryptjs cost 12
    const passwordSementara = buatPasswordSementara();
    const passwordHash = await bcrypt.hash(passwordSementara, 12);
    const newUserId = newId();

    // 8. Simpan ke database
    await db
      .insertInto('users')
      .values({
        id: newUserId,
        nama: trimmedNama,
        username: trimmedEmail,
        kontak: normalizedKontak,
        password_hash: passwordHash,
        peran: peran,
        status: 'AKTIF',
        wajib_ganti_password: true,
        failed_login_attempts: 0,
        locked_until: null,
        kode_referral_id: null,
      })
      .execute();

    // 9. Catat audit (PERINGATAN: jangan pernah mencatat password sementara di log/audit!)
    await catatAudit(db, {
      pelaku_id: requester.id,
      aksi: 'BUAT_AKUN_STAF',
      objek: newUserId,
      detail: {
        peran,
        email: trimmedEmail,
        nama: trimmedNama,
      },
    });

    return {
      success: true,
      data: {
        user: {
          id: newUserId,
          nama: trimmedNama,
          username: trimmedEmail,
          peran,
          status: 'AKTIF',
          kontak: normalizedKontak,
          wajib_ganti_password: true,
        },
        password_sementara: passwordSementara,
      },
    };
  },

  /**
   * Mengambil daftar staf dengan paginasi dan filter
   */
  async listStaf(
    query: ListStafQuery,
    requester: AuthUser
  ): Promise<
    ServiceResult<{
      data: Array<{
        id: string;
        nama: string;
        username: string;
        kontak: string | null;
        peran: 'ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI';
        status: 'MENUNGGU' | 'AKTIF' | 'NONAKTIF';
        wajib_ganti_password: boolean;
        created_at: Date;
      }>;
      total: number;
      page: number;
      limit: number;
    }>
  > {
    // 1. Hak akses peran: Wakil Admin dilarang melihat daftar WAKIL_ADMIN
    if (requester.peran === 'WAKIL_ADMIN') {
      if (query.peran === 'WAKIL_ADMIN') {
        return {
          success: false,
          status: 403,
          code: 'FORBIDDEN',
          message: 'Anda tidak memiliki hak akses untuk melihat daftar akun Wakil Admin',
        };
      }
    }

    // Tentukan peran yang diizinkan untuk query
    let allowedRoles: ('WAKIL_ADMIN' | 'PENASMI')[];
    if (requester.peran === 'WAKIL_ADMIN') {
      allowedRoles = ['PENASMI'];
    } else {
      // ADMIN
      if (query.peran === 'WAKIL_ADMIN' || query.peran === 'PENASMI') {
        allowedRoles = [query.peran];
      } else {
        allowedRoles = ['WAKIL_ADMIN', 'PENASMI'];
      }
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    // Bangun query filter
    let baseQuery = db.selectFrom('users').where('peran', 'in', allowedRoles);

    if (query.status) {
      baseQuery = baseQuery.where('status', '=', query.status);
    }

    if (query.belum_ganti_password !== undefined) {
      const isBelum =
        query.belum_ganti_password === true ||
        query.belum_ganti_password === 'true';
      baseQuery = baseQuery.where('wajib_ganti_password', '=', isBelum);
    }

    // Filter pencarian teks q (nama dan username, case-insensitive, escape % dan _)
    if (query.q && typeof query.q === 'string' && query.q.trim().length > 0) {
      const escapedQ = query.q.trim().replace(/[\\%_]/g, '\\$&');
      const pattern = `%${escapedQ}%`;
      baseQuery = baseQuery.where(
        sql<boolean>`(nama ILIKE ${pattern} ESCAPE '\\' OR username ILIKE ${pattern} ESCAPE '\\')`
      );
    }

    // Ambil total count
    const countResult = await baseQuery
      .select(sql<string>`count(*)`.as('count'))
      .executeTakeFirst();
    const total = Number(countResult?.count || 0);

    // Ambil data item
    const items = await baseQuery
      .select([
        'id',
        'nama',
        'username',
        'kontak',
        'peran',
        'status',
        'wajib_ganti_password',
        'created_at',
      ])
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const formattedData = items.map((u) => ({
      id: u.id,
      nama: u.nama,
      username: u.username,
      kontak: u.kontak,
      peran: u.peran,
      status: u.status,
      wajib_ganti_password: Boolean(u.wajib_ganti_password),
      created_at: u.created_at,
    }));

    return {
      success: true,
      data: {
        data: formattedData,
        total,
        page,
        limit,
      },
    };
  },

  /**
   * Mengambil ringkasan staf (FR-18b)
   */
  async getRingkasan(
    requester: AuthUser
  ): Promise<
    ServiceResult<{
      penasmi_aktif: number;
      belum_ganti_password: number;
      wakil_admin_aktif?: number;
    }>
  > {
    // 1. penasmi_aktif: jumlah PENASMI status AKTIF
    const penasmiAktifRes = await db
      .selectFrom('users')
      .where('peran', '=', 'PENASMI')
      .where('status', '=', 'AKTIF')
      .select(sql<string>`count(*)`.as('count'))
      .executeTakeFirst();
    const penasmi_aktif = Number(penasmiAktifRes?.count || 0);

    // 2. belum_ganti_password: jumlah PENASMI status AKTIF yang wajib_ganti_password = true
    const belumGantiRes = await db
      .selectFrom('users')
      .where('peran', '=', 'PENASMI')
      .where('status', '=', 'AKTIF')
      .where('wajib_ganti_password', '=', true)
      .select(sql<string>`count(*)`.as('count'))
      .executeTakeFirst();
    const belum_ganti_password = Number(belumGantiRes?.count || 0);

    if (requester.peran === 'ADMIN') {
      const wakilAktifRes = await db
        .selectFrom('users')
        .where('peran', '=', 'WAKIL_ADMIN')
        .where('status', '=', 'AKTIF')
        .select(sql<string>`count(*)`.as('count'))
        .executeTakeFirst();
      const wakil_admin_aktif = Number(wakilAktifRes?.count || 0);

      return {
        success: true,
        data: {
          penasmi_aktif,
          belum_ganti_password,
          wakil_admin_aktif,
        },
      };
    }

    return {
      success: true,
      data: {
        penasmi_aktif,
        belum_ganti_password,
      },
    };
  },

  /**
   * Reset password pengguna (FR-04)
   * Berlaku untuk WAKIL_ADMIN, PENASMI, dan SANTRI sesuai matriks hak akses.
   */
  async resetPassword(
    targetUserId: string,
    requester: AuthUser
  ): Promise<
    ServiceResult<{
      ok: true;
      password_sementara: string;
    }>
  > {
    const targetUser = await db
      .selectFrom('users')
      .where('id', '=', targetUserId)
      .selectAll()
      .executeTakeFirst();

    if (!targetUser) {
      return {
        success: false,
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'Pengguna tidak ditemukan',
      };
    }

    // Akun ADMIN tidak bisa direset lewat endpoint ini
    if (targetUser.peran === 'ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Password akun Admin tidak dapat direset melalui fitur ini',
      };
    }

    // Wakil Admin tidak boleh mereset Wakil Admin
    if (requester.peran === 'WAKIL_ADMIN' && targetUser.peran === 'WAKIL_ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Anda tidak memiliki hak akses untuk mereset password Wakil Admin',
      };
    }

    // Buat password sementara baru dan hash
    const passwordSementara = buatPasswordSementara();
    const newHash = await bcrypt.hash(passwordSementara, 12);

    // Update data target: wajib ganti password = true, reset failed login, buka kunci
    await db
      .updateTable('users')
      .set({
        password_hash: newHash,
        wajib_ganti_password: true,
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date(),
      })
      .where('id', '=', targetUser.id)
      .execute();

    // Catat audit (tanpa teks password)
    await catatAudit(db, {
      pelaku_id: requester.id,
      aksi: 'RESET_PASSWORD',
      objek: targetUser.id,
      detail: {
        peran: targetUser.peran,
        nama: targetUser.nama,
      },
    });

    return {
      success: true,
      data: {
        ok: true,
        password_sementara: passwordSementara,
      },
    };
  },

  /**
   * Menonaktifkan akun staf (FR-05)
   */
  async nonaktifkanUser(
    targetUserId: string,
    requester: AuthUser
  ): Promise<
    ServiceResult<{
      user: {
        id: string;
        nama: string;
        username: string;
        peran: 'ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI';
        status: 'NONAKTIF';
      };
    }>
  > {
    const targetUser = await db
      .selectFrom('users')
      .where('id', '=', targetUserId)
      .selectAll()
      .executeTakeFirst();

    if (!targetUser) {
      return {
        success: false,
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'Pengguna tidak ditemukan',
      };
    }

    // Target SANTRI ditolak di sini
    if (targetUser.peran === 'SANTRI') {
      return {
        success: false,
        status: 400,
        code: 'INVALID_TARGET',
        message: 'Pengelolaan akun santri dilakukan lewat manajemen santri',
      };
    }

    // Akun ADMIN tidak bisa dinonaktifkan oleh siapa pun
    if (targetUser.peran === 'ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Akun Admin utama tidak dapat dinonaktifkan',
      };
    }

    // Seseorang tidak bisa menonaktifkan akunnya sendiri
    if (targetUser.id === requester.id) {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Anda tidak dapat menonaktifkan akun Anda sendiri',
      };
    }

    // Wakil Admin tidak boleh menonaktifkan Wakil Admin
    if (requester.peran === 'WAKIL_ADMIN' && targetUser.peran === 'WAKIL_ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Anda tidak memiliki hak akses untuk mengubah status akun Wakil Admin',
      };
    }

    // Jika sudah NONAKTIF, tetap balas 200 tanpa error
    if (targetUser.status === 'NONAKTIF') {
      return {
        success: true,
        data: {
          user: {
            id: targetUser.id,
            nama: targetUser.nama,
            username: targetUser.username,
            peran: targetUser.peran,
            status: 'NONAKTIF',
          },
        },
      };
    }

    // Ubah status ke NONAKTIF
    await db
      .updateTable('users')
      .set({
        status: 'NONAKTIF',
        updated_at: new Date(),
      })
      .where('id', '=', targetUser.id)
      .execute();

    // Catat audit
    await catatAudit(db, {
      pelaku_id: requester.id,
      aksi: 'NONAKTIFKAN_AKUN',
      objek: targetUser.id,
      detail: {
        peran: targetUser.peran,
        nama: targetUser.nama,
      },
    });

    return {
      success: true,
      data: {
        user: {
          id: targetUser.id,
          nama: targetUser.nama,
          username: targetUser.username,
          peran: targetUser.peran,
          status: 'NONAKTIF',
        },
      },
    };
  },

  /**
   * Mengaktifkan kembali akun staf (FR-05)
   */
  async aktifkanUser(
    targetUserId: string,
    requester: AuthUser
  ): Promise<
    ServiceResult<{
      user: {
        id: string;
        nama: string;
        username: string;
        peran: 'ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI';
        status: 'AKTIF';
      };
    }>
  > {
    const targetUser = await db
      .selectFrom('users')
      .where('id', '=', targetUserId)
      .selectAll()
      .executeTakeFirst();

    if (!targetUser) {
      return {
        success: false,
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'Pengguna tidak ditemukan',
      };
    }

    // Target SANTRI ditolak di sini
    if (targetUser.peran === 'SANTRI') {
      return {
        success: false,
        status: 400,
        code: 'INVALID_TARGET',
        message: 'Pengelolaan akun santri dilakukan lewat manajemen santri',
      };
    }

    // Akun ADMIN
    if (targetUser.peran === 'ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Akun Admin utama sudah aktif',
      };
    }

    // Wakil Admin tidak boleh mengubah status Wakil Admin
    if (requester.peran === 'WAKIL_ADMIN' && targetUser.peran === 'WAKIL_ADMIN') {
      return {
        success: false,
        status: 403,
        code: 'FORBIDDEN',
        message: 'Anda tidak memiliki hak akses untuk mengubah status akun Wakil Admin',
      };
    }

    // Jika sudah AKTIF, tetap balas 200 tanpa error
    if (targetUser.status === 'AKTIF') {
      return {
        success: true,
        data: {
          user: {
            id: targetUser.id,
            nama: targetUser.nama,
            username: targetUser.username,
            peran: targetUser.peran,
            status: 'AKTIF',
          },
        },
      };
    }

    // Ubah status ke AKTIF
    await db
      .updateTable('users')
      .set({
        status: 'AKTIF',
        updated_at: new Date(),
      })
      .where('id', '=', targetUser.id)
      .execute();

    // Catat audit
    await catatAudit(db, {
      pelaku_id: requester.id,
      aksi: 'AKTIFKAN_AKUN',
      objek: targetUser.id,
      detail: {
        peran: targetUser.peran,
        nama: targetUser.nama,
      },
    });

    return {
      success: true,
      data: {
        user: {
          id: targetUser.id,
          nama: targetUser.nama,
          username: targetUser.username,
          peran: targetUser.peran,
          status: 'AKTIF',
        },
      },
    };
  },
};
