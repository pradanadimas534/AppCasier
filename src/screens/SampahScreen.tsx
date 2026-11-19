import React, { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { AppEmptyState, AppHeader } from '../components/AppUI';
import { useKasir } from '../context/KasirContext';
import type { ItemModel } from '../models/itemModel';

export const SampahScreen: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const p = useKasir();
  const trash = p.trashItems;
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ItemModel | null>(null);

  const handleKosongkan = async () => {
    setConfirmEmpty(false);
    await p.kosongkanSampah();
    p.showToast('Sampah dikosongkan', 'info');
  };

  const handleHapusPermanen = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    await p.hapusPermanenItem(id);
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col max-w-md mx-auto">
      <AppHeader
        title="Sampah"
        onBack={onBack}
        actions={
          trash.length > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmEmpty(true)}
              className="px-3 py-1.5 text-[13px] font-semibold text-brand-red"
            >
              Kosongkan
            </button>
          ) : undefined
        }
      />

      <div className="w-full bg-app-surface px-4 py-2.5 text-[12px] text-app-muted">
        Barang di sini dihapus otomatis setelah 30 hari. Pulihkan sebelum itu
        kalau masih dibutuhkan.
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-6">
        {trash.length === 0 ? (
          <AppEmptyState
            icon={<Trash2 className="w-11 h-11" />}
            title="Sampah kosong"
            message="Barang yang kamu hapus akan muncul di sini"
          />
        ) : (
          <div className="space-y-2.5">
            {trash.map((item) => {
              const sisa = p.sisaHariSampah(item);
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-[14px] bg-white shadow-soft border border-gray-100"
                >
                  <div className="font-bold text-[14px] text-app-ink">
                    {item.name}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      sisa <= 3 ? 'text-brand-red' : 'text-app-muted'
                    }`}
                  >
                    Dihapus {p.formatTanggal(item.deletedAt!)} ·{' '}
                    {sisa === 0 ? 'akan dihapus hari ini' : `sisa ${sisa} hari`}
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await p.pulihkanItem(item.id);
                        p.showToast(`${item.name} dipulihkan`, 'success');
                      }}
                      className="flex-1 py-2 rounded-xl border border-app-success/50 text-app-success font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Pulihkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      title="Hapus permanen"
                      className="p-2 text-brand-red hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Kosongkan */}
      {confirmEmpty && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <h3 className="font-bold text-[16px]">Kosongkan Sampah</h3>
            <p className="text-[13px] text-gray-600 mt-2">
              Hapus permanen {trash.length} barang di Sampah? Tindakan ini tidak
              bisa dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmEmpty(false)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleKosongkan}
                className="px-4 py-2 text-[13px] font-bold text-brand-red"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Hapus Permanen */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <h3 className="font-bold text-[16px]">Hapus permanen</h3>
            <p className="text-[13px] text-gray-600 mt-2">
              Hapus "{deleteTarget.name}" selamanya?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleHapusPermanen}
                className="px-4 py-2 text-[13px] font-bold text-brand-red"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
