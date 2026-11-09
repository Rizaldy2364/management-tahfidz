# Desain Aplikasi Manajemen Tahfidz Pondok

Dokumen ini merangkum keputusan desain, palet warna, tipografi, komponen antarmuka, dan rincian seluruh layar yang telah dirancang.

**Versi 1.2** | **Tanggal:** 5 November 2026 | **Berpasangan dengan:** PRD Versi 1.3

---

## 1. Prinsip Desain

- **HP dulu (Mobile-First) untuk santri dan penasmi', Desktop dulu untuk pengelola.** Layar santri dan penasmi' dirancang pada ukuran artboard HP (390 px), lalu diperluas bila dibuka di layar besar. Layar pengelola (Admin dan Wakil Admin) dirancang untuk desktop (1440 px fleksibel).
- **Tenang dan nyaman dibaca lama.** Menggunakan palet Hijau Zamrud (`#0F6E56`) dengan latar halaman krem hangat (`#F7F5EF`) agar mata tidak cepat lelah saat memeriksa tabel rekap maupun teks Arab.
- **Cepat diisi oleh penasmi' (< 2 menit).** Seluruh santri otomatis berstatus Hadir saat sesi dibuka; penasmi' hanya mengubah santri yang berhalangan dan membuka kartu santri yang menyetorkan hafalan.
- **Pemisahan tegas antara layar Input (Penasmi') dan layar Pantau (Admin).** Penentuan status kehadiran, setor atau tidak, surat, ayat, dan nilai dilakukan oleh penasmi' di HP. Di layar desktop Admin/Wakil Admin, halaman Absensi dan Setoran tampil murni sebagai Mode Pantau (Read-Only).
- **Status selalu ditulis dengan teks, tidak hanya warna.** Memudahkan pengguna yang sulit membedakan warna serta tetap jelas saat dicetak hitam-putih.
- **Berbasis Pertemuan (Sesi) per Hari.** Satu halaqah dapat memiliki lebih dari satu sesi dalam sehari (misalnya Subuh, Pagi, Ba'da Ashar), sehingga layar penasmi', santri, dan pengelola selalu menampilkan konteks sesi.

## 2. Warna

### 2.1 Palet Utama (Palet A: Zamrud)

| Peran Warna | Hex | Pemakaian |
|---|---|---|
| Utama | `#0F6E56` | Tombol utama, header HP, tab aktif, garis fokus isian, tautan penting |
| Utama gelap | `#085041` | Panel samping (sidebar) admin, judul kartu penting, teks di atas latar hijau muda |
| Latar muda | `#E1F5EE` | Kotak info, sorotan kode referral & password sementara, tombol ikon panah expand, pita kalender ujian/kegiatan |
| Aksen emas | `#C9A24A` | Garis dekoratif tipis saja (tidak dipakai untuk teks) |
| Latar halaman | `#F7F5EF` | Latar seluruh halaman (krem hangat) |
| Latar bagian dalam (nested) | `#F4F2EA` | Latar panel rincian yang terbuka (expanded row) di dalam tabel atau kartu |
| Latar kartu | `#FFFFFF` | Kartu, tabel, modal, dan kolom isian |

### 2.2 Warna Teks dan Garis

| Fungsi | Hex |
|---|---|
| Teks utama | `#1F2A26` |
| Teks sekunder | `#5B6B65` |
| Garis isian (input border) | `#7F918A` |
| Garis kartu (card border) | `#E3E0D5` |
| Garis pemisah (divider) | `#D3D1C7` |

### 2.3 Status Kehadiran

| Status | Latar Ringan | Teks | Saat Dipilih (Latar Penuh, Teks Putih) |
|---|---|---|---|
| Hadir | `#EAF3DE` | `#27500A` | `#3B6D11` |
| Izin | `#E6F1FB` | `#0C447C` | `#185FA5` |
| Sakit | `#FAEEDA` | `#633806` | `#854F0B` |
| Alfa | `#FCEBEB` | `#791F1F` | `#A32D2D` |

### 2.4 Tingkat Nilai Dinamis

Warna mengikuti tingkat (1 sampai 4), bukan nama nilainya, sehingga tetap konsisten baik pondok memakai kata (Mumtaz), huruf (A), maupun rentang angka (90–100).

| Tingkat | Contoh Kata / Huruf / Angka | Latar | Teks | Garis |
|---|---|---|---|---|
| 1 (Tertinggi) | Mumtaz / A / 90–100 | `#FAEEDA` | `#633806` | `#BA7517` |
| 2 (Baik) | Jayyid / B / 75–89 | `#E1F5EE` | `#085041` | `#0F6E56` |
| 3 (Cukup) | Maqbul / C / 60–74 | `#F1EFE8` | `#444441` | `#888780` |
| 4 (Mengulang) | Rasib / D / di bawah 60 | `#FAECE7` | `#712B13` | `#D85A30` |

### 2.5 Warna Komponen Khusus Lainnya

- **Pita kalender & pengumuman libur / panel kuning perhatian:** Latar `#FAEEDA`, garis `#BA7517`, teks `#633806`.
- **Pita kalender & pengumuman ujian / kotak info hijau:** Latar `#E1F5EE`, garis `#0F6E56`, teks `#085041`.
- **Kartu peringatan dini (Perlu perhatian) & zona bahaya:** Latar `#FCEBEB` / `#FAECE7`, garis `#A32D2D` / `#D85A30`, teks `#791F1F` / `#712B13`.
- **Lencana angka notifikasi di topbar:** Latar `#A32D2D`, teks putih `#FFFFFF`.

## 3. Tipografi

| Penggunaan | Huruf | Catatan |
|---|---|---|
| Antarmuka aplikasi | Plus Jakarta Sans (400, 500, 600, 700) | Cadangan: sans-serif sistem |
| Teks Arab dekoratif (Bismillah) | Amiri (400, 700) | Cadangan: serif sistem |
| Teks Al-Qur'an (Fase 2) | Amiri Quran / Scheherazade New | Ukuran huruf dapat diperbesar pengguna |

### Ukuran Huruf Standar

| Elemen | Ukuran | Ketebalan |
|---|---|---|
| Judul halaman (Desktop / HP) | 28–30 px / 22–24 px | 700 (Bold) |
| Angka metrik kartu ringkasan | 26–30 px | 700 (Bold) |
| Judul kartu / panel drawer | 17–18 px | 700 (Bold) |
| Teks isi tabel & kolom isian | 14–15 px | 400–500 |
| Label di atas kolom isian | 14 px | 500 (Medium) |
| Keterangan kecil & chip status | 12–13 px | 400 / 700 untuk chip |
| Pita nama agenda di kotak kalender | 11 px (Desktop) / 9–10 px (HP) | 700 (Bold) |

## 4. Bentuk, Ukuran Sentuh, dan Jarak

- **Sudut melengkung (border-radius):** Kolom isian 10 px, tombol 10–12 px, kartu 14 px, sudut bawah header HP 20 px, chip status bulat penuh (9999 px).
- **Tinggi area sentuh (touch target):** Kolom isian 42–46 px, tombol utama 46–50 px, navigasi bawah HP 64 px.
- **Jarak (spacing):** Padding tepi layar HP 20 px, jarak antar kartu 12–14 px, lebar sidebar desktop 230–245 px.

## 5. Komponen Standar

| Komponen | Ketentuan Visual & Perilaku |
|---|---|
| Tombol utama | Latar `#0F6E56`, teks putih `#FFFFFF`, tebal 700, berubah ke `#085041` saat disentuh/diarahkan |
| Tombol sekunder | Garis 1,5 px `#0F6E56`, latar putih/transparan, teks `#085041`, tebal 700 |
| Kolom isian (input) | Label selalu di atas isian, garis `#7F918A`, latar putih. Kotak kode referral & password sementara disorot latar `#E1F5EE` dengan garis 1,5 px `#0F6E56` beserta tombol Salin |
| Baris & kartu yang bisa dibuka (expandable) | Tombol bulat berlatar `#E1F5EE` di sisi kanan dengan ikon panah: panah ke atas (▲) saat rincian terbuka, panah ke bawah (▼) saat menciut |
| Panel form mengambang (floating drawer) | Muncul di sisi kanan atas layar desktop (lebar 420–445 px), berbingkai 1,5 px `#0F6E56`, sudut 14 px, bayangan tegas, untuk tambah/ubah data tanpa meninggalkan halaman |
| Dropdown menu kontekstual ("Kelola") | Tombol sekunder Kelola di kanan baris tabel yang membuka menu mengambang berisi daftar tindakan spesifik baris tersebut |
| Batang progres (progress bar) | Tinggi 8 px, latar dasar `#E3E0D5`, isi hijau `#3B6D11` (kehadiran) atau `#0F6E56` (setoran/kuota), selalu disertai angka persen atau rasio di atasnya |
| Kalender bulanan interaktif | Grid 7 kolom (Senin–Ahad). Kotak tanggal hanya menampilkan angka tanggal Masehi, penanda kecil Hijriah, dan pita nama agenda singkat. Menekan kotak tanggal akan memperbarui panel rincian lengkap |
| Navigasi bawah (HP) | Tinggi 64 px, 5 tab bertulisan; tab aktif memiliki garis hijau 3 px (`#0F6E56`) di bagian atas dan teks tebal |
| Menu samping / Sidebar (Desktop) | Latar `#085041`, menu aktif berlatar `#0F6E56` dan tebal; menu Pengaturan pondok diberi keterangan kecil khusus admin |
| Topbar (Desktop) | Berisi kolom pencarian cepat, tanggal Hijriah & Masehi, segmen pilihan Terang / Gelap, tombol lonceng notifikasi dengan lencana merah `#A32D2D`, dan pil profil pengguna |

## 6. Daftar Layar yang Sudah Dirancang Lengkap

Seluruh layar untuk Rilis Pertama (MVP 1 Bulan) telah memiliki rancangan visual dan prototipe interaktif.

### 6.1 Layar Autentikasi & Pendaftaran (HP & Desktop)

- **Masuk (Login):** Satu halaman login untuk semua peran (Bismillah, logo, input akun & password, tombol masuk, serta tombol daftar santri dengan kode referral).
- **Daftar Santri Baru:** Input kode referral (disorot hijau muda), nama lengkap, kontak, password dua kali, dan kotak info bahwa akun baru akan berstatus "Menunggu penempatan halaqah".

### 6.2 Layar Pengelola: Admin & Wakil Admin (Desktop 1440 px)

- **Beranda Admin & Wakil Admin:** Empat kartu ringkasan (termasuk kartu kuning santri Menunggu penempatan dan kehadiran dari semua pertemuan), tabel keaktifan halaqah yang bisa dibuka untuk melihat keaktifan santri, serta ringkasan peringatan dini.
- **Manajemen Santri (`santri`):**
  - Empat kartu ringkasan (Santri aktif, Menunggu penempatan, Pendaftar bulan ini, Nonaktif).
  - Tab Menunggu penempatan: kotak centang massal, bar aksi hijau muda (Pilih halaqah tujuan, tombol Tempatkan X santri, tombol Tolak), serta pop-over penempatan per baris.
  - Tab Semua santri: pencarian, filter halaqah & status, batang progres kehadiran & setoran, serta tombol Kelola.
- **Kode Referral (`kode-referral`):**
  - Empat kartu ringkasan (Kode aktif, Pendaftar lewat kode, Sisa kuota, Kedaluwarsa dalam 7 hari).
  - Tabel daftar kode dengan batang pemakaian kuota, menu Kelola (Salin kode, Lihat pendaftar, Nonaktifkan), serta floating drawer Buat kode referral.
- **Manajemen Halaqah (`halaqah.html`):**
  - Empat kartu ringkasan (Halaqah aktif, Total pertemuan hari ini, Penasmi' pengganti hari ini, Rata-rata santri).
  - Tab Daftar halaqah: menampilkan chip jadwal sesi rutin per hari. Saat tombol panah diklik, bagian rincian hanya menampilkan kartu-kartu sesi pertemuan harian (tanpa daftar keaktifan santri agar ringkas dan fokus pada sesi).
  - Tab Penugasan pengganti sementara: tabel penugasan pengganti aktif beserta alasan dan tombol Akhiri.
  - Dilengkapi 2 floating drawer: Buat/Ubah Halaqah & Jadwal Sesi Rutin serta Tunjuk Pengganti Sementara.
- **Manajemen Penasmi' (`penasmi.html`):**
  - Empat kartu ringkasan termasuk kartu kuning Belum ganti password awal.
  - Tabel penasmi' dengan chip halaqah, batang kepatuhan mengisi sesi, total setoran yang dicatat, rincian kartu sesi harian saat baris dibuka, serta 3 floating drawer (Tambah Penasmi' dengan tombol Salin Password Sementara, Reset Password, dan Tunjuk Pengganti Sementara).
- **Absensi dan Setoran: Mode Pantau Admin (`absensi-setoran.html`):**
  - Dirancang 100% Read-Only (Hanya Pantau) bagi Admin & Wakil Admin; pengelola hanya melihat data hasil pengisian penasmi'.
  - Terdiri dari 3 tab: Rekap per Pertemuan (Sesi) (klik panah sesi untuk melihat tabel kehadiran, surat, ayat, nilai, dan catatan tiap santri), Riwayat Setoran Santri, dan Peringatan Dini.
- **Jadwal & Libur: Kalender Desktop (`jadwal.html`):**
  - Layout 2 kolom: Kalender Bulanan Interaktif (kiri) dan Panel Informasi Lengkap Tanggal Terpilih (kanan).
  - Kotak tanggal kalender hanya menampilkan angka tanggal dan pita nama agenda. Saat tanggal ditekan, panel kanan menampilkan jenis agenda (input teks bebas), rentang tanggal mulai sampai selesai, cakupan sesi/halaqah, dampak bebas alfa, serta pratinjau pengumuman beranda.
- **Pengaturan Pondok: Khusus Admin (`pengaturan-admin.html`):**
  - Terbagi ke dalam 4 tab: Profil, Satuan & Skala Nilai (mengatur satuan Halaman/Baris serta tabel 4 tingkat nilai Kata/Huruf/Angka dengan pratinjau chip langsung), Akun Wakil Admin (beserta drawer buat akun Wakil Admin), Audit Log Aktivitas, serta Cadangan Data & Zona Bahaya.

### 6.3 Layar Penasmi' & Santri (HP 390 px)

- **Beranda Santri (HP):** Salam, info halaqah, pengumuman libur/ujian, status sesi hari ini, setoran terakhir beserta chip nilainya, dan ringkasan kehadiran bulan ini.
- **Beranda Penasmi' (HP):** Daftar kartu pertemuan (sesi) hari ini dengan status Belum/Sudah diisi, tombol cepat Mulai absensi, dan pengumuman jadwal.
- **Input Absensi dan Setoran Penasmi' (HP):** Pemilih sesi (Sesi 1: Subuh, Sesi 2: Ashar) di header melengkung 20 px, daftar kartu santri expandable (default semua Hadir, pilih Setor/Tidak, pilih surat, ayat awal–akhir, jumlah, jenis Ziyadah/Murajaah, dan tingkat nilai), serta tombol Simpan absensi di bawah.
- **Halaqah Saya: HP Penasmi' (`halaqah-penasmi-hp.html`):**
  - Pemilih halaqah di header untuk beralih antara Halaqah Utama dan Halaqah Penugasan Pengganti Sementara (dilengkapi banner kuning informasi pengganti).
  - Ringkasan rekap halaqah, kartu sesi hari ini, kartu peringatan dini santri, daftar kartu santri expandable (menampilkan 3 riwayat setoran terakhir), serta modal bottom-sheet Grafik Progres 4 Pekan & Riwayat Penempatan Halaqah.
- **Jadwal & Libur: HP Penasmi' (`jadwal-penasmi-hp.html`):**
  - Kalender bulanan kompak untuk layar 390 px dengan pita nama agenda singkat di dalam kotak tanggal.
  - Menekan tanggal mana saja langsung menampilkan kartu rincian di bawah kalender yang menjelaskan jenis agenda, rentang tanggal, dan status tiap sesi halaqah penasmi' (Libur · Bebas alfa atau Aktif · Wajib absen).

## 7. Aksesibilitas & Ketentuan Antarmuka Peran

- **Indikator Hak Akses:** Menu Pengaturan pondok diberi label eksplisit khusus admin dan disembunyikan pada akun Wakil Admin.
- **Keterbacaan & Kontras:** Setiap lencana status kehadiran, tingkat nilai, dan pita kalender selalu memuat teks label yang jelas.
- **Kesiapan Pembaca Layar:** Tombol ikon (seperti lonceng notifikasi dan panah expand baris) dilengkapi atribut `aria-label` dan `aria-expanded`.

## 8. Layar yang Ditunda ke Tahap Berikutnya (Fase 2)

Selaras dengan pemisahan cakupan 1 bulan pada PRD Versi 1.3, layar berikut dijadwalkan untuk dirancang setelah rilis pertama berjalan:

- Modul Al-Qur'an Digital, Dzikir Pagi/Petang, dan Doa Harian (dengan pengaturan ukuran huruf Arab).
- Indikator Status Sinkronisasi Mode Offline & dialog penyelesaian konflik data.
- Tema Gelap (Dark Mode) menyeluruh untuk seluruh layar HP dan desktop.