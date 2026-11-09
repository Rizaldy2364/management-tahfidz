import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. pondok_settings
  await db.schema
    .createTable('pondok_settings')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('nama_pondok', 'varchar(255)', (col) => col.notNull())
    .addColumn('kontak', 'varchar(255)')
    .addColumn('alamat', 'text')
    .addColumn('tahun_ajaran', 'varchar(50)', (col) => col.notNull())
    .addColumn('semester', 'varchar(20)', (col) => col.notNull())
    .addColumn('satuan_setoran', 'varchar(20)', (col) => col.notNull())
    .addCheckConstraint(
      'pondok_settings_satuan_setoran_check',
      sql`satuan_setoran IN ('HALAMAN', 'BARIS')`
    )
    .addColumn('batas_koreksi_hari', 'integer', (col) => col.notNull().defaultTo(3))
    .addColumn('batas_gagal_login', 'integer', (col) => col.notNull().defaultTo(5))
    .addColumn('durasi_kunci_menit', 'integer', (col) => col.notNull().defaultTo(15))
    .addColumn('skala_nilai_config', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 2. users (FK kode_referral_id ditambahkan setelah tabel kode_referral dibuat)
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('nama', 'varchar(255)', (col) => col.notNull())
    .addColumn('kontak', 'varchar(255)')
    .addColumn('username', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('peran', 'varchar(20)', (col) => col.notNull())
    .addCheckConstraint(
      'users_peran_check',
      sql`peran IN ('ADMIN', 'WAKIL_ADMIN', 'PENASMI', 'SANTRI')`
    )
    .addColumn('status', 'varchar(20)', (col) => col.notNull())
    .addCheckConstraint(
      'users_status_check',
      sql`status IN ('MENUNGGU', 'AKTIF', 'NONAKTIF')`
    )
    .addColumn('wajib_ganti_password', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('failed_login_attempts', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('locked_until', 'timestamptz')
    .addColumn('kode_referral_id', 'uuid')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 3. kode_referral
  await db.schema
    .createTable('kode_referral')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('kode', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('label', 'varchar(100)', (col) => col.notNull())
    .addColumn('kuota', 'integer', (col) => col.notNull())
    .addColumn('jumlah_terpakai', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('kedaluwarsa', 'timestamptz')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_by', 'uuid', (col) => col.notNull().references('users.id'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Tambahkan foreign key constraint dari users.kode_referral_id -> kode_referral.id
  await db.schema
    .alterTable('users')
    .addForeignKeyConstraint(
      'users_kode_referral_id_fk',
      ['kode_referral_id'],
      'kode_referral',
      ['id']
    )
    .onDelete('set null')
    .execute();

  // 4. halaqah
  await db.schema
    .createTable('halaqah')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('nama', 'varchar(100)', (col) => col.notNull())
    .addColumn('penasmi_utama_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('status_aktif', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 5. jadwal_sesi_rutin
  await db.schema
    .createTable('jadwal_sesi_rutin')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('halaqah_id', 'uuid', (col) =>
      col.notNull().references('halaqah.id').onDelete('cascade')
    )
    .addColumn('nama_sesi', 'varchar(100)', (col) => col.notNull())
    .addColumn('hari', 'smallint', (col) => col.notNull())
    .addCheckConstraint('jadwal_sesi_rutin_hari_check', sql`hari >= 0 AND hari <= 6`)
    .addColumn('jam_mulai', 'time', (col) => col.notNull())
    .addColumn('jam_selesai', 'time', (col) => col.notNull())
    .addColumn('penasmi_sesi_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .execute();

  // 6. penugasan_pengganti
  await db.schema
    .createTable('penugasan_pengganti')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('halaqah_id', 'uuid', (col) =>
      col.notNull().references('halaqah.id').onDelete('cascade')
    )
    .addColumn('jadwal_sesi_id', 'uuid', (col) =>
      col.references('jadwal_sesi_rutin.id').onDelete('set null')
    )
    .addColumn('pengganti_user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('tanggal_mulai', 'date', (col) => col.notNull())
    .addColumn('tanggal_selesai', 'date', (col) => col.notNull())
    .addColumn('alasan', 'text', (col) => col.notNull())
    .addColumn('status_aktif', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('diakhiri_pada', 'timestamptz')
    .addColumn('created_by', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 7. keanggotaan_halaqah
  await db.schema
    .createTable('keanggotaan_halaqah')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('santri_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('halaqah_id', 'uuid', (col) =>
      col.notNull().references('halaqah.id').onDelete('cascade')
    )
    .addColumn('tanggal_mulai', 'date', (col) => col.notNull())
    .addColumn('tanggal_selesai', 'date')
    .execute();

  // 8. pertemuan_sesi
  await db.schema
    .createTable('pertemuan_sesi')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('halaqah_id', 'uuid', (col) =>
      col.notNull().references('halaqah.id').onDelete('cascade')
    )
    .addColumn('jadwal_sesi_id', 'uuid', (col) =>
      col.references('jadwal_sesi_rutin.id').onDelete('set null')
    )
    .addColumn('tanggal', 'date', (col) => col.notNull())
    .addColumn('nama_sesi', 'varchar(100)', (col) => col.notNull())
    .addColumn('jam_mulai', 'time', (col) => col.notNull())
    .addColumn('jam_selesai', 'time', (col) => col.notNull())
    .addColumn('is_libur', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('penasmi_pengisi_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('status_pengisian', 'varchar(20)', (col) => col.notNull().defaultTo('BELUM'))
    .addCheckConstraint(
      'pertemuan_sesi_status_pengisian_check',
      sql`status_pengisian IN ('BELUM', 'SUDAH')`
    )
    .addUniqueConstraint('pertemuan_sesi_jadwal_tanggal_unique', ['jadwal_sesi_id', 'tanggal'])
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 9. absensi
  await db.schema
    .createTable('absensi')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('pertemuan_id', 'uuid', (col) =>
      col.notNull().references('pertemuan_sesi.id').onDelete('cascade')
    )
    .addColumn('santri_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('status', 'varchar(20)', (col) => col.notNull())
    .addCheckConstraint(
      'absensi_status_check',
      sql`status IN ('HADIR', 'IZIN', 'SAKIT', 'ALFA')`
    )
    .addColumn('dicatat_oleh', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('absensi_pertemuan_santri_unique', ['pertemuan_id', 'santri_id'])
    .execute();

  // 10. setoran
  await db.schema
    .createTable('setoran')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('pertemuan_id', 'uuid', (col) =>
      col.notNull().references('pertemuan_sesi.id').onDelete('cascade')
    )
    .addColumn('santri_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('setor', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('surat', 'varchar(100)')
    .addColumn('ayat_awal', 'integer')
    .addColumn('ayat_akhir', 'integer')
    .addColumn('jumlah', sql`numeric(6, 2)`)
    .addColumn('satuan', 'varchar(20)')
    .addCheckConstraint('setoran_satuan_check', sql`satuan IS NULL OR satuan IN ('HALAMAN', 'BARIS')`)
    .addColumn('jenis', 'varchar(20)')
    .addCheckConstraint('setoran_jenis_check', sql`jenis IS NULL OR jenis IN ('ZIYADAH', 'MURAJAAH')`)
    .addColumn('tingkat_nilai', 'smallint')
    .addCheckConstraint(
      'setoran_tingkat_nilai_check',
      sql`tingkat_nilai IS NULL OR (tingkat_nilai >= 1 AND tingkat_nilai <= 4)`
    )
    .addColumn('label_nilai', 'varchar(50)')
    .addColumn('catatan', 'text')
    .addColumn('dicatat_oleh', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 11. agenda_jadwal
  await db.schema
    .createTable('agenda_jadwal')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('judul', 'varchar(255)', (col) => col.notNull())
    .addColumn('jenis_teks', 'text', (col) => col.notNull())
    .addColumn('tanggal_mulai', 'date', (col) => col.notNull())
    .addColumn('tanggal_selesai', 'date', (col) => col.notNull())
    .addColumn('meliburkan_sesi', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('cakupan_tipe', 'varchar(20)', (col) => col.notNull())
    .addCheckConstraint(
      'agenda_jadwal_cakupan_tipe_check',
      sql`cakupan_tipe IN ('PONDOK', 'HALAQAH', 'SESI')`
    )
    .addColumn('cakupan_detail', 'jsonb')
    .addColumn('keterangan', 'text')
    .addColumn('created_by', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 12. audit_logs
  await db.schema
    .createTable('audit_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('pelaku_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('aksi', 'varchar(100)', (col) => col.notNull())
    .addColumn('objek', 'varchar(100)', (col) => col.notNull())
    .addColumn('detail_perubahan', 'jsonb')
    .addColumn('waktu', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Indeks yang diminta
  await db.schema
    .createIndex('idx_users_peran_status')
    .on('users')
    .columns(['peran', 'status'])
    .execute();

  await db.schema
    .createIndex('idx_halaqah_penasmi_utama_id')
    .on('halaqah')
    .column('penasmi_utama_id')
    .execute();

  await db.schema
    .createIndex('idx_jadwal_sesi_rutin_halaqah_hari')
    .on('jadwal_sesi_rutin')
    .columns(['halaqah_id', 'hari'])
    .execute();

  await db.schema
    .createIndex('idx_penugasan_pengganti_user_status')
    .on('penugasan_pengganti')
    .columns(['pengganti_user_id', 'status_aktif'])
    .execute();

  await db.schema
    .createIndex('idx_penugasan_pengganti_halaqah_status')
    .on('penugasan_pengganti')
    .columns(['halaqah_id', 'status_aktif'])
    .execute();

  await db.schema
    .createIndex('idx_keanggotaan_halaqah_halaqah_id')
    .on('keanggotaan_halaqah')
    .column('halaqah_id')
    .execute();

  // Unique index parsial untuk keanggotaan aktif (tanggal_selesai IS NULL)
  await db.schema
    .createIndex('idx_keanggotaan_halaqah_santri_aktif')
    .on('keanggotaan_halaqah')
    .column('santri_id')
    .unique()
    .where(sql.ref('tanggal_selesai'), 'is', null)
    .execute();

  await db.schema
    .createIndex('idx_pertemuan_sesi_tanggal_halaqah')
    .on('pertemuan_sesi')
    .columns(['tanggal', 'halaqah_id'])
    .execute();

  await db.schema
    .createIndex('idx_absensi_santri_status')
    .on('absensi')
    .columns(['santri_id', 'status'])
    .execute();

  await db.schema
    .createIndex('idx_setoran_santri_created_at')
    .on('setoran')
    .columns(['santri_id', 'created_at'])
    .execute();

  await db.schema
    .createIndex('idx_setoran_pertemuan_id')
    .on('setoran')
    .column('pertemuan_id')
    .execute();

  await db.schema
    .createIndex('idx_agenda_jadwal_tanggal')
    .on('agenda_jadwal')
    .columns(['tanggal_mulai', 'tanggal_selesai'])
    .execute();

  await db.schema
    .createIndex('idx_audit_logs_waktu')
    .on('audit_logs')
    .column('waktu')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Hapus tabel anak sebelum induk
  await db.schema.dropTable('audit_logs').ifExists().execute();
  await db.schema.dropTable('agenda_jadwal').ifExists().execute();
  await db.schema.dropTable('setoran').ifExists().execute();
  await db.schema.dropTable('absensi').ifExists().execute();
  await db.schema.dropTable('pertemuan_sesi').ifExists().execute();
  await db.schema.dropTable('keanggotaan_halaqah').ifExists().execute();
  await db.schema.dropTable('penugasan_pengganti').ifExists().execute();
  await db.schema.dropTable('jadwal_sesi_rutin').ifExists().execute();
  await db.schema.dropTable('halaqah').ifExists().execute();

  // Lepas FK circular users -> kode_referral sebelum drop kode_referral
  await db.schema
    .alterTable('users')
    .dropConstraint('users_kode_referral_id_fk')
    .ifExists()
    .execute();

  await db.schema.dropTable('kode_referral').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();
  await db.schema.dropTable('pondok_settings').ifExists().execute();
}

