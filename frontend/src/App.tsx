import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {
  BookOpen,
  LogOut,
  User,
  ShieldAlert,
  ShieldCheck,
  Clock,
  KeyRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

// Indikator Loading awal tanpa flicker kasar
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-latar-halaman text-teks-utama">
      <div className="flex items-center gap-3 mb-4 animate-pulse">
        <BookOpen className="w-8 h-8 text-zamrud-utama" />
        <span className="text-xl font-bold text-zamrud-utama tracking-wide">
          Aplikasi Manajemen Tahfidz
        </span>
      </div>
      <p className="text-xs sm:text-sm text-teks-sekunder">
        Memeriksa sesi login...
      </p>
    </div>
  );
}

// Guard untuk rute yang hanya boleh diakses bila BELUM login (/masuk, /daftar)
function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Guard untuk rute yang memerlukan login (Dashboard /)
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/masuk" replace />;
  }

  return <>{children}</>;
}

// Dashboard Sementara di Rute /
function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const getStatusBadge = () => {
    switch (user.status) {
      case 'AKTIF':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            AKTIF
          </span>
        );
      case 'MENUNGGU':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            MENUNGGU
          </span>
        );
      case 'NONAKTIF':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            NONAKTIF
          </span>
        );
    }
  };

  const getRoleBadge = () => {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-zamrud-muda text-zamrud-gelap border border-zamrud-utama/30">
        {user.peran}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-latar-halaman text-teks-utama flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-garis-pemisah shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zamrud-utama text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-aksen-emas" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-zamrud-utama block leading-tight">
                Aplikasi Manajemen Tahfidz
              </span>
              <span className="text-[11px] text-teks-sekunder">
                Sistem Terpadu Satu Pondok
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-teks-utama leading-tight">
                {user.nama}
              </span>
              <span className="text-xs text-teks-sekunder">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grow w-full">
        {/* Peringatan Wajib Ganti Password */}
        {user.wajib_ganti_password && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 shadow-xs flex items-start gap-3 text-amber-900"
          >
            <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="grow">
              <p className="font-bold text-sm sm:text-base">
                Peringatan Keamanan
              </p>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                Anda wajib mengganti password sebelum melanjutkan.
              </p>
              {/* TODO: Modal atau alur ganti password di tahap berikutnya */}
            </div>
          </div>
        )}

        {/* Notifikasi Status Santri Menunggu */}
        {user.status === 'MENUNGGU' && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Menunggu Penempatan Halaqah</p>
              <p className="text-xs sm:text-sm text-blue-800 mt-0.5">
                Akun Anda telah berhasil terdaftar dan saat ini sedang menunggu penempatan ke dalam kelompok halaqah serta sesi rutin oleh admin pondok.
              </p>
            </div>
          </div>
        )}

        {/* Kartu Informasi Akun */}
        <div className="bg-white rounded-2xl border border-garis-kartu p-6 sm:p-8 shadow-xs max-w-2xl">
          <div className="flex items-center gap-3 pb-5 border-b border-garis-pemisah">
            <div className="w-12 h-12 rounded-full bg-zamrud-muda flex items-center justify-center text-zamrud-utama">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-teks-utama">{user.nama}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge()}
                {getStatusBadge()}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teks-sekunder block">
                Email / Nomor Kontak / Username
              </span>
              <span className="text-sm sm:text-base font-medium text-teks-utama mt-0.5 block">
                {user.username}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teks-sekunder block">
                ID Pengguna
              </span>
              <span className="text-xs sm:text-sm font-mono text-teks-sekunder mt-0.5 block break-all">
                {user.id}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teks-sekunder block">
                Status Wajib Ganti Password
              </span>
              <span className="text-xs sm:text-sm text-teks-utama mt-0.5 block">
                {user.wajib_ganti_password ? (
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> Ya (Perlu segera diganti)
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Tidak (Aman)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer sederhana */}
      <footer className="py-4 text-center text-xs text-teks-sekunder border-t border-garis-pemisah bg-white">
        Aplikasi Manajemen Tahfidz &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/masuk"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/daftar"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Rute lain redirect ke / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
