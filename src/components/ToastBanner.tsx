import React from 'react';
import { useKasir } from '../context/KasirContext';

export const ToastBanner: React.FC = () => {
  const { toast, dismissToast } = useKasir();
  if (!toast) return null;

  const bgClass =
    toast.type === 'success'
      ? 'bg-app-success'
      : toast.type === 'error'
      ? 'bg-brand-red'
      : toast.type === 'warning'
      ? 'bg-amber-600'
      : 'bg-app-ink';

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div
        className={`${bgClass} text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 max-w-md w-full pointer-events-auto transition-all`}
      >
        <span className="text-[13px] font-medium leading-snug">{toast.text}</span>
        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              dismissToast();
            }}
            className="text-xs font-bold uppercase tracking-wider underline shrink-0"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
