import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  type AppVersionInfo,
  DEFAULT_APP_VERSION,
  DEFAULT_BUILD_NUMBER,
  fetchLatestVersionInfo,
} from '../services/updateService';
import { formatTanggal } from '../utils/format';

export const DownloadScreen: React.FC<{
  onBackToApp: () => void;
}> = ({ onBackToApp }) => {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadInfo = async () => {
    setLoading(true);
    const latest = await fetchLatestVersionInfo();
    setInfo(latest);
    setLoading(false);
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const versionLabel = info
    ? `v${info.version} (Build ${info.buildNumber})`
    : `v${DEFAULT_APP_VERSION} (Build ${DEFAULT_BUILD_NUMBER})`;

  const apkUrl = info?.apkUrl ?? '/kasirku-latest.apk';

  const handleDownload = () => {
    setDownloading(true);
    window.setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-app-surface text-app-ink">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-soft to-brand-deep text-white px-5 pt-5 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToApp}
              className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[13px] font-medium flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Buka Aplikasi</span>
            </button>
            <button
              type="button"
              onClick={loadInfo}
              title="Segarkan info versi"
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center shrink-0">
              <img
                src="/assets/images/basket.png"
                alt="Kasirku Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide">
                OFFICIAL ANDROID APK
              </span>
              <h1 className="font-lobster text-[34px] leading-tight mt-0.5">
                Kasir Toko
              </h1>
              <p className="text-[13px] text-white/90">
                Aplikasi Kasir, Stok Barcode &amp; Catatan Utang
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="max-w-lg mx-auto px-4 -mt-7 pb-10 space-y-4">
        {/* Download Action Card */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-center pb-4 border-b border-gray-100">
            <div>
              <div className="text-[11px] text-app-muted">Versi Terbaru</div>
              <div className="font-bold text-[13px] text-app-ink mt-0.5">
                {versionLabel}
              </div>
            </div>
            <div className="border-x border-gray-100">
              <div className="text-[11px] text-app-muted">Ukuran File</div>
              <div className="font-bold text-[13px] text-app-ink mt-0.5">
                {info?.sizeMb ?? '5.5 MB'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-app-muted">Update</div>
              <div className="font-bold text-[13px] text-app-ink mt-0.5">
                {info?.releasedAt ? formatTanggal(info.releasedAt) : 'Hari ini'}
              </div>
            </div>
          </div>

          {/* Primary Download Button */}
          <a
            href={apkUrl}
            download="Kasirku.apk"
            onClick={handleDownload}
            className="mt-4 w-full py-4 rounded-2xl bg-brand-red hover:bg-brand-deep text-white font-bold text-[15px] shadow-[0_6px_16px_rgba(229,29,42,0.32)] flex items-center justify-center gap-2.5 active:scale-[0.99] transition"
          >
            <Download className="w-5 h-5" />
            <span>
              {downloading
                ? 'Mengunduh Kasirku.apk...'
                : 'Download APK Android (.apk)'}
            </span>
          </a>

          {/* Mirror GitHub Releases */}
          {info?.githubReleaseUrl && (
            <a
              href={info.githubReleaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-app-inkSoft font-medium text-[12px] flex items-center justify-center gap-1.5 transition"
            >
              <span>Mirror Download via GitHub Releases</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-green-700 bg-green-50 py-2 px-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Bebas biaya langganan · Data tersinkron otomatis ke akun Google Anda
            </span>
          </div>
        </div>

        {/* Apa yang baru / Release Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
          <div className="flex items-center gap-2 font-bold text-[15px] text-app-ink mb-3">
            <Sparkles className="w-4 h-4 text-brand-red" />
            <span>Apa yang baru di {versionLabel}</span>
          </div>
          <ul className="space-y-2">
            {(
              info?.notes ?? [
                'Rilis penuh Kasirku berbasis React + Capacitor Android',
                'Dukungan Cek Update Aplikasi langsung dari dalam APK',
              ]
            ).map((note, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-[13px] text-gray-700"
              >
                <CheckCircle2 className="w-4 h-4 text-app-success shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cara Install & Update */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
          <div className="flex items-center gap-2 font-bold text-[15px] text-app-ink mb-3">
            <Smartphone className="w-4 h-4 text-brand-red" />
            <span>Cara Install &amp; Update di HP Android</span>
          </div>
          <ol className="space-y-2.5 text-[13px] text-gray-700 list-decimal list-inside">
            <li>
              Tekan tombol <strong>Download APK Android</strong> di atas hingga
              unduhan selesai.
            </li>
            <li>
              Buka file <strong>Kasirku.apk</strong> yang sudah terunduh.
            </li>
            <li>
              Jika muncul peringatan keamanan browser, pilih{' '}
              <strong>Setelan &rarr; Izinkan dari sumber ini</strong>.
            </li>
            <li>
              Tekan <strong>Install / Update</strong>. Jika Anda sedang
              meng-update versi lama, tidak perlu uninstall dulu (data Anda
              tetap aman).
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
