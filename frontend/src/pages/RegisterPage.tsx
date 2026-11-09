import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi sisi klien
    const trimmedKode = kode.trim();
    const trimmedNama = nama.trim();
    const trimmedKontak = kontak.trim();

    if (!trimmedKode) {
      setErrorMessage('Kode referral pondok wajib diisi');
      return;
    }

    if (!trimmedNama) {
      setErrorMessage('Nama lengkap santri wajib diisi');
      return;
    }

    if (!trimmedKontak) {
      setErrorMessage('Email atau nomor HP aktif wajib diisi');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password minimal 8 karakter');
      return;
    }

    if (password !== konfirmasiPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          kode: trimmedKode,
          nama: trimmedNama,
          kontak: trimmedKontak,
          password,
          konfirmasi_password: konfirmasiPassword,
        }),
      });

      // Sukses: arahkan ke halaman masuk dengan pesan sukses
      navigate('/masuk', {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-latar-halaman text-teks-utama font-sans">
      {/* Kolom Kiri: Branding & Informasi Pendaftaran */}
      <div className="w-full lg:w-5/12 xl:w-5/12 bg-zamrud-utama text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 rounded-b-[24px] lg:rounded-none shrink-0 shadow-md lg:shadow-none">
        {/* Atas: Nama Pondok */}
        <div>
          <div className="flex items-center gap-2.5 text-zamrud-muda mb-8 lg:mb-12">
            <BookOpen className="w-6 h-6 text-aksen-emas" />
            <span className="font-semibold tracking-wide text-sm lg:text-base text-white">
              [Nama Pondok]
            </span>
          </div>

          {/* Lafaz Basmalah & Garis Aksen Emas */}
          <div className="mb-6 lg:mb-8">
            <p className="font-arab text-2xl lg:text-3xl tracking-wide text-white mb-3">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="h-0.5 w-12 bg-aksen-emas rounded-full" />
          </div>

          {/* Judul & Subjudul */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-white leading-tight">
            Pendaftaran Santri Baru
          </h1>
          <p className="text-zamrud-muda/90 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
            Bergabunglah dalam program tahfidz pondok kami. Menghafal Al-Qur'an dengan bimbingan ustadz dan kurikulum mutqin terarah.
          </p>
        </div>

        {/* Bawah: Kutipan Hadits */}
        <div className="mt-8 lg:mt-12 pt-6 border-t border-white/15">
          <blockquote className="italic text-xs sm:text-sm text-zamrud-muda/90 leading-relaxed font-normal">
            &ldquo;Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.&rdquo;
          </blockquote>
          <p className="text-xs text-aksen-emas font-medium mt-1">
            (HR. Bukhari no. 5027)
          </p>
        </div>
      </div>

      {/* Kolom Kanan: Form Pendaftaran */}
      <div className="w-full lg:w-7/12 xl:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 grow">
        <div className="w-full max-w-[500px] bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-garis-kartu my-auto">
          {/* Heading Form */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-teks-utama tracking-tight">
              Daftar Santri Baru
            </h2>
            <p className="text-xs sm:text-sm text-teks-sekunder mt-1.5 leading-relaxed">
              Pendaftaran santri memerlukan kode referral dari pengurus atau ustadz pondok.
            </p>
          </div>

          {/* Alert Error */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm mb-5 flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="grow">
                <p className="text-xs sm:text-sm font-medium leading-normal">
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-700 p-0.5"
                aria-label="Tutup pesan error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Kode Referral (Highlight khusus) */}
            <div>
              <label
                htmlFor="kode"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zamrud-gelap mb-1.5"
              >
                <Sparkles className="w-4 h-4 text-aksen-emas" />
                <span>Kode Referral Pondok</span>
              </label>
              <input
                id="kode"
                name="kode"
                type="text"
                required
                autoCapitalize="characters"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="Contoh: TAHFIDZ2026"
                className="w-full px-3.5 py-2.5 text-sm sm:text-base font-semibold tracking-wider uppercase bg-zamrud-muda/50 border-2 border-zamrud-utama/40 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-zamrud-gelap placeholder:text-teks-sekunder/50 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
              />
            </div>

            {/* Input Nama Lengkap */}
            <div>
              <label
                htmlFor="nama"
                className="block text-xs sm:text-sm font-semibold text-teks-utama mb-1.5"
              >
                Nama Lengkap Santri
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama sesuai identitas"
                className="w-full px-3.5 py-2.5 text-sm sm:text-base border border-garis-isian/70 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-teks-utama placeholder:text-teks-sekunder/50 bg-white"
              />
            </div>

            {/* Input Email atau Nomor HP */}
            <div>
              <label
                htmlFor="kontak"
                className="block text-xs sm:text-sm font-semibold text-teks-utama mb-1.5"
              >
                Email atau Nomor HP Aktif
              </label>
              <input
                id="kontak"
                name="kontak"
                type="text"
                autoComplete="email tel"
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="Untuk menerima info dan masuk akun"
                className="w-full px-3.5 py-2.5 text-sm sm:text-base border border-garis-isian/70 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-teks-utama placeholder:text-teks-sekunder/50 bg-white"
              />
            </div>

            {/* Baris Password & Ulangi Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs sm:text-sm font-semibold text-teks-utama mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 karakter"
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-garis-isian/70 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-teks-utama placeholder:text-teks-sekunder/50 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teks-sekunder/70 hover:text-teks-utama p-1 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ulangi Password */}
              <div>
                <label
                  htmlFor="reg-konfirmasi"
                  className="block text-xs sm:text-sm font-semibold text-teks-utama mb-1.5"
                >
                  Ulangi Password
                </label>
                <div className="relative">
                  <input
                    id="reg-konfirmasi"
                    name="konfirmasi_password"
                    type={showKonfirmasi ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-garis-isian/70 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-teks-utama placeholder:text-teks-sekunder/50 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                    aria-label={showKonfirmasi ? 'Sembunyikan password' : 'Lihat password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teks-sekunder/70 hover:text-teks-utama p-1 transition-colors"
                  >
                    {showKonfirmasi ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Kotak Info Menunggu Status */}
            <div className="p-3.5 bg-zamrud-muda border border-zamrud-utama/30 text-zamrud-gelap rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
              <Info className="w-4 h-4 text-zamrud-utama shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Setelah mendaftar, akun Anda akan berstatus <strong>MENUNGGU</strong> sampai admin pondok menempatkan Anda ke dalam halaqah dan sesi tahfidz.
              </p>
            </div>

            {/* Tombol Utama */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-zamrud-utama hover:bg-zamrud-gelap text-white font-semibold text-sm sm:text-base rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>

          {/* Tautan ke Halaman Masuk */}
          <div className="mt-6 pt-5 border-t border-garis-pemisah text-center">
            <p className="text-xs sm:text-sm text-teks-sekunder">
              Sudah punya akun?{' '}
              <Link
                to="/masuk"
                className="font-semibold text-zamrud-utama hover:text-zamrud-gelap underline underline-offset-2 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

