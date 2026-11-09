# Aplikasi Manajemen Tahfidz Pondok

Sistem terpadu manajemen kehadiran, setoran hafalan, dan pemantauan mutqin santri untuk satu pondok pesantren.

---

## Menjalankan

### Prasyarat
- **Node.js** (v20+ disarankan)
- **pnpm** (package manager utama)
- **PostgreSQL** sudah berjalan dan database telah dibuat
- File konfigurasi `backend/.env` sudah terisi dengan kredensial database dan rahasia JWT

### Pemasangan Awal
Untuk memasang seluruh dependensi pada folder utama, backend, dan frontend:
```bash
pnpm run install:all
```

### Menjalankan Semuanya Sekaligus
Cukup jalankan satu perintah dari folder utama proyek:
```bash
pnpm run dev
```
Perintah ini akan menjalankan kedua server secara bersamaan menggunakan `concurrently`:
- **Backend API**: berjalan di [http://localhost:3000](http://localhost:3000) (prefix log `[backend]`)
- **Frontend Web**: berjalan di [http://localhost:5173](http://localhost:5173) (prefix log `[frontend]`)

### Menjalankan Satu per Satu (Opsional)
Jika ingin menjalankan backend atau frontend secara terpisah:
- **Backend saja**:
  ```bash
  pnpm run dev:backend
  ```
- **Frontend saja**:
  ```bash
  pnpm run dev:frontend
  ```

### Memeriksa Tipe (Typecheck)
Untuk menjalankan validasi TypeScript pada backend dan frontend:
```bash
pnpm run typecheck
```

### Menghentikan
Tekan `Ctrl + C` di terminal untuk menghentikan kedua proses sekaligus.

