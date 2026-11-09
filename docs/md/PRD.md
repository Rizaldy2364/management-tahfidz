# PRD: Aplikasi Manajemen Tahfidz Pondok

**Versi 1.3** (Sinkronisasi Desain, Database, Teknologi & Cakupan 1 Bulan) | **Tanggal:** 5 November 2026 | **Disusun oleh:** Tim Pengembang | **Untuk:** Ustadz (Pemilik Produk)

---

## 1. Ringkasan

Aplikasi web (PWA) untuk satu pondok yang membantu pengelolaan halaqah tahfidz secara terpusat: data santri, manajemen penasmi', pengaturan halaqah dengan jadwal per pertemuan (sesi), absensi, pencatatan setoran hafalan, dan kalender jadwal kegiatan (ujian, kegiatan, dan libur). Aplikasi juga menyediakan Al-Qur'an digital, dzikir, dan doa harian dalam satu tempat.

## 2. Latar Belakang dan Masalah

- Pencatatan absensi dan setoran santri belum terpusat, sehingga Ustadz sulit memantau keaktifan, kepatuhan pengisian oleh penasmi', dan progres hafalan seluruh pondok.
- Jumlah santri tidak menentu dan bisa mencapai lebih dari 100, dengan ukuran halaqah serta jumlah sesi pertemuan harian yang bervariasi.
- Penasmi' bekerja dengan perangkat HP masing-masing dan membutuhkan antarmuka pengisian yang sangat cepat.
- Perubahan jadwal atau libur mendadak sulit disebarkan dan memengaruhi perhitungan rekap absensi (alfa).

## 3. Tujuan dan Indikator Keberhasilan

| Tujuan | Indikator Keberhasilan |
|---|---|
| Absensi dan setoran tercatat digital dengan cepat | Penasmi' dapat mengisi satu sesi halaqah kurang dari 2 menit melalui HP |
| Ustadz memantau seluruh pondok dari satu tempat | Tersedia dashboard keaktifan, mode pantau (read-only) absensi & setoran, serta kepatuhan penasmi' |
| Pendaftaran santri massal tidak memberatkan admin | 100+ santri dapat mendaftar dengan kode referral dan ditempatkan ke halaqah dengan aksi massal |
| Jadwal dan libur tersampaikan jelas | Kalender agenda dan pengumuman libur tampil langsung di layar santri dan penasmi' serta otomatis membebaskan sesi libur dari hitungan alfa |

## 4. Peran Pengguna

| Peran | Cara Akun Dibuat | Fungsi Utama |
|---|---|---|
| Admin (Ustadz) | Akun utama bawaan sistem | Akses penuh ke seluruh fitur, pemantauan pondok, manajemen akun Wakil Admin, serta halaman Pengaturan Pondok |
| Wakil Admin | Dibuat oleh Admin | Membantu operasional harian (santri, halaqah, penasmi', referral, jadwal, skala nilai, pantau rekap), tanpa akses ke halaman Pengaturan Pondok |
| Penasmi' | Didaftarkan oleh Admin / Wakil Admin, tinggal login dengan password sementara | Mengisi absensi dan setoran pada sesi halaqah yang ditugaskan (baik sebagai penasmi' utama maupun pengganti sementara) melalui tampilan HP |
| Santri | Mendaftar sendiri dengan kode referral | Melihat progres hafalan, kehadiran, jadwal sesi, serta konten Al-Qur'an, dzikir, dan doa |

## 5. Ruang Lingkup & Prioritas Cakupan (Target Pengerjaan 1 Bulan)

Mengingat cakupan desain yang lengkap sedangkan waktu pengerjaan awal adalah 1 bulan (4 minggu), fitur dipisahkan secara tegas menjadi **Wajib Rilis Pertama (MVP 1 Bulan)** dan **Ditunda ke Tahap Berikutnya**.

### 5.1 Wajib di Rilis Pertama (MVP, Target 1 Bulan)

1. **Autentikasi, Peran & Topbar Dasar:** Login satu pintu, wajib ganti password awal bagi akun yang dibuat pengelola, pembatasan gagal login, profil dasar, serta topbar dengan penanda tanggal Masehi & Hijriah.
2. **Kode Referral:** Pembuatan kode dengan kuota & kedaluwarsa, penolakan otomatis saat habis/kedaluwarsa, daftar pemakai kode.
3. **Manajemen Santri:** Tab Menunggu Penempatan (penempatan massal ke halaqah) dan tab Semua Santri (pencarian, filter, pindah halaqah dengan riwayat terjaga).
4. **Manajemen Halaqah & Sesi Harian:** Pengaturan halaqah, jadwal sesi rutin per hari (nama sesi, hari, jam mulai & selesai), serta alur Penugasan Pengganti Sementara (pilih pengganti dari penasmi' lain atau santri, alasan, dan tombol Akhiri penugasan).
5. **Manajemen Penasmi':** Daftar penasmi', pembuatan akun dengan password sementara yang mudah disalin, indikator kepatuhan mengisi absensi sesi, serta penanda/pengingat akun yang belum mengganti password awal.
6. **Absensi & Setoran (Layar HP Penasmi' & Mode Pantau Admin):**
   - **Penasmi' (HP):** Pemilih sesi harian, default hadir semua santri, input setoran (surat, ayat, jumlah halaman/baris, ziyadah/murajaah, tingkat nilai, catatan), serta batas koreksi maksimal 3 hari ke belakang.
   - **Admin & Wakil Admin (Desktop):** Halaman Absensi dan Setoran Mode Pantau (Read-Only) yang terdiri dari 3 tab: Rekap per Pertemuan (Sesi), Riwayat Setoran, dan Peringatan Dini.
7. **Kalender Jadwal & Libur:** Tampilan kalender bulanan dengan pita nama agenda di kotak tanggal, klik tanggal untuk rincian lengkap, jenis agenda berupa teks bebas, penanda apakah agenda meliburkan sesi pertemuan, serta cakupan libur (seluruh pondok, halaqah tertentu, atau sesi tertentu).
8. **Beranda & Pengaturan Pondok:** Beranda ringkasan semua peran, serta halaman Pengaturan Pondok (Khusus Admin) untuk identitas pondok, tahun ajaran, satuan setoran (halaman/baris), skala nilai dinamis (Kata/Huruf/Angka), dan kelola akun Wakil Admin.

### 5.2 Ditunda Setelah Rilis Pertama (Fase 2 / Pasca-Peluncuran)

- **Mode Offline & Sinkronisasi Lokal (FR-37 & FR-38):** Penyimpanan lokal di perangkat saat tanpa internet dan resolusi konflik sinkronisasi (ditunda karena sinyal pondok saat ini stabil).
- **Modul Al-Qur'an Digital, Dzikir Pagi/Petang, dan Doa Harian (FR-34 s/d FR-36):** Dialihkan ke fase berikutnya agar fokus bulan pertama tuntas pada inti operasional pencatatan tahfidz.
- **Fitur Pendukung Topbar & Data Lanjutan:** Pencarian global lintas entitas di topbar, pusat notifikasi real-time, tema gelap (dark mode) fungsional penuh, impor/ekspor massal Excel/CSV, serta unduh cadangan database langsung dari antarmuka.
- **Usulan Jangka Panjang:** Akun wali santri, audio murottal & rekaman setoran, notifikasi pengingat murajaah, rapor hafalan cetak PDF.

## 6. Kebutuhan Fungsional

### 6.1 Autentikasi, Akun, dan Navigasi Umum

- **FR-01:** Admin membuat akun Wakil Admin, dan Admin/Wakil Admin membuat akun Penasmi'. Sistem menghasilkan password sementara (dapat langsung disalin dari antarmuka), dan pengguna wajib mengganti password pada login pertama.
- **FR-02:** Santri mendaftar sendiri dengan memasukkan kode referral, mengisi data diri, dan membuat password.
- **FR-03:** Setelah mendaftar, santri berstatus "Menunggu penempatan" dan hanya dapat mengakses halaman sambutan menunggu penempatan.
- **FR-04:** Admin atau Wakil Admin dapat mereset password santri dan penasmi' (menghasilkan password sementara baru).
- **FR-05:** Admin dapat menonaktifkan akun kapan saja, dan akun nonaktif otomatis ditolak saat login.
- **FR-06:** Sistem membatasi percobaan login gagal berturut-turut (batas dapat diatur di Pengaturan Pondok, bawaan 5 kali gagal kunci 15 menit).
- **FR-06a (Topbar Desktop):** Menampilkan kolom pencarian cepat, tanggal Hijriah dan Masehi hari ini, sakelar tampilan Terang/Gelap, ikon notifikasi dengan lencana jumlah, serta profil pengguna aktif.

### 6.2 Kode Referral

- **FR-07:** Admin atau Wakil Admin membuat kode referral dengan label, kode (otomatis atau ketik manual), batas kuota pemakaian, dan tanggal kedaluwarsa.
- **FR-08:** Satu kode dapat dipakai banyak santri sampai kuota habis atau melewati tanggal kedaluwarsa. Setelah itu kode otomatis ditolak.
- **FR-09:** Kode dapat dinonaktifkan kapan saja.
- **FR-10:** Halaman Kode Referral menampilkan ringkasan kode aktif, pendaftar lewat kode, sisa kuota, kode yang akan kedaluwarsa dalam 7 hari, serta aksi salin kode dan lihat daftar santri pemakai kode.

### 6.3 Manajemen Santri

- **FR-11:** Tab "Menunggu penempatan" menampilkan santri baru. Admin atau Wakil Admin dapat mencentang banyak santri sekaligus lalu menempatkannya ke satu halaqah tujuan atau menolak pendaftar.
- **FR-12:** Tab "Semua santri" menyediakan pencarian nama, filter halaqah, filter status (aktif, menunggu, nonaktif), serta pengurutan data.
- **FR-13:** Profil/kartu santri menampilkan data diri, halaqah saat ini, riwayat perpindahan halaqah, persentase kehadiran, dan progres setoran hafalan.
- **FR-14:** Tersedia aksi pindah halaqah (riwayat halaqah lama tetap tersimpan), nonaktifkan santri, dan reset password.
- **FR-15 & FR-16 (Ditunda setelah rilis pertama):** Ekspor daftar santri ke Excel dan impor santri massal dari Excel/CSV.

### 6.4 Manajemen Halaqah & Penugasan Pengganti Sementara

- **FR-17:** Admin atau Wakil Admin membuat, mengubah, dan menutup halaqah, serta menugaskan penasmi' utama.
- **FR-18:** Satu halaqah memiliki satu penasmi' utama, banyak santri, dan dapat memiliki lebih dari satu pertemuan (sesi) dalam sehari. Admin atau Wakil Admin mengatur jadwal sesi rutin tiap halaqah: nama sesi (misalnya Subuh, Pagi, Ba'da Ashar), hari aktif, jam mulai, dan jam selesai.
- **FR-18a (Alur Penugasan Pengganti Sementara):**
  - Bila penasmi' berhalangan, Admin atau Wakil Admin dapat menunjuk pengganti sementara dari penasmi' lain atau santri senior untuk tanggal/rentang tanggal dan sesi tertentu (atau seluruh sesi hari itu).
  - Penugasan mencatat alasan penggantian (misalnya: sakit, izin keluar kota, tugas pondok).
  - Tersedia tab/daftar khusus penugasan pengganti yang sedang berjalan beserta tombol "Akhiri" untuk menghentikan penugasan pengganti lebih cepat jika penasmi' utama sudah kembali aktif.
  - Selama masa penugasan, halaqah tersebut muncul di layar HP pengganti dengan penanda khusus "Penugasan Pengganti Sementara", dan nama pengisi absensi/setoran tercatat di database.

### 6.5 Manajemen Penasmi'

- **FR-18b:** Halaman khusus Penasmi' di desktop pengelola menampilkan:
  - Ringkasan jumlah penasmi' aktif, penasmi' bertugas hari ini, rata-rata kepatuhan mengisi absensi sesi, serta kartu peringatan jumlah akun penasmi' yang belum mengganti password sementara.
  - Tabel daftar penasmi' beserta halaqah yang dipegang, batang progres kepatuhan pengisian sesi, total setoran yang dicatat, status akun, serta rincian sesi harian saat baris dibuka.

### 6.6 Absensi dan Setoran Hafalan

- **FR-19 (Input Penasmi' per Sesi):** Penasmi' membuka halaqahnya pada tanggal dan sesi tertentu melalui HP. Absensi dan setoran dicatat melekat pada pertemuan (sesi), bukan per hari. Seluruh santri otomatis berstatus "Hadir", dan penasmi' hanya mengubah santri yang berbeda.
- **FR-20:** Status kehadiran terdiri dari: Hadir, Izin, Sakit, Alfa.
- **FR-21:** Pada tanggal atau sesi yang ditetapkan sebagai Libur, absensi tidak diwajibkan dan otomatis tidak dihitung sebagai alfa.
- **FR-22 (Batas Koreksi 3 Hari):** Penasmi' hanya dapat mengisi dan mengoreksi data absensi/setoran pada halaqah yang ditugaskan kepadanya maksimal sampai 3 hari ke belakang. Koreksi data yang lebih lampau dari 3 hari terkunci bagi penasmi'.
- **FR-23:** Hanya santri yang hadir yang dapat dicatat status setorannya (Setor atau Tidak setor). Tugas menentukan santri hadir/tidak, setor/tidak, surat, ayat, dan nilai sepenuhnya dilakukan oleh Penasmi'.
- **FR-24:** Bila santri setor, penasmi' mencatat: surat, ayat awal dan akhir, jumlah (halaman atau baris), jenis setoran (Ziyadah atau Murajaah), tingkat nilai, dan catatan.
- **FR-25 (Mode Pantau Admin, Read-Only):** Pada tampilan desktop Admin dan Wakil Admin, halaman Absensi dan Setoran berfungsi murni sebagai layar pemantauan (hanya baca) tanpa tombol ubah status santri, yang terbagi ke dalam 3 tab:
  - **Rekap per Pertemuan (Sesi):** Daftar sesi harian semua halaqah yang dapat dibuka (expandable) untuk melihat tabel kehadiran dan setoran santri yang telah diisi penasmi'.
  - **Riwayat Setoran:** Tabel pencarian dan penyaringan seluruh riwayat setoran santri lintas halaqah.
  - **Peringatan Dini:** Daftar santri yang memerlukan perhatian khusus karena sering alfa atau lama tidak menyetorkan hafalan.

### 6.7 Kalender Jadwal dan Libur

- **FR-27:** Admin dan Wakil Admin mengelola agenda pondok melalui tampilan Kalender Bulanan Interaktif.
- **FR-28:** Kotak tanggal pada kalender dirancang bersih dan hanya menampilkan angka tanggal serta pita nama agenda singkat (dibedakan warnanya antara agenda yang meliburkan sesi dan agenda kegiatan/ujian aktif).
- **FR-28a:** Saat kotak tanggal di kalender ditekan (baik di desktop pengelola maupun di layar HP penasmi'), muncul panel/kartu informasi lengkap yang memuat:
  - Judul agenda dan jenis agenda (berupa input teks bebas, misalnya Libur Hari Raya, Ujian Bulanan, Tasmi' Akbar, Kerja Bakti).
  - Tanggal mulai sampai tanggal selesai beserta durasi hari.
  - Status apakah agenda tersebut meliburkan sesi pertemuan (bebas alfa) atau tetap mewajibkan absensi.
  - Cakupan berlaku: seluruh pondok, halaqah tertentu, atau sesi tertentu saja (misalnya hanya Sesi Subuh).
- **FR-29:** Pengumuman libur dan agenda terdekat tampil langsung di beranda santri dan penasmi'.

### 6.8 Dashboard dan Rekap

- **FR-30:** Beranda Admin menampilkan ringkasan santri aktif, santri menunggu penempatan, jumlah halaqah, persentase kehadiran dari semua pertemuan, serta daftar keaktifan halaqah yang dapat dibuka untuk melihat keaktifan santri di dalamnya.
- **FR-31:** Peringatan dini otomatis menyoroti santri yang melewati ambang batas ketidakaktifan (lihat Bagian 11).
- **FR-32 & FR-33:** Penasmi' hanya melihat rekap, daftar santri, dan grafik progres pada halaqah yang ditugaskan kepadanya (termasuk halaqah pengganti selama masa penugasan aktif).

### 6.9 Pengaturan Pondok (Khusus Admin)

- **FR-39:** Halaman Pengaturan Pondok hanya dapat diakses oleh Admin utama dan terbagi menjadi beberapa bagian:
  - **Profil & Aturan Operasional Pondok:** Nama resmi pondok, kontak, alamat, tahun ajaran & semester aktif, aturan batas hari koreksi penasmi' (bawaan 3 hari), dan batas gagal login.
  - **Satuan Setoran & Skala Nilai Dinamis:** Pilihan satuan setoran (Halaman atau Baris). Pengaturan jenis nilai (Kata seperti Mumtaz/Jayyid/Maqbul/Rasib, Huruf A–D, atau Angka 0–100) beserta label tingkat, rentang nilai, dan keterangan kelulusan. *(Catatan: Skala nilai ini juga dapat disesuaikan oleh Wakil Admin melalui menu jadwal/penilaian.)*
  - **Kelola Akun Wakil Admin:** Membuat akun Wakil Admin baru dengan password sementara, mereset password, atau menonaktifkan Wakil Admin.
  - **Audit Log, Cadangan Data & Zona Bahaya:** Tabel log aktivitas penting (terutama tindakan Wakil Admin), tombol unduh cadangan database, serta tombol tutup tahun ajaran.

### 6.10 Konten Keislaman & Mode Offline (Ditunda ke Fase 2)

- **FR-34 s/d FR-36 (Ditunda):** Al-Qur'an digital teks Utsmani, dzikir pagi & petang, dan doa harian.
- **FR-37 & FR-38 (Ditunda):** Penyimpanan absensi/setoran secara offline di perangkat dan sinkronisasi otomatis saat kembali online.

## 7. Matriks Hak Akses

| Fitur | Admin (Ustadz) | Wakil Admin | Penasmi' | Santri |
|---|---|---|---|---|
| Halaman Pengaturan Pondok (profil, aturan sistem, kelola Wakil Admin, cadangan & hapus data) | Ya | Tidak | Tidak | Tidak |
| Atur Skala Nilai (Kata / Huruf / Angka & rentangnya) | Ya | Ya | Tidak | Tidak |
| Kelola Penasmi' (buat akun, reset password, pantau kepatuhan) | Ya | Ya | Tidak | Tidak |
| Kelola Halaqah, Sesi Harian & Pengganti Sementara | Ya | Ya | Tidak | Tidak |
| Kelola Santri & Penempatan Massal | Ya | Ya | Tidak | Tidak |
| Buat & Kelola Kode Referral | Ya | Ya | Tidak | Tidak |
| Kelola Kalender Jadwal & Libur | Ya | Ya | Lihat kalender (HP) | Lihat jadwal (HP) |
| Dashboard Pondok & Mode Pantau Absensi/Setoran (Read-Only: Rekap, Riwayat, Peringatan Dini) | Ya | Ya | Halaqah sendiri | Tidak |
| Input & Koreksi Absensi serta Setoran Santri (batas 3 hari ke belakang) | Hanya pantau | Hanya pantau | Ya (Halaqah penugasan) | Tidak |
| Lihat Progres & Kehadiran Sendiri | - | - | - | Ya |

## 8. Kebutuhan Non-Fungsional

- **Perangkat & Antarmuka:** Responsif dengan pendekatan HP-first (390px) untuk Penasmi' dan Santri, serta Desktop-first (1440px) untuk Admin dan Wakil Admin. Dapat dipasang ke layar utama sebagai PWA.
- **Standar ID Database:** Seluruh tabel menggunakan UUID versi 7 (UUIDv7) sebagai Primary Key agar pengurutan berdasarkan waktu pembuatan (time-ordered) optimal dan aman.
- **Kinerja:** Daftar santri besar (100+ santri) dan riwayat pertemuan tetap cepat dengan indeks database, pencarian, filter, dan paginasi.
- **Keamanan & Audit:** Password di-hash (Argon2/bcrypt), pembatasan percobaan login, koneksi HTTPS, dan pencatatan Audit Log untuk setiap perubahan data penting oleh Admin maupun Wakil Admin.

## 9. Model Data (Garis Besar dengan UUIDv7)

Seluruh entitas utama menggunakan `id` bertipe UUIDv7:

- **pondok_settings:** id (uuidv7), nama_pondok, tahun_ajaran, satuan_setoran (HALAMAN/BARIS), batas_koreksi_hari (default: 3), skala_nilai_config (JSON).
- **users:** id (uuidv7), nama, kontak, username, password_hash, peran, status (MENUNGGU/AKTIF/NONAKTIF), wajib_ganti_password (boolean), failed_login_attempts.
- **kode_referral:** id (uuidv7), kode, label, kuota, jumlah_terpakai, kedaluwarsa, is_active, created_by.
- **halaqah:** id (uuidv7), nama, penasmi_utama_id, status_aktif.
- **jadwal_sesi_rutin:** id (uuidv7), halaqah_id, nama_sesi, hari (0-6), jam_mulai, jam_selesai, penasmi_sesi_id (opsional, default ikut halaqah).
- **penugasan_pengganti:** id (uuidv7), halaqah_id, jadwal_sesi_id (nullable bila seharian), pengganti_user_id (penasmi/santri), tanggal_mulai, tanggal_selesai, alasan, status_aktif, diakhiri_pada.
- **keanggotaan_halaqah:** id (uuidv7), santri_id, halaqah_id, tanggal_mulai, tanggal_selesai (nullable).
- **pertemuan_sesi:** id (uuidv7), halaqah_id, jadwal_sesi_id, tanggal, nama_sesi, jam_mulai, jam_selesai, is_libur, penasmi_pengisi_id, status_pengisian.
- **absensi:** id (uuidv7), pertemuan_id, santri_id, status (HADIR/IZIN/SAKIT/ALFA), dicatat_oleh, updated_at.
- **setoran:** id (uuidv7), pertemuan_id, santri_id, setor (boolean), surat, ayat_awal, ayat_akhir, jumlah, satuan, jenis (ZIYADAH/MURAJAAH), tingkat_nilai (1-4), label_nilai, catatan, dicatat_oleh.
- **agenda_jadwal:** id (uuidv7), judul, jenis_teks (varchar bebas), tanggal_mulai, tanggal_selesai, meliburkan_sesi (boolean), cakupan_tipe (PONDOK/HALAQAH/SESI), cakupan_detail (JSON), keterangan.
- **audit_logs:** id (uuidv7), pelaku_id, aksi, objek, detail_perubahan (JSON), waktu.

## 10. Teknologi yang Digunakan

Arsitektur aplikasi menggunakan pemisahan Frontend dan Backend yang ringan, cepat, dan type-safe:

- **Antarmuka (Frontend):** React dengan Vite (PWA-ready, sangat ringan untuk perangkat HP penasmi' maupun desktop admin).
- **Server API (Backend):** Fastify (Node.js/TypeScript) yang memiliki performa tinggi dan overhead rendah.
- **Database & Query Builder:** PostgreSQL dengan Kysely (type-safe SQL query builder) untuk kontrol penuh atas kueri rekap kehadiran, agregasi sesi, dan performa indeks UUIDv7.
- **Infrastruktur:** VPS dengan Reverse Proxy HTTPS dan pencadangan database terjadwal otomatis.

## 11. Keputusan Sistem & Aturan Database yang Disepakati

### 11.1 Keputusan Fungsional

- **Batas Koreksi Data Lampau (3 Hari):** Penasmi' hanya dapat mengisi atau mengoreksi absensi dan setoran maksimal 3 hari ke belakang.
- **Pemisahan Tugas Admin vs Penasmi' pada Absensi & Setoran:** Penasmi' yang bertugas menentukan kehadiran, status setor, surat, ayat, dan nilai santri. Admin dan Wakil Admin memantau hasilnya dalam mode hanya baca (Read-Only).
- **Skala Nilai Dinamis:** Bawaan menggunakan Mumtaz, Jayyid, Maqbul, Rasib (4 tingkat) dan dapat diubah ke angka atau huruf oleh Admin maupun Wakil Admin.
- **Pengganti Sementara Fleksibel:** Dapat menunjuk penasmi' lain atau santri senior dengan alasan yang tercatat serta tombol Akhiri sewaktu-waktu.

### 11.2 Ketentuan Database yang Telah Disepakati

- **Penasmi' per Sesi Rutin:** Penasmi' tiap sesi otomatis mengikuti Penasmi' Utama Halaqah kecuali sedang ada Penugasan Pengganti Sementara. Kolom `penasmi_sesi_id` tetap disiapkan nullable di tabel `jadwal_sesi_rutin` bila kelak dibutuhkan.
- **Ambang Batas Status "Perlu Perhatian" (Peringatan Dini):** Santri otomatis ditandai Perlu Perhatian apabila memenuhi salah satu dari:
  - Kehadiran di bawah 75% dalam 30 hari terakhir,
  - Alfa 3 sesi berturut-turut, atau
  - Belum setor hafalan selama ≥ 7 hari aktif berturut-turut.
- **Kewajiban Hadir Santri di Semua Sesi Halaqah:** Seluruh santri aktif di suatu halaqah wajib mengikuti semua sesi rutin halaqah tersebut (kecuali santri tersebut dicatat Izin/Sakit pada sesi terkait, atau sesi sedang diliburkan).

## 12. Jadwal Pengerjaan Rilis Pertama (4 Minggu)

- **Minggu 1: Fondasi, Autentikasi, Referral & Manajemen Santri.** Setup proyek (React + Vite, Fastify, PostgreSQL + Kysely dengan UUIDv7), login & wajib ganti password awal, kode referral, serta manajemen santri & penempatan massal.
- **Minggu 2: Manajemen Halaqah, Sesi Harian, Penasmi' & Pengganti Sementara.** CRUD halaqah dan jadwal sesi rutin, manajemen akun penasmi', kepatuhan pengisian, serta alur penugasan pengganti sementara.
- **Minggu 3: Inti Absensi & Setoran (Layar HP Penasmi' & Mode Pantau Admin).** Antarmuka pengisian cepat < 2 menit untuk penasmi', validasi batas koreksi 3 hari, serta halaman pantau Admin (Rekap Sesi, Riwayat Setoran, Peringatan Dini).
- **Minggu 4: Kalender Jadwal/Libur, Beranda, Pengaturan Pondok & Uji Coba.** Kalender bulanan interaktif (pita agenda & detail klik tanggal), beranda semua peran, halaman Pengaturan Pondok, serta uji coba langsung bersama penasmi' sebelum peluncuran.