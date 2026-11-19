import React, { useEffect } from 'react';
import {
  Calendar,
  LineChart,
  Menu,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useKasir } from '../context/KasirContext';
import { getTodayIsoKey } from '../utils/format';

interface HariStat {
  tanggal: Date;
  key: string;
  transaksi: number;
  total: number;
}

const NAMA_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const LaporanScreen: React.FC<{
  onOpenDrawer: () => void;
}> = ({ onOpenDrawer }) => {
  const p = useKasir();

  useEffect(() => {
    p.loadRiwayatPendapatan();
  }, [p.loadRiwayatPendapatan]);

  // 7 hari terakhir
  const now = new Date();
  const awalHariIni = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hariList: HariStat[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(awalHariIni);
    d.setDate(d.getDate() - (6 - i));
    const key = getTodayIsoKey(d);
    const matching = p.riwayatPendapatan.filter((r) => r.tanggal === key);
    return {
      tanggal: d,
      key,
      transaksi: matching.reduce((s, r) => s + r.transaksi, 0),
      total: matching.reduce((s, r) => s + r.total, 0),
    };
  });

  const kemarin = hariList[hariList.length - 2];
  const hariIni = hariList[hariList.length - 1];
  const rataRata =
    hariList.slice(0, 6).reduce((sum, h) => sum + h.transaksi, 0) / 6;
  const naik = hariIni.transaksi >= kemarin.transaksi;
  const ramai = hariIni.transaksi > 0 && hariIni.transaksi >= rataRata;

  const sortedBarang = [...p.barangTerjualHariIni].sort(
    (a, b) => (b.total ?? 0) - (a.total ?? 0)
  );

  const maxTransaksi = Math.max(...hariList.map((d) => d.transaksi), 1);
  const allZero = hariList.every((d) => d.transaksi === 0);

  return (
    <div className="h-full overflow-y-auto px-4 pt-2 pb-[100px]">
      {/* Header */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Buka Menu"
          className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
        >
          <Menu className="w-7 h-7 text-brand-red" />
        </button>
        <h1 className="flex-1 font-poppins font-bold text-[20px] text-app-ink">
          Laporan
        </h1>
        <button
          type="button"
          onClick={() => p.loadRiwayatPendapatan(true)}
          title="Muat ulang laporan"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <RefreshCw
            className={`w-5 h-5 ${p.laporanLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <h2 className="text-[22px] font-bold text-app-ink mt-2.5">
        Penjualan hari ini
      </h2>
      <p className="text-[13px] text-gray-600 mt-1">
        Lihat hasil jualan dan tingkat keramaian toko.
      </p>

      {/* Hari Ini Card */}
      <div className="mt-4 p-[18px] rounded-[18px] bg-brand-red text-white">
        <div className="flex items-center gap-2 text-white/75 text-[12px] font-bold">
          <Calendar className="w-4 h-4" />
          <span>PENJUALAN HARI INI</span>
        </div>
        <div className="text-[28px] font-bold mt-2.5 leading-tight">
          {p.formatHarga(p.pendapatanHariIni)}
        </div>
        <div className="text-[13px] text-white/80 mt-1">
          {p.transaksiHariIni} transaksi berhasil
        </div>
      </div>

      {/* Barang yang terjual hari ini */}
      <h3 className="text-[16px] font-bold text-app-ink mt-5 mb-2.5">
        Barang yang terjual hari ini
      </h3>
      {sortedBarang.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border border-gray-100 flex flex-col items-center text-gray-500">
          <ShoppingBag className="w-9 h-9 text-gray-400 mb-2" />
          <span className="text-[13px]">Belum ada barang terjual hari ini</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {sortedBarang.map((b, i) => (
            <div key={i} className="p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-red-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-app-ink truncate">
                  {b.nama || '-'}
                </div>
                <div className="text-[12px] text-gray-500">
                  {p.formatQty(Number(b.jumlah) || 0)} {b.satuan || 'pcs'}
                </div>
              </div>
              <div className="font-bold text-[14px] text-app-ink">
                {p.formatHarga(Number(b.total) || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ramai atau sepi? */}
      <h3 className="text-[16px] font-bold text-app-ink mt-5 mb-2.5">
        Ramai atau sepi?
      </h3>
      <div
        className={`p-4 rounded-2xl flex items-center gap-3 ${
          ramai ? 'bg-green-500/10' : 'bg-orange-500/10'
        }`}
      >
        {naik ? (
          <TrendingUp
            className={`w-8 h-8 shrink-0 ${
              ramai ? 'text-green-600' : 'text-orange-700'
            }`}
          />
        ) : (
          <TrendingDown
            className={`w-8 h-8 shrink-0 ${
              ramai ? 'text-green-600' : 'text-orange-700'
            }`}
          />
        )}
        <div>
          <div
            className={`font-bold text-[16px] ${
              ramai ? 'text-green-600' : 'text-orange-700'
            }`}
          >
            {hariIni.transaksi === 0
              ? 'Belum ada transaksi'
              : ramai
              ? 'Toko sedang ramai'
              : 'Toko cenderung sepi'}
          </div>
          <p className="text-[12px] text-gray-700 mt-0.5">
            {hariIni.transaksi - kemarin.transaksi === 0
              ? 'Sama dengan kemarin'
              : `${naik ? 'Naik' : 'Turun'} ${Math.abs(
                  hariIni.transaksi - kemarin.transaksi
                )} transaksi dari kemarin`}
            . Rata-rata 6 hari terakhir: {rataRata.toFixed(1)} transaksi.
          </p>
        </div>
      </div>

      {/* Grafik transaksi 7 hari terakhir */}
      <h3 className="text-[16px] font-bold text-app-ink mt-5">
        Grafik transaksi 7 hari terakhir
      </h3>
      <p className="text-[12px] text-gray-600 mt-0.5 mb-2.5">
        Jumlah transaksi per hari
      </p>

      {p.laporanLoading ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-3 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
        </div>
      ) : allZero ? (
        <div className="p-6 rounded-2xl bg-white border border-gray-100 flex flex-col items-center text-gray-500">
          <LineChart className="w-9 h-9 text-gray-400 mb-2" />
          <span className="text-[13px]">
            Belum ada data transaksi untuk grafik
          </span>
        </div>
      ) : (
        <div className="h-[220px] p-4 rounded-2xl bg-white border border-gray-100 flex flex-col">
          <div className="flex-1 flex items-end gap-2">
            {hariList.map((h, idx) => {
              const isLast = idx === hariList.length - 1;
              const heightPct = Math.max(
                4,
                Math.round((h.transaksi / maxTransaksi) * 100)
              );
              return (
                <div
                  key={h.key}
                  className="flex-1 h-full flex flex-col items-center justify-end"
                >
                  <span className="text-[11px] font-bold mb-1">
                    {h.transaksi}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      style={{ height: `${h.transaksi === 0 ? 2 : heightPct}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isLast ? 'bg-brand-red' : 'bg-red-200'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {hariList.map((h) => (
              <div
                key={h.key}
                className="flex-1 text-center text-[10px] text-gray-600"
              >
                {NAMA_HARI[h.tanggal.getDay()]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
