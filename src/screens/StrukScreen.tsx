import React from 'react';
import { Share } from '@capacitor/share';
import { Share2 } from 'lucide-react';
import { SuccessCheck } from '../components/SuccessCheck';
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
  const nomor = formatNomorStruk(data.waktu);

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
      // Fallback Web / WhatsApp or clipboard
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
      <div className="bg-white px-4 pt-2.5 pb-4 shadow-[0_-3px_12px_rgba(0,0,0,0.06)] flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-3.5 rounded-[14px] border border-app-ink text-app-ink font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 rounded-[14px] bg-brand-red text-white font-bold text-[14px] active:scale-95 transition"
        >
          Selesai
        </button>
      </div>
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
