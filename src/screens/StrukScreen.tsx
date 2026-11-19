import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Printer, Settings, Share2 } from 'lucide-react';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { SuccessCheck } from '../components/SuccessCheck';
import { useKasir } from '../context/KasirContext';
import {
  getAutoPrintEnabled,
  getSavedPrinter,
  printReceiptToBluetooth,
} from '../services/printerService';
import {
  formatHarga,
  formatNomorStruk,
  formatQty,
  formatTanggalJam,
} from '../utils/format';

export interface StrukItem {
  nama: string;
  qty: number;
  unit: string;
  harga: number;
}

export interface StrukData {
  waktu: Date;
  kasir: string;
  items: StrukItem[];
  total: number;
  bayar: number;
  kembalian: number;
}

export const StrukScreen: React.FC<{
  data: StrukData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const { showToast } = useKasir();
  const nomor = formatNomorStruk(data.waktu);
  const [printing, setPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<string>('');
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const autoPrintedRef = useRef(false);

  const handlePrint = async (isAuto = false) => {
    const saved = getSavedPrinter();
    if (!saved) {
      if (!isAuto) {
        setShowPrinterModal(true);
      }
      return;
    }

    setPrinting(true);
    setPrintStatus(`Mencetak ke ${saved.name}...`);
    try {
      await printReceiptToBluetooth(data, saved);
      setPrintStatus(`Tercetak di ${saved.name}`);
      showToast('Struk berhasil dicetak ke printer thermal!', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setPrintStatus(`Gagal cetak: ${msg}`);
      showToast(msg, 'error');
    } finally {
      setPrinting(false);
    }
  };

  // Otomatis cetak ke mini thermal printer Bluetooth begitu transaksi selesai
  useEffect(() => {
    if (autoPrintedRef.current) return;
    autoPrintedRef.current = true;
    if (Capacitor.isNativePlatform() && getAutoPrintEnabled() && getSavedPrinter()) {
      handlePrint(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildTeksStruk = (): string => {
    const lines: string[] = [
      'KASIR TOKO',
      'Kasir & Operasional',
      '=========================',
      `No   : ${nomor}`,
      `Tgl  : ${formatTanggalJam(data.waktu)}`,
      `Kasir: ${data.kasir}`,
      '-------------------------',
    ];
    for (const it of data.items) {
      const subtotal = it.qty * it.harga;
      lines.push(it.nama);
      lines.push(
        `  ${formatQty(it.qty)} ${it.unit} x ${formatHarga(it.harga)}  =  ${formatHarga(
          subtotal
        )}`
      );
    }
    lines.push(
      '-------------------------',
      `TOTAL   : ${formatHarga(data.total)}`,
      `BAYAR   : ${formatHarga(data.bayar)}`,
      `KEMBALI : ${formatHarga(data.kembalian)}`,
      '=========================',
      'Terima kasih telah berbelanja'
    );
    return lines.join('\n');
  };

  const handleShare = async () => {
    const text = buildTeksStruk();
    try {
      await Share.share({
        title: 'Struk Kasir Toko',
        text,
        dialogTitle: 'Bagikan Struk',
      });
    } catch {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Struk Kasir Toko', text });
          return;
        } catch {
          // user cancelled
        }
      }
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto px-5 pt-7 pb-5">
        <div className="flex justify-center">
          <SuccessCheck size={100} />
        </div>
        <h1 className="text-center font-poppins font-bold text-[20px] text-app-ink mt-3.5">
          Pembayaran Berhasil
        </h1>
        {data.kembalian > 0 && (
          <p className="text-center text-[13px] text-app-muted mt-1">
            Kembalian {formatHarga(data.kembalian)}
          </p>
        )}

        {/* Status Cetak Thermal Printer */}
        {printStatus && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-center text-[12px] font-medium text-app-inkSoft">
            {printStatus}
          </div>
        )}

        {/* Kertas Struk */}
        <div className="mt-5 bg-white rounded-2xl shadow-soft border border-app-line px-[18px] pt-5 pb-[22px]">
          <div className="text-center font-lobster text-[30px] text-brand-red leading-tight">
            Kasir Toko
          </div>
          <div className="text-center font-inter text-[11px] text-app-muted">
            Kasir &amp; Operasional
          </div>

          <DashedLine />

          <InfoRow label="No" value={nomor} />
          <InfoRow label="Tanggal" value={formatTanggalJam(data.waktu)} />
          <InfoRow label="Kasir" value={data.kasir} />

          <DashedLine />

          <div className="space-y-2">
            {data.items.map((it, idx) => (
              <div key={idx}>
                <div className="text-[13px] font-semibold text-app-ink">
                  {it.nama}
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-app-muted pl-2">
                    {formatQty(it.qty)} {it.unit} x {formatHarga(it.harga)}
                  </span>
                  <span className="font-semibold text-app-ink">
                    {formatHarga(it.qty * it.harga)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <DashedLine />

          <TotalRow label="TOTAL" value={formatHarga(data.total)} bold />
          <TotalRow label="Bayar" value={formatHarga(data.bayar)} />
          <TotalRow label="Kembali" value={formatHarga(data.kembalian)} />

          <DashedLine />

          <p className="text-center text-[12px] text-app-inkSoft">
            Terima kasih telah berbelanja 🙏
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white px-4 pt-2.5 pb-4 shadow-[0_-3px_12px_rgba(0,0,0,0.06)] space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={printing}
            onClick={() => handlePrint(false)}
            className="flex-1 py-3 rounded-[14px] bg-app-ink text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{printing ? 'Mencetak...' : 'Cetak Struk'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrinterModal(true)}
            title="Atur Printer Bluetooth"
            className="p-3 rounded-[14px] border border-gray-300 text-app-inkSoft hover:bg-gray-50 active:scale-95 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-3 rounded-[14px] border border-app-ink text-app-ink font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>WA</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-[14px] bg-brand-red text-white font-bold text-[14px] active:scale-95 transition"
        >
          Selesai
        </button>
      </div>

      {showPrinterModal && (
        <PrinterSettingsModal
          onClose={() => setShowPrinterModal(false)}
          onPrinterSelected={(dev) => {
            if (dev) {
              setPrintStatus(`Printer terpilih: ${dev.name}`);
            }
          }}
        />
      )}
    </div>
  );
};

const DashedLine: React.FC = () => (
  <div className="my-2.5 border-b border-dashed border-app-line" />
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center text-[12px] py-0.5">
    <span className="w-[66px] text-app-muted shrink-0">{label}</span>
    <span className="text-app-muted mr-1">:</span>
    <span className="text-app-ink truncate">{value}</span>
  </div>
);

const TotalRow: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold = false,
}) => (
  <div className="flex items-center justify-between py-0.5">
    <span
      className={
        bold ? 'text-[15px] font-bold text-app-ink' : 'text-[13px] font-medium text-app-ink'
      }
    >
      {label}
    </span>
    <span
      className={
        bold
          ? 'text-[16px] font-bold text-brand-red'
          : 'text-[13px] font-semibold text-app-ink'
      }
    >
      {value}
    </span>
  </div>
);
