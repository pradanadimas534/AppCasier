import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Contact,
  Download,
  ExternalLink,
  LogIn,
  QrCode,
  Receipt,
  RefreshCw,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-react';
import { useKasir } from '../context/KasirContext';
import {
  type AppVersionInfo,
  DEFAULT_APP_VERSION,
  DEFAULT_BUILD_NUMBER,
  fetchLatestVersionInfo,
} from '../services/updateService';
import { formatTanggal } from '../utils/format';

export const WebLandingScreen: React.FC<{
  onOpenDownloadPage?: () => void;
}> = ({ onOpenDownloadPage }) => {
  const { login, loginError, showToast } = useKasir();
  const [loginLoading, setLoginLoading] = useState(false);
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchLatestVersionInfo()
      .then(setVersionInfo)
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    const ok = await login();
    if (!ok) {
      setLoginLoading(false);
      showToast(loginError || 'Login gagal, coba lagi', 'error');
    }
  };

  const versionLabel = versionInfo
    ? `v${versionInfo.version} (Build ${versionInfo.buildNumber})`
    : `v${DEFAULT_APP_VERSION} (Build ${DEFAULT_BUILD_NUMBER})`;

  const apkUrl = versionInfo?.apkUrl ?? '/kasirku-latest.apk';

  const features = [
    {
      icon: <Scale className="w-6 h-6 text-brand-red" />,
      title: 'Kasir Satuan & Timbangan',
      desc: 'Mendukung penjualan produk satuan (pcs) maupun barang curah/timbangan (gram, ons, kg) dengan tombol preset takaran cepat.',
    },
    {
      icon: <QrCode className="w-6 h-6 text-brand-red" />,
      title: 'Scanner Barcode Kamera',
      desc: 'Gunakan kamera HP langsung sebagai pemindai barcode untuk memasukkan barang ke keranjang maupun menghitung stok barang masuk.',
    },
    {
      icon: <Receipt className="w-6 h-6 text-brand-red" />,
      title: 'Struk Digital & Bagikan ke WA',
      desc: 'Hitung kembalian otomatis, tampilkan struk belanja rapi, dan kirim langsung ke WhatsApp pelanggan hanya dengan 1 klik.',
    },
    {
      icon: <Store className="w-6 h-6 text-brand-red" />,
      title: 'Manajemen Stok & Sampah 30 Hari',
      desc: 'Pantau indikator stok Aman, Menipis, atau Habis. Barang yang terhapus masuk ke ruang Sampah dan bisa dipulihkan dalam 30 hari.',
    },
    {
      icon: <Contact className="w-6 h-6 text-brand-red" />,
      title: 'Catatan Utang Pelanggan',
      desc: 'Catat kasbon/utang pelanggan lengkap dengan tanggal, rincian catatan, riwayat cicilan pembayaran, dan total sisa piutang toko.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-brand-red" />,
      title: 'Laporan Harian & Grafik 7 Hari',
      desc: 'Rekap otomatis omzet harian, daftar produk terlaris hari ini, analisis tingkat keramaian toko, dan grafik tren 7 hari terakhir.',
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-white text-app-ink font-poppins">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-soft to-brand-deep p-1.5 flex items-center justify-center shadow-sm">
              <img
                src="/assets/images/basket.png"
                alt="Kasir Toko"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-lobster text-[24px] text-brand-red leading-none block">
                Kasir Toko
              </span>
              <span className="text-[11px] text-app-muted block">
                Kasir &amp; Operasional UMKM
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-app-inkSoft">
            <a href="#fitur" className="hover:text-brand-red transition">
              Fitur Aplikasi
            </a>
            <a href="#keunggulan" className="hover:text-brand-red transition">
              Tentang
            </a>
            <a href="#download" className="hover:text-brand-red transition">
              Download Android
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={apkUrl}
              download="Kasirku.apk"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-red text-brand-red hover:bg-red-50 font-semibold text-[13px] transition"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </a>
            <button
              type="button"
              disabled={loginLoading}
              onClick={handleLogin}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-brand-red hover:bg-brand-deep text-white font-semibold text-[13px] shadow-sm active:scale-95 transition disabled:opacity-60"
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center font-inter font-bold text-[11px] text-[#4285F4]">
                G
              </span>
              <span>{loginLoading ? 'Masuk...' : 'Login Kasir'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-soft via-brand-red to-brand-deep text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid md:grid-cols-12 gap-10 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="md:col-span-7 space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-[12px] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aplikasi Kasir Modern · Gratis &amp; Tersinkron Cloud</span>
            </div>

            <h1 className="font-poppins font-bold text-[32px] sm:text-[44px] leading-[1.18]">
              Kelola Kasir, Stok Barcode &amp; Catatan Utang Toko Lebih Mudah.
            </h1>

            <p className="font-inter text-[15px] sm:text-[17px] text-white/90 leading-relaxed max-w-xl mx-auto md:mx-0">
              <strong>Kasir Toko</strong> membantu warung, toko kelontong, dan UMKM
              mencatat transaksi harian, memindai barcode barang lewat kamera HP,
              mengelola piutang pelanggan, hingga memantau grafik penjualan secara
              real-time.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5">
              <a
                href={apkUrl}
                download="Kasirku.apk"
                onClick={() => {
                  setDownloading(true);
                  window.setTimeout(() => setDownloading(false), 3000);
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white text-brand-red hover:bg-gray-50 font-bold text-[15px] shadow-[0_10px_25px_rgba(0,0,0,0.18)] flex items-center justify-center gap-2.5 active:scale-[0.99] transition"
              >
                <Download className="w-5 h-5" />
                <span>
                  {downloading
                    ? 'Mengunduh Kasirku.apk...'
                    : 'Download for Android (.apk)'}
                </span>
              </a>

              <button
                type="button"
                disabled={loginLoading}
                onClick={handleLogin}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-black/25 hover:bg-black/35 border border-white/35 text-white font-semibold text-[15px] flex items-center justify-center gap-2.5 active:scale-[0.99] transition disabled:opacity-60"
              >
                <LogIn className="w-5 h-5" />
                <span>Login dengan Google (Versi Web)</span>
              </button>
            </div>

            {/* Version & Platform Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-[12px] text-white/85">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Rilis Terbaru: <strong>{versionLabel}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Ukuran Ringan: <strong>{versionInfo?.sizeMb ?? '5.5 MB'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Update Instan 1-Klik di Dalam Aplikasi
              </span>
            </div>
          </div>

          {/* Right Column: App Showcase Card */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] rounded-[28px] bg-white/10 backdrop-blur-md border border-white/25 p-5 shadow-2xl">
              <div className="rounded-2xl bg-white text-app-ink p-5 shadow-lg">
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                  <div>
                    <div className="font-lobster text-[26px] text-brand-red leading-none">
                      Kasir Toko
                    </div>
                    <div className="text-[11px] text-app-muted mt-0.5">
                      Aplikasi Android &amp; Web POS
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-bold text-[10px]">
                    SIAP PAKAI
                  </span>
                </div>

                <div className="my-5 flex justify-center">
                  <img
                    src="/assets/images/basket.png"
                    alt="Ilustrasi Kasir Toko"
                    className="w-44 h-44 object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-app-surface p-3 rounded-xl">
                  <div>
                    <div className="text-[11px] text-app-muted">Database</div>
                    <div className="font-bold text-[13px] text-app-ink">
                      Cloud &amp; Offline
                    </div>
                  </div>
                  <div className="border-l border-gray-200">
                    <div className="text-[11px] text-app-muted">Biaya</div>
                    <div className="font-bold text-[13px] text-app-success">
                      100% Gratis
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="mt-4 w-full py-3 rounded-xl bg-[#FBECEC] hover:bg-red-100/80 text-app-ink font-semibold text-[13px] flex items-center justify-center gap-2 transition"
                >
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-inter font-bold text-[12px] text-[#4285F4]">
                    G
                  </span>
                  <span>Masuk dengan Akun Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="fitur" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-brand-red font-bold text-[12px] uppercase tracking-wider">
            Fitur Lengkap Operasional Toko
          </span>
          <h2 className="font-bold text-[26px] sm:text-[32px] text-app-ink mt-1">
            Semua yang Dibutuhkan Kasir Toko dalam Satu Aplikasi
          </h2>
          <p className="text-[14px] text-app-muted mt-2">
            Dirancang khusus agar ringan, cepat dipakai melayani pembeli, dan
            tetap aman tersimpan di akun Google Anda.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-soft hover:border-brand-red/30 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-[17px] text-app-ink">{f.title}</h3>
              <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Keunggulan Section */}
      <section
        id="keunggulan"
        className="py-14 px-4 sm:px-6 bg-app-surface border-y border-gray-100"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-50 text-app-success shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-app-ink">
                Data Aman di Akun Google
              </h4>
              <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                Seluruh data barang, riwayat transaksi, dan catatan utang
                tersimpan di akun Firebase/Google Anda. Ganti HP tidak akan
                membuat data hilang.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-brand-red shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-app-ink">
                Update 1-Klik Tanpa Ribet
              </h4>
              <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                Cukup install file APK sekali saja. Ketika ada pembaruan fitur,
                cukup klik tombol <strong>Update Sekarang</strong> di dalam
                aplikasi tanpa perlu download APK ulang.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-app-ink">
                Perlindungan Salah Hapus
              </h4>
              <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                Dilengkapi folder Sampah otomatis selama 30 hari sehingga produk
                yang tidak sengaja terhapus dapat dikembalikan kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download & Installation Guide Section */}
      <section id="download" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-brand-soft to-brand-deep text-white p-6 sm:p-10 shadow-xl grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold tracking-wider uppercase">
              Unduh Aplikasi Android
            </span>
            <h2 className="font-bold text-[24px] sm:text-[30px] leading-tight">
              Pasang Kasir Toko di HP Android Anda Sekarang
            </h2>
            <p className="text-[14px] text-white/90 leading-relaxed">
              Dapatkan pengalaman penuh pemindai barcode kamera dan performa
              responsif dengan mengunduh file instalasi resmi{' '}
              <strong>Kasirku.apk</strong> ({versionLabel}).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={apkUrl}
                download="Kasirku.apk"
                className="px-6 py-3.5 rounded-2xl bg-white text-brand-red hover:bg-gray-50 font-bold text-[14px] shadow-md inline-flex items-center gap-2 active:scale-95 transition"
              >
                <Download className="w-5 h-5" />
                <span>Download for Android (.apk)</span>
              </a>

              {onOpenDownloadPage && (
                <button
                  type="button"
                  onClick={onOpenDownloadPage}
                  className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-[13px] inline-flex items-center gap-2 transition"
                >
                  <span>Detail Rilis &amp; Catatan Versi</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-5 bg-white text-app-ink rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-[14px] text-app-ink mb-3">
              <Smartphone className="w-4 h-4 text-brand-red" />
              <span>Cara Install di HP Android:</span>
            </div>
            <ol className="space-y-2 text-[12px] text-gray-700 list-decimal list-inside">
              <li>
                Klik tombol <strong>Download for Android (.apk)</strong>.
              </li>
              <li>
                Buka file <strong>Kasirku.apk</strong> yang selesai diunduh.
              </li>
              <li>
                Jika diminta izin browser, pilih{' '}
                <strong>Izinkan dari sumber ini</strong>.
              </li>
              <li>
                Klik <strong>Install</strong> lalu login dengan akun Google Anda.
              </li>
            </ol>
            {versionInfo?.releasedAt && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-app-muted flex items-center justify-between">
                <span>Diperbarui: {formatTanggal(versionInfo.releasedAt)}</span>
                <span>Ukuran: {versionInfo.sizeMb}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 text-center text-[12px] text-app-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-lobster text-[18px] text-brand-red">
              Kasir Toko
            </span>
            <span>· Kasir &amp; Operasional Toko</span>
          </div>
          <div>
            Dengan menggunakan aplikasi ini, Anda menyetujui Syarat &amp;
            Ketentuan serta Kebijakan Privasi.
          </div>
        </div>
      </footer>

      {/* Loading Overlay during Google Sign-In */}
      {loginLoading && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
