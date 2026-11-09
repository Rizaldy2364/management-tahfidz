import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './index.js';
import { newId } from '../utils/id.js';

dotenv.config();

async function run(): Promise<void> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.trim() === '') {
    console.error('Error: ADMIN_PASSWORD di .env tidak boleh kosong untuk seeding.');
    process.exitCode = 1;
    return;
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  // 1. Seed pondok_settings (idempotent)
  const existingSettings = await db
    .selectFrom('pondok_settings')
    .selectAll()
    .executeTakeFirst();

  if (!existingSettings) {
    const defaultSkalaNilai = {
      jenis: 'KATA',
      tingkat: [
        { tingkat: 1, label: 'Mumtaz', min: 90, max: 100, lulus: true },
        { tingkat: 2, label: 'Jayyid', min: 75, max: 89, lulus: true },
        { tingkat: 3, label: 'Maqbul', min: 60, max: 74, lulus: true },
        { tingkat: 4, label: 'Rasib', min: 0, max: 59, lulus: false },
      ],
    };

    await db
      .insertInto('pondok_settings')
      .values({
        id: newId(),
        nama_pondok: 'Pondok Pesantren Tahfidz',
        kontak: null,
        alamat: null,
        tahun_ajaran: '2026/2027',
        semester: '1',
        satuan_setoran: 'HALAMAN',
        batas_koreksi_hari: 3,
        batas_gagal_login: 5,
        durasi_kunci_menit: 15,
        skala_nilai_config: JSON.stringify(defaultSkalaNilai),
      })
      .execute();
    console.log('Seed: pondok_settings default berhasil dibuat.');
  } else {
    console.log('Seed: pondok_settings sudah ada, lewati.');
  }

  // 2. Seed akun ADMIN (idempotent)
  const existingAdmin = await db
    .selectFrom('users')
    .where('username', '=', adminUsername)
    .selectAll()
    .executeTakeFirst();

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db
      .insertInto('users')
      .values({
        id: newId(),
        nama: 'Administrator',
        kontak: null,
        username: adminUsername,
        password_hash: passwordHash,
        peran: 'ADMIN',
        status: 'AKTIF',
        wajib_ganti_password: true,
        failed_login_attempts: 0,
        locked_until: null,
        kode_referral_id: null,
      })
      .execute();
    console.log(`Seed: Akun ADMIN "${adminUsername}" berhasil dibuat.`);
  } else {
    console.log(`Seed: Akun ADMIN "${adminUsername}" sudah ada, lewati.`);
  }
}

run()
  .catch((err) => {
    console.error('Terjadi kesalahan fatal saat seeding:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
