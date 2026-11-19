import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AppBottomNav } from '../components/AppBottomNav';
import { useKasir } from '../context/KasirContext';
import {
  BarcodeScannerScreen,
  type ScanMode,
} from './BarcodeScannerScreen';
import { KasirScreen } from './KasirScreen';
import { LaporanScreen } from './LaporanScreen';
import { StokScreen } from './StokScreen';
import { UtangScreen } from './UtangScreen';

export const HomeScreen: React.FC = () => {
  const p = useKasir();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    </div>
  );
};
