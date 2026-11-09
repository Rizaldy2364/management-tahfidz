import type { Generated, JSONColumnType } from 'kysely';

export interface Database {
  pondok_settings: PondokSettings;
  users: Users;
  kode_referral: KodeReferral;
  halaqah: Halaqah;
  jadwal_sesi_rutin: JadwalSesiRutin;
  penugasan_pengganti: PenugasanPengganti;
  keanggotaan_halaqah: KeanggotaanHalaqah;
  pertemuan_sesi: PertemuanSesi;
  absensi: Absensi;
  setoran: Setoran;
  agenda_jadwal: AgendaJadwal;
  audit_logs: AuditLogs;
}

export interface PondokSettings {
  id: string; // UUIDv7
  nama_pondok: string;
  kontak: string | null;
  alamat: string | null;
  tahun_ajaran: string;
  semester: string;
  satuan_setoran: 'HALAMAN' | 'BARIS';
  batas_koreksi_hari: Generated<number>; // default 3
  batas_gagal_login: Generated<number>; // default 5
  durasi_kunci_menit: Generated<number>; // default 15
  skala_nilai_config: JSONColumnType<any>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Users {
  id: string; // UUIDv7
  nama: string;
  kontak: string | null;
  username: string;
  password_hash: string;
  peran: 'ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI';
  status: 'MENUNGGU' | 'AKTIF' | 'NONAKTIF';
  wajib_ganti_password: Generated<boolean>;
  failed_login_attempts: Generated<number>;
  locked_until: Date | null;
  kode_referral_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface KodeReferral {
  id: string; // UUIDv7
  kode: string;
  label: string;
  kuota: number;
  jumlah_terpakai: Generated<number>;
  kedaluwarsa: Date | null;
  is_active: Generated<boolean>;
  created_by: string; // UUIDv7 -> Users.id
  created_at: Generated<Date>;
}

export interface Halaqah {
  id: string;
  nama: string;
  penasmi_utama_id: string | null; // UUIDv7 -> Users.id
  status_aktif: Generated<boolean>;
  created_at: Generated<Date>;
}

export interface JadwalSesiRutin {
  id: string;
  halaqah_id: string;
  nama_sesi: string;
  hari: number; // 0 (Minggu) sampai 6 (Sabtu)
  jam_mulai: string; // tipe time, misal '05:00'
  jam_selesai: string;
  penasmi_sesi_id: string | null;
}

export interface PenugasanPengganti {
  id: string;
  halaqah_id: string;
  jadwal_sesi_id: string | null; // Null jika seharian penuh
  pengganti_user_id: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  alasan: string;
  status_aktif: Generated<boolean>;
  diakhiri_pada: Date | null;
  created_by: string;
  created_at: Generated<Date>;
}

export interface KeanggotaanHalaqah {
  id: string;
  santri_id: string;
  halaqah_id: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date | null;
}

export interface PertemuanSesi {
  id: string;
  halaqah_id: string;
  jadwal_sesi_id: string | null;
  tanggal: Date;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  is_libur: Generated<boolean>;
  penasmi_pengisi_id: string | null;
  status_pengisian: Generated<'BELUM' | 'SUDAH'>;
  created_at: Generated<Date>;
}

export interface Absensi {
  id: string;
  pertemuan_id: string;
  santri_id: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA';
  dicatat_oleh: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Setoran {
  id: string;
  pertemuan_id: string;
  santri_id: string;
  setor: Generated<boolean>;
  surat: string | null;
  ayat_awal: number | null;
  ayat_akhir: number | null;
  jumlah: number | null;
  satuan: 'HALAMAN' | 'BARIS' | null;
  jenis: 'ZIYADAH' | 'MURAJAAH' | null;
  tingkat_nilai: number | null; // 1-4
  label_nilai: string | null;
  catatan: string | null;
  dicatat_oleh: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface AgendaJadwal {
  id: string;
  judul: string;
  jenis_teks: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  meliburkan_sesi: Generated<boolean>;
  cakupan_tipe: 'PONDOK' | 'HALAQAH' | 'SESI';
  cakupan_detail: JSONColumnType<any> | null;
  keterangan: string | null;
  created_by: string;
  created_at: Generated<Date>;
}

export interface AuditLogs {
  id: string;
  pelaku_id: string | null;
  aksi: string;
  objek: string;
  detail_perubahan: JSONColumnType<any> | null;
  waktu: Generated<Date>;
}
