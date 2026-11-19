import React from 'react';
import { BarChart3, Contact, ShoppingBag, Store } from 'lucide-react';
import { BarcodeIcon } from './AppUI';

export const AppBottomNav: React.FC<{
  currentIndex: number;
  onTap: (index: number) => void;
  onScan: () => void;
}> = ({ currentIndex, onTap, onScan }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="relative max-w-md mx-auto pointer-events-auto">
        {/* Floating center Scan FAB */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-40">
          <div className="p-1.5 rounded-full bg-white shadow-sm">
            <button
              type="button"
              onClick={onScan}
              aria-label="Scan Barcode"
              className="w-[58px] h-[58px] rounded-full bg-brand-bright text-white shadow-[0_6px_16px_rgba(239,42,57,0.45)] flex items-center justify-center active:scale-95 transition"
            >
              <BarcodeIcon light size={28} />
            </button>
          </div>
        </div>

        {/* Bottom red bar */}
        <nav
          aria-label="Navigasi Utama"
          className="h-[58px] bg-brand-red text-white flex items-center justify-around px-2 shadow-[0_-4px_14px_rgba(0,0,0,0.12)]"
        >
          <NavBtn
            active={currentIndex === 0}
            onClick={() => onTap(0)}
            label="Kasir"
            icon={<ShoppingBag className="w-6 h-6" />}
          />
          <NavBtn
            active={currentIndex === 1}
            onClick={() => onTap(1)}
            label="Stok"
            icon={<Store className="w-6 h-6" />}
          />
          <div className="w-16" />
          <NavBtn
            active={currentIndex === 2}
            onClick={() => onTap(2)}
            label="Utang"
            icon={<Contact className="w-6 h-6" />}
          />
          <NavBtn
            active={currentIndex === 3}
            onClick={() => onTap(3)}
            label="Laporan"
            icon={<BarChart3 className="w-6 h-6" />}
          />
        </nav>
      </div>
    </div>
  );
};

const NavBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}> = ({ active, onClick, label, icon }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`p-2.5 rounded-full transition ${
        active ? 'text-white scale-105' : 'text-white/70 hover:text-white/90'
      }`}
    >
      {icon}
    </button>
  );
};
