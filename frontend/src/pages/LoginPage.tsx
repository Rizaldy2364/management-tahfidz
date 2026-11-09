import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [pengenal, setPengenal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  // Cek apakah ada notifikasi pendaftaran berhasil dari navigate state
  const registrationSuccess = Boolean(
    location.state?.registered || location.state?.message
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowForgotInfo(false);

    if (!pengenal.trim() || !password) {
      setErrorMessage('Silakan isi email/nomor HP dan password Anda');
      return;
    }

    setLoading(true);
    try {
      await login(pengenal, password);
      // Login sukses, diarahkan ke dashboard
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kesalahan saat masuk. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-latar-halaman text-teks-utama font-sans">
      {/* Kolom Kiri: Branding & Informasi */}
      <div className="w-full lg:w-5/12 xl:w-1/2 bg-zamrud-utama text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 rounded-b-[24px] lg:rounded-none shrink-0 shadow-md lg:shadow-none">
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
            Aplikasi Manajemen Tahfidz
          </h1>
          <p className="text-zamrud-muda/90 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
            Catat kehadiran, setoran hafalan, dan pantau mutqin santri secara terpadu untuk satu pondok.
          </p>

          {/* 3 Poin Fitur (Desktop) */}
          <div className="hidden lg:flex flex-col gap-4 max-w-md pt-2">
            <div className="flex items-start gap-3">
              <span className="w-3.5 h-0.5 bg-aksen-emas mt-2.5 shrink-0 rounded-full" />
              <p className="text-sm text-zamrud-muda/95 leading-normal">
                Satu sesi, satu input — absensi sekaligus setoran
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-3.5 h-0.5 bg-aksen-emas mt-2.5 shrink-0 rounded-full" />
              <p className="text-sm text-zamrud-muda/95 leading-normal">
                Pantau target mutqin per santri secara berkala
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-3.5 h-0.5 bg-aksen-emas mt-2.5 shrink-0 rounded-full" />
              <p className="text-sm text-zamrud-muda/95 leading-normal">
                Dukungan mode luring saat koneksi pondok terputus
              </p>
            </div>
          </div>
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

      {/* Kolom Kanan: Form Masuk */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 grow">
        <div className="w-full max-w-[440px] bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-garis-kartu my-auto">
          {/* Banner Pendaftaran Berhasil */}
          {registrationSuccess && (
            <div
              role="status"
              className="bg-zamrud-muda border border-zamrud-utama/30 text-zamrud-gelap p-4 rounded-xl text-sm mb-6 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-zamrud-utama shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zamrud-utama mb-0.5">
                  Pendaftaran Berhasil!
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-zamrud-gelap">
                  Akun Anda sedang menunggu persetujuan/penempatan halaqah oleh admin pondok. Silakan masuk untuk memeriksa status.
                </p>
              </div>
            </div>
          )}

          {/* Heading Form */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-teks-utama tracking-tight">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs sm:text-sm text-teks-sekunder mt-1.5 leading-relaxed">
              Gunakan email atau nomor HP yang terdaftar untuk melanjutkan.
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
            {/* Input Email / HP */}
            <div>
              <label
                htmlFor="pengenal"
                className="block text-xs sm:text-sm font-semibold text-teks-utama mb-1.5"
              >
                Email atau nomor HP
              </label>
              <input
                id="pengenal"
                name="pengenal"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={pengenal}
                onChange={(e) => setPengenal(e.target.value)}
                placeholder="nama@email.com atau 08123456789"
                className="w-full px-3.5 py-2.5 text-sm sm:text-base border border-garis-isian/70 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-teks-utama placeholder:text-teks-sekunder/50 bg-white"
              />
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-teks-utama"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotInfo(!showForgotInfo)}
                  className="text-xs font-medium text-zamrud-utama hover:text-zamrud-gelap transition-colors"
                >
                  Lupa password?
                </button>
              </div>

              {/* Popover / Alert Info Lupa Password */}
              {showForgotInfo && (
                <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="grow">
                    Silakan hubungi Admin atau Ustadz pondok untuk reset password Anda.
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotInfo(false)}
                    className="text-amber-500 hover:text-amber-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full px-3.5 py-2.5 pr-11 text-sm sm:text-base border border-garis-isian/70 rounded-xl focus:outline-none focus:border-zamrud-utama focus:ring-2 focus:ring-zamrud-utama/20 transition duration-150 text-teks-utama placeholder:text-teks-sekunder/50 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-teks-sekunder/70 hover:text-teks-utama p-1 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Utama */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-zamrud-utama hover:bg-zamrud-gelap text-white font-semibold text-sm sm:text-base rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Memproses...' : 'Masuk ke Aplikasi'}
              </button>
            </div>
          </form>

          {/* Garis Pemisah & Tombol Daftar */}
          <div className="mt-6 pt-6 border-t border-garis-pemisah">
            <div className="relative flex justify-center text-xs mb-4">
              <span className="bg-white px-3 text-teks-sekunder font-medium">
                Belum punya akun?
              </span>
            </div>
            <Link
              to="/daftar"
              className="block w-full py-2.5 px-4 text-center border border-zamrud-utama text-zamrud-utama hover:bg-zamrud-muda/50 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-150"
            >
              Daftar Santri Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

