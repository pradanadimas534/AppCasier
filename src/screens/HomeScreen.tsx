import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  LogOut,
  Printer,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { AppBottomNav } from '../components/AppBottomNav';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { useKasir } from '../context/KasirContext';
import { getSavedPrinter } from '../services/printerService';
import {
  applyInstantInAppUpdate,
  type AppVersionInfo,
  fetchLatestVersionInfo,
  getInstalledVersion,
} from '../services/updateService';
import {
  BarcodeScannerScreen,
  type ScanMode,
} from './BarcodeScannerScreen';
import { KasirScreen } from './KasirScreen';
import { LaporanScreen } from './LaporanScreen';
import { StokScreen } from './StokScreen';
import { UtangScreen } from './UtangScreen';

export const HomeScreen: React.FC<{
  onOpenDownloadPage?: () => void;
}> = ({ onOpenDownloadPage }) => {
  const p = useKasir();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [savedPrinterName, setSavedPrinterName] = useState<string>(
    () => getSavedPrinter()?.name ?? ''
  );

  // Update check state
  const installed = getInstalledVersion();
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Scanner modal state
  const [scannerState, setScannerState] = useState<{
    open: boolean;
    mode: ScanMode;
    onFieldResult?: (barcode: string) => void;
    onCountResult?: (res: { barcode: string; count: number }) => void;
  }>({
    open: false,
    mode: 'cart',
  });

  useEffect(() => {
    // Background check on startup
    fetchLatestVersionInfo()
      .then((info) => {
        setUpdateInfo(info);
        if (info.hasUpdate) {
          setShowUpdateModal(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const info = await fetchLatestVersionInfo();
      setUpdateInfo(info);
      setShowUpdateModal(true);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleApplyInstantUpdate = async () => {
    if (!updateInfo || isApplyingUpdate) return;
    setIsApplyingUpdate(true);
    setUpdateProgress(10);
    await applyInstantInAppUpdate(updateInfo, (pct) => {
      setUpdateProgress(pct);
    });
  };

  const handleGlobalScan = () => {
    setScannerState({
      open: true,
      mode: 'cart',
    });
  };

  return (
    <div className="relative h-full w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden shadow-xl">
      {/* Pages (IndexedStack style so state is preserved across tab switches) */}
      <div className="flex-1 overflow-hidden">
        <div className={currentIndex === 0 ? 'h-full' : 'hidden'}>
          <KasirScreen onOpenDrawer={() => setDrawerOpen(true)} />
        </div>
        <div className={currentIndex === 1 ? 'h-full' : 'hidden'}>
          <StokScreen
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenScannerField={(cb) =>
              setScannerState({
                open: true,
                mode: 'field',
                onFieldResult: cb,
              })
            }
            onOpenScannerCount={(cb) =>
              setScannerState({
                open: true,
                mode: 'count',
                onCountResult: cb,
              })
            }
          />
        </div>
        <div className={currentIndex === 2 ? 'h-full' : 'hidden'}>
          <UtangScreen />
        </div>
        <div className={currentIndex === 3 ? 'h-full' : 'hidden'}>
          <LaporanScreen onOpenDrawer={() => setDrawerOpen(true)} />
        </div>
      </div>

      {/* Bottom Nav + Center Scan FAB */}
      <AppBottomNav
        currentIndex={currentIndex}
        onTap={setCurrentIndex}
        onScan={handleGlobalScan}
      />

      {/* App Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-[290px] max-w-[82vw] h-full bg-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Header */}
            <div className="w-full px-5 pt-6 pb-5 bg-gradient-to-br from-brand-soft to-brand-deep text-white">
              <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-[22px]">
                {p.userName ? p.userName[0].toUpperCase() : 'U'}
              </div>
              <div className="mt-3 font-bold text-[16px] text-white truncate">
                {p.userName || 'Pengguna'}
              </div>
              <div className="text-[12px] text-white/85 truncate">
                {p.userEmail}
              </div>
            </div>

            {/* Today Stats */}
            <div className="px-4 mt-4">
              <div className="p-3.5 rounded-[14px] bg-app-surface flex items-center">
                <div className="flex-1 text-center px-1">
                  <div className="text-[16px] font-bold text-brand-red truncate">
                    {p.transaksiHariIni}
                  </div>
                  <div className="text-[11px] text-app-muted mt-0.5">
                    Transaksi hari ini
                  </div>
                </div>
                <div className="w-[1px] h-[38px] bg-app-line" />
                <div className="flex-1 text-center px-1">
                  <div className="text-[16px] font-bold text-brand-red truncate">
                    {p.formatHarga(p.pendapatanHariIni)}
                  </div>
                  <div className="text-[11px] text-app-muted mt-0.5">
                    Pendapatan
                  </div>
                </div>
              </div>
            </div>

            {/* App Update & Printer Bluetooth Section */}
            <div className="px-4 mt-4 space-y-2.5">
              {/* Printer Bluetooth */}
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setShowPrinterModal(true);
                }}
                className="w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50/70 flex items-center gap-3 text-left hover:bg-gray-100 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-brand-red shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[12px] text-app-ink">
                    Printer Thermal Bluetooth
                  </div>
                  <div className="text-[11px] text-app-muted truncate">
                    {savedPrinterName || 'Belum terhubung — Ketuk atur'}
                  </div>
                </div>
              </button>

              <div className="p-3 rounded-[14px] border border-gray-100 bg-gray-50/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-app-muted">
                    Versi Aplikasi
                  </span>
                  <span className="text-[11px] font-semibold text-app-ink">
                    v{installed.version} (Build {installed.buildNumber})
                  </span>
                </div>

                <button
                  type="button"
                  disabled={checkingUpdate}
                  onClick={handleManualCheckUpdate}
                  className="mt-2.5 w-full py-2 px-3 rounded-xl bg-white border border-gray-200 text-app-ink font-semibold text-[12px] flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-95 transition"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-brand-red ${
                      checkingUpdate ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {checkingUpdate ? 'Memeriksa...' : 'Cek Update Aplikasi'}
                  </span>
                  {updateInfo?.hasUpdate && (
                    <span className="px-1.5 py-0.5 rounded-full bg-brand-red text-white text-[9px] font-bold">
                      BARU
                    </span>
                  )}
                </button>

                {onOpenDownloadPage && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenDownloadPage();
                    }}
                    className="mt-1.5 w-full py-2 px-3 rounded-xl text-brand-red font-semibold text-[12px] flex items-center justify-center gap-1.5 hover:bg-red-50 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Halaman Download APK</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1" />

            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={async () => {
                  setDrawerOpen(false);
                  await p.logout();
                }}
                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-brand-red font-semibold text-[14px] hover:bg-red-50 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal (Instant 1-Click Update without APK Re-Download) */}
      {showUpdateModal && updateInfo && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-brand-red shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-app-ink">
                  {updateInfo.hasUpdate
                    ? 'Update Aplikasi Tersedia!'
                    : 'Aplikasi Sudah Versi Terbaru'}
                </h3>
                <p className="text-[12px] text-app-muted">
                  Versi Server: v{updateInfo.version} (Build{' '}
                  {updateInfo.buildNumber})
                </p>
              </div>
            </div>

            <div className="mt-3.5 p-3 rounded-xl bg-gray-50 space-y-1.5 max-h-40 overflow-y-auto">
              {updateInfo.notes.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-gray-700 break-words"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-app-success shrink-0 mt-0.5" />
                  <span>{n}</span>
                </div>
              ))}
            </div>

            {isApplyingUpdate ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[12px] font-semibold text-app-ink">
                  <span>Memperbarui aplikasi...</span>
                  <span>{updateProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${updateProgress}%` }}
                    className="h-full bg-brand-red rounded-full transition-all duration-200"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {updateInfo.hasUpdate && (
                  <button
                    type="button"
                    onClick={handleApplyInstantUpdate}
                    className="w-full py-3 rounded-xl bg-brand-red text-white font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Update Sekarang</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {scannerState.open && (
        <BarcodeScannerScreen
          mode={scannerState.mode}
          onFieldResult={scannerState.onFieldResult}
          onCountResult={scannerState.onCountResult}
          onClose={() => {
            const wasCartMode = scannerState.mode === 'cart';
            setScannerState({ open: false, mode: 'cart' });
            if (wasCartMode) {
              setCurrentIndex(0);
            }
          }}
        />
      )}

      {/* Printer Bluetooth Settings Modal */}
      {showPrinterModal && (
        <PrinterSettingsModal
          onClose={() => setShowPrinterModal(false)}
          onPrinterSelected={(dev) => setSavedPrinterName(dev?.name ?? '')}
        />
      )}
    </div>
  );
};
