import React, { useState } from 'react';
import { Banknote, Trash2 } from 'lucide-react';
import { AppHeader } from '../components/AppUI';
import { useKasir } from '../context/KasirContext';
import { getUtangSisa, getUtangTotal } from '../models/utangModel';

export const UtangDetailScreen: React.FC<{
  utangId: number;
  onBack: () => void;
}> = ({ utangId, onBack }) => {
  const p = useKasir();
  const u = p.cariUtang(utangId);

  const [showPayDialog, setShowPayDialog] = useState(false);
  const [nominalText, setNominalText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!u) {
    return (
      <div className="fixed inset-0 z-40 bg-white flex flex-col max-w-md mx-auto">
        <AppHeader title="Detail Utang" onBack={onBack} />
        <div className="flex-1 flex items-center justify-center text-gray-500 text-[14px]">
          Catatan utang tidak ditemukan
        </div>
      </div>
    );
  }

  const sisa = getUtangSisa(u);
  const total = getUtangTotal(u);

  const handleBayar = async () => {
    const bayar = parseFloat(nominalText) || 0;
    setShowPayDialog(false);
    setNominalText('');
    try {
      await p.bayarUtang(u.id, bayar);
      const sisaBaru = Math.max(0, sisa - bayar);
      p.showToast(
        sisaBaru === 0
          ? `Utang ${u.nama} sudah lunas`
          : `Pembayaran tersimpan. Sisa ${p.formatHarga(sisaBaru)}`,
        sisaBaru === 0 ? 'success' : 'warning'
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      p.showToast(msg, 'error');
    }
  };

  const handleHapus = async () => {
    setShowDeleteConfirm(false);
    try {
      await p.hapusUtang(u.id);
      onBack();
    } catch (e: unknown) {
      p.showToast(`Gagal menghapus: ${String(e)}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col max-w-md mx-auto">
      <AppHeader
        title="Detail Utang"
        onBack={onBack}
        actions={
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Hapus catatan"
            className="p-2 text-app-inkSoft hover:bg-gray-100 rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        {/* Kepala */}
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-soft flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-red-700 font-bold text-[18px] shrink-0">
            {u.nama ? u.nama[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[17px] text-app-ink truncate">
              {u.nama}
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              Berutang {p.formatTanggal(u.tanggal)}
            </div>
            {u.lunas && u.tanggalLunas && (
              <div className="text-[12px] text-green-700 mt-0.5">
                Lunas {p.formatTanggal(u.tanggalLunas)}
              </div>
            )}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              u.lunas
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {u.lunas ? 'LUNAS' : 'BELUM LUNAS'}
          </span>
        </div>

        {/* Nominal Card */}
        <div
          className={`p-4 rounded-[14px] space-y-2.5 ${
            u.lunas ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium">Total utang</span>
            <span className="font-bold text-[14px]">{p.formatHarga(total)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium">Sudah dibayar</span>
            <span className="font-bold text-[14px]">
              {p.formatHarga(u.totalDibayar)}
            </span>
          </div>
          <div className="border-t border-black/10 my-2" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-[15px]">Sisa utang</span>
            <span className="font-bold text-[20px]">{p.formatHarga(sisa)}</span>
          </div>
        </div>

        {/* Catatan */}
        {u.catatan.trim() !== '' && (
          <div>
            <div className="font-bold text-[14px] mb-1.5">Catatan</div>
            <div className="w-full p-3.5 rounded-[14px] bg-gray-50 text-[13px] leading-relaxed">
              {u.catatan}
            </div>
          </div>
        )}

        {/* Tombol Lunas */}
        {!u.lunas && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setNominalText(String(Math.round(sisa)));
                setShowPayDialog(true);
              }}
              className="w-full py-3.5 rounded-xl bg-green-600 text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              <Banknote className="w-5 h-5" />
              <span>Lunas</span>
            </button>
          </div>
        )}
      </div>

      {/* Pelunasan Dialog */}
      {showPayDialog && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <h3 className="font-bold text-[16px]">Pelunasan utang</h3>
            <p className="text-[13px] text-gray-600 mt-1">
              Sisa utang: {p.formatHarga(sisa)}
            </p>
            <div className="mt-3">
              <label className="block text-[11px] text-gray-500 mb-1">
                Nominal yang dibayar
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-xl border border-gray-300">
                <span className="text-[13px] text-gray-500 mr-1.5">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={nominalText}
                  onChange={(e) =>
                    setNominalText(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className="w-full text-[14px] focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPayDialog(false)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBayar}
                className="px-4 py-2 rounded-xl bg-brand-red text-white text-[13px] font-semibold"
              >
                Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <h3 className="font-bold text-[16px]">Hapus catatan utang</h3>
            <p className="text-[13px] text-gray-600 mt-2">
              Hapus catatan utang atas nama "{u.nama}"?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleHapus}
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
