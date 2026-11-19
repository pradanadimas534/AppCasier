import React, { useEffect, useState } from 'react';
import {
  Bluetooth,
  Check,
  Printer,
  RefreshCw,
  X,
} from 'lucide-react';
import { useKasir } from '../context/KasirContext';
import {
  type BluetoothPrinterDevice,
  getAutoPrintEnabled,
  getPairedBluetoothPrinters,
  getSavedPrinter,
  printTestToBluetooth,
  savePrinter,
  setAutoPrintEnabled,
} from '../services/printerService';

export const PrinterSettingsModal: React.FC<{
  onClose: () => void;
  onPrinterSelected?: (device: BluetoothPrinterDevice | null) => void;
}> = ({ onClose, onPrinterSelected }) => {
  const { showToast } = useKasir();
  const [savedPrinter, setSavedPrinterState] = useState<BluetoothPrinterDevice | null>(() =>
    getSavedPrinter()
  );
  const [autoPrint, setAutoPrint] = useState<boolean>(() => getAutoPrintEnabled());
  const [devices, setDevices] = useState<BluetoothPrinterDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDevices = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await getPairedBluetoothPrinters();
      setDevices(list);
      if (list.length === 0) {
        setErrorMsg(
          'Belum ada perangkat Bluetooth yang ter-pair. Pasangkan (Pair) mini thermal printer di Pengaturan Bluetooth HP Anda dulu.'
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleSelect = (device: BluetoothPrinterDevice) => {
    savePrinter(device);
    setSavedPrinterState(device);
    onPrinterSelected?.(device);
    showToast(`Printer "${device.name}" dipilih`, 'success');
  };

  const handleToggleAutoPrint = () => {
    const next = !autoPrint;
    setAutoPrint(next);
    setAutoPrintEnabled(next);
  };

  const handleTestPrint = async () => {
    if (!savedPrinter) {
      showToast('Pilih printer Bluetooth terlebih dahulu', 'warning');
      return;
    }
    setTesting(true);
    try {
      await printTestToBluetooth(savedPrinter);
      showToast('Tes cetak berhasil dikirim ke printer!', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(msg, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-red" />
            <h3 className="font-bold text-[15px] text-app-ink">
              Printer Thermal Bluetooth
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Active Printer */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-[11px] text-app-muted">Printer Aktif</div>
            <div className="font-bold text-[14px] text-app-ink mt-0.5 flex items-center gap-1.5">
              <Bluetooth className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                {savedPrinter ? savedPrinter.name : 'Belum dipilih'}
              </span>
            </div>
            {savedPrinter && (
              <div className="text-[11px] text-gray-500 mt-0.5">
                MAC: {savedPrinter.address}
              </div>
            )}
          </div>

          {/* Auto-print toggle */}
          <div className="p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[13px] text-app-ink">
                Cetak Otomatis setelah Bayar
              </div>
              <div className="text-[11px] text-app-muted">
                Langsung kirim struk ke printer saat pembayaran selesai
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoPrint}
              onClick={handleToggleAutoPrint}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
                autoPrint ? 'bg-brand-red' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  autoPrint ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Paired Devices List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-app-ink">
                Perangkat Bluetooth Ter-pair
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={loadDevices}
                className="text-[12px] font-semibold text-brand-red flex items-center gap-1"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Segarkan</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-[12px] text-brand-red leading-relaxed">
                {errorMsg}
              </div>
            )}

            {!loading && devices.length > 0 && (
              <div className="space-y-1.5">
                {devices.map((dev) => {
                  const selected = savedPrinter?.address === dev.address;
                  return (
                    <button
                      key={dev.address}
                      type="button"
                      onClick={() => handleSelect(dev)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        selected
                          ? 'border-brand-red bg-red-50/60'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-[13px] text-app-ink truncate">
                          {dev.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {dev.address}
                        </div>
                      </div>
                      {selected && (
                        <Check className="w-5 h-5 text-brand-red shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-100 flex items-center gap-2">
          <button
            type="button"
            disabled={!savedPrinter || testing}
            onClick={handleTestPrint}
            className="flex-1 py-2.5 rounded-xl border border-brand-red text-brand-red font-semibold text-[13px] disabled:opacity-40 active:scale-95 transition"
          >
            {testing ? 'Mencetak...' : 'Tes Cetak'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-brand-red text-white font-bold text-[13px] active:scale-95 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
