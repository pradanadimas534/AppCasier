import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';

export const AppHeader: React.FC<{
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}> = ({ title, onBack, actions }) => {
  return (
    <header className="bg-white shadow-[0_3px_8px_rgba(0,0,0,0.05)] sticky top-0 z-20">
      <div className="h-[58px] flex items-center px-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <ChevronLeft className="w-8 h-8 text-brand-red" />
          </button>
        ) : (
          <div className="w-3.5" />
        )}
        <h1 className="flex-1 font-poppins font-bold text-[20px] text-app-ink truncate">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-1 pr-1">{actions}</div>}
      </div>
    </header>
  );
};

export const SearchPill: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  trailing?: React.ReactNode;
}> = ({ value, onChange, placeholder = 'Cari...', trailing }) => {
  return (
    <div className="bg-white rounded-[26px] shadow-soft flex items-center pl-4 pr-2 border border-gray-100/60">
      <Search className="w-5 h-5 text-app-muted shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-3.5 px-3 text-[14px] font-poppins text-app-ink placeholder:text-app-muted bg-transparent focus:outline-none"
      />
      {trailing}
    </div>
  );
};

export const BarcodeIcon: React.FC<{
  light?: boolean;
  size?: number;
}> = ({ light = false, size = 26 }) => {
  return (
    <img
      src={light ? '/assets/images/barcode_putih.png' : '/assets/images/barcode_merah.png'}
      alt="Barcode"
      style={{ width: size, height: size }}
      className="object-contain select-none"
    />
  );
};

export const PillChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-[22px] py-[10px] rounded-[24px] font-inter font-medium text-[14px] whitespace-nowrap transition-all duration-150 ${
        active
          ? 'bg-brand-red text-white shadow-[0_4px_12px_rgba(229,29,42,0.3)]'
          : 'bg-app-chipBg text-app-chipText hover:bg-gray-200/70'
      }`}
    >
      {label}
    </button>
  );
};

export const AppEmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && <div className="text-app-line mb-3">{icon}</div>}
      <h3 className="font-poppins font-medium text-[16px] text-app-muted">
        {title}
      </h3>
      <p className="font-poppins font-light text-[13px] text-app-faint mt-1.5 whitespace-pre-line leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 bg-app-chipBg text-brand-red font-poppins font-semibold text-[13px] px-6 py-3 rounded-[20px] active:scale-95 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
