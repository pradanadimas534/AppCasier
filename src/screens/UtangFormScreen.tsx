import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { AppHeader } from '../components/AppUI';
import { useKasir } from '../context/KasirContext';
import { getTodayIsoKey } from '../utils/format';

export const UtangFormScreen: React.FC<{
  onBack: () => void;
  onSaved: () => void;
}> = ({ onBack, onSaved }) => {
  const p = useKasir();
  const [nama, setNama] = useState('');
  const [tanggalStr, setTanggalStr] = useState(getTodayIsoKey());
  const [nominalText, setNominalText] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSimpan = async () => {
    const cleanNama = nama.trim();
    const nominal = parseFloat(nominalText) || 0;
    if (!cleanNama) {
      p.showToast('Isi nama orang yang berutang.', 'error');
      return;
    }
    if (nominal <= 0) {
      p.showToast('Isi nominal utang yang benar.', 'error');
      return;
    }

    setSaving(true);
    try {
      await p.tambahUtang({
        nama: cleanNama,
        tanggal: new Date(tanggalStr),
        nominal,
        catatan,
      });
      onSaved();
    } catch (e: unknown) {
      setSaving(false);
      p.showToast(`Gagal menyimpan utang: ${String(e)}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col max-w-md mx-auto">
      <AppHeader title="Catat Utang Baru" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        <div>
          <label className="block font-bold text-[13px] mb-1.5">
            Nama orang yang berutang
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Bu Sri"
            className="w-full px-3 py-3 rounded-[10px] bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </div>

        <div>
          <label className="block font-bold text-[13px] mb-1.5">
            Tanggal berutang
          </label>
          <label className="relative flex items-center px-3.5 py-3.5 rounded-xl bg-white border border-gray-200 cursor-pointer">
            <Calendar className="w-[18px] h-[18px] text-brand-red mr-2.5 shrink-0" />
            <span className="text-[14px] font-medium flex-1">
              {p.formatTanggal(new Date(tanggalStr))}
            </span>
            <span className="text-[12px] text-red-700 font-medium">Ubah</span>
            <input
              type="date"
              max={getTodayIsoKey()}
              value={tanggalStr}
              onChange={(e) => {
                if (e.target.value) setTanggalStr(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        <div>
          <label className="block font-bold text-[13px] mb-1.5">
            Nominal utang
          </label>
          <div className="flex items-center px-3 py-3 rounded-[10px] bg-gray-50 focus-within:ring-2 focus-within:ring-brand-red/30">
            <span className="text-[13px] text-gray-500 mr-1.5">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={nominalText}
              onChange={(e) =>
                setNominalText(e.target.value.replace(/[^0-9]/g, ''))
              }
              placeholder="Contoh: 50000"
              className="w-full bg-transparent text-[13px] placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-[13px] mb-1.5">
            Catatan (opsional)
          </label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: membeli beras dan minyak"
            className="w-full px-3 py-3 rounded-[10px] bg-gray-50 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSimpan}
            className="w-full py-3.5 rounded-xl bg-brand-red text-white font-bold text-[14px] active:scale-[0.99] transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Catatan Utang'}
          </button>
        </div>
      </div>
    </div>
  );
};
