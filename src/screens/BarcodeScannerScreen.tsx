import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flashlight,
  Minus,
  MinusCircle,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { useKasir } from '../context/KasirContext';

export type ScanMode = 'field' | 'cart' | 'count';

export const BarcodeScannerScreen: React.FC<{
  mode: ScanMode;
  onClose: () => void;
  onFieldResult?: (barcode: string) => void;
  onCountResult?: (res: { barcode: string; count: number }) => void;
}> = ({ mode, onClose, onFieldResult, onCountResult }) => {
  const p = useKasir();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedFieldRef = useRef(false);
  const lastSeenRef = useRef<Record<string, number>>({});
  const candidateRef = useRef<{ code: string; hits: number; time: number }>({
    code: '',
    hits: 0,
    time: 0,
  });

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');

  // Count mode state
  const [countBarcode, setCountBarcode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const countBarcodeRef = useRef<string | null>(null);
  const countRef = useRef(0);

  // Cart bar state
  const [cartExpanded, setCartExpanded] = useState(false);

  // Flash message banner
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const [flashColor, setFlashColor] = useState<'success' | 'warning' | 'danger'>('success');
  const flashTimerRef = useRef<number | null>(null);

  const showFlash = (msg: string, color: 'success' | 'warning' | 'danger') => {
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    setFlashMsg(msg);
    setFlashColor(color);
    flashTimerRef.current = window.setTimeout(() => {
      setFlashMsg(null);
    }, 1400);
  };

  const cooldownHit = (value: string): boolean => {
    const now = Date.now();
    const last = lastSeenRef.current[value];
    if (last && now - last < 1600) return true;
    lastSeenRef.current[value] = now;
    return false;
  };

  const processBarcodeValue = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;

    if (mode === 'field') {
      if (hasScannedFieldRef.current) return;
      hasScannedFieldRef.current = true;
      onFieldResult?.(value);
      onClose();
      return;
    }

    if (mode === 'cart') {
      if (cooldownHit(value)) return;
      const item = p.cariBarangDariBarcode(value);
      if (!item) {
        showFlash(`Barcode ${value} belum terdaftar`, 'warning');
        return;
      }
      if (item.stock <= 0) {
        showFlash(`${item.name} sedang habis`, 'danger');
        return;
      }
      p.tambahKeCart(item, 1);
      showFlash(
        item.type === 'timbang'
          ? `${item.name} +1 ${item.unit} — atur di keranjang`
          : `${item.name} +1`,
        'success'
      );
      return;
    }

    if (mode === 'count') {
      if (cooldownHit(value)) return;
      if (countBarcodeRef.current === null) {
        countBarcodeRef.current = value;
        countRef.current = 1;
        setCountBarcode(value);
        setCount(1);
        showFlash('Barcode terkunci · jumlah 1', 'success');
        return;
      }
      if (value !== countBarcodeRef.current) {
        showFlash('Barcode berbeda — scan produk yang sama', 'warning');
        return;
      }
      countRef.current += 1;
      setCount(countRef.current);
      showFlash(`Jumlah: ${countRef.current}`, 'success');
    }
  };

  useEffect(() => {
    let mounted = true;
    const containerId = 'kasir-qr-reader';
    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;
    setCameraError('');

    html5QrCode
      .start(
        { facingMode },
        {
          fps: 12,
          qrbox: { width: 260, height: 160 },
        },
        (decodedText) => {
          if (!mounted) return;
          const now = Date.now();
          if (
            candidateRef.current.code === decodedText &&
            now - candidateRef.current.time <= 900
          ) {
            candidateRef.current.hits += 1;
          } else {
            candidateRef.current = { code: decodedText, hits: 1, time: now };
          }
          candidateRef.current.time = now;
          if (candidateRef.current.hits < 2) return;
          processBarcodeValue(decodedText);
        },
        () => {}
      )
      .catch((err: unknown) => {
        if (!mounted) return;
        setCameraError(
          `Kamera tidak dapat diakses (${String(err)}). Anda juga bisa mengetik kode manual di bawah.`
        );
      });

    return () => {
      mounted = false;
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleTorch = async () => {
    try {
      const next = !torchOn;
      await scannerRef.current?.applyVideoConstraints({
        // @ts-expect-error torch constraint is supported on mobile Chrome/WebView
        advanced: [{ torch: next }],
      });
      setTorchOn(next);
    } catch {
      showFlash('Lampu flash tidak didukung di kamera ini', 'warning');
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const stepCount = (delta: number) => {
    const next = Math.max(0, Math.min(100000, count + delta));
    countRef.current = next;
    setCount(next);
    if (next === 0) {
      countBarcodeRef.current = null;
      setCountBarcode(null);
    }
  };

  const title =
    mode === 'cart'
      ? 'Scan ke keranjang'
      : mode === 'count'
      ? 'Scan jumlah stok'
      : 'Scan barcode barang';

  const totalCartItems = p.cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col max-w-md mx-auto">
      {/* AppBar */}
      <header className="h-14 bg-black px-2 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Scanner"
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-poppins font-semibold text-[17px]">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTorch}
            title="Nyalakan lampu"
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Flashlight className="w-5 h-5 text-white" />
          </button>
          <button
            type="button"
            onClick={switchCamera}
            title="Ganti kamera"
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Camera Viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        <div id="kasir-qr-reader" className="w-full h-full object-cover" />

        {/* Frame overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[260px] h-[160px] border-[3px] border-white rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>

        {/* Flash message banner */}
        {flashMsg && (
          <div
            className={`absolute top-4 left-5 right-5 z-30 px-4 py-3 rounded-[14px] flex items-center gap-2 shadow-lg ${
              flashColor === 'success'
                ? 'bg-app-success'
                : flashColor === 'warning'
                ? 'bg-amber-500'
                : 'bg-brand-red'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span className="text-[13px] font-semibold text-white">
              {flashMsg}
            </span>
          </div>
        )}

        {/* Camera Error + Manual Fallback Input */}
        {cameraError && (
          <div className="absolute inset-x-5 top-16 z-30 bg-black/85 border border-white/20 rounded-2xl p-4 text-center space-y-3">
            <p className="text-[12px] text-white/80">{cameraError}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Masukkan barcode manual..."
                className="flex-1 px-3 py-2 rounded-xl bg-white text-app-ink text-[13px]"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualCode.trim()) {
                    processBarcodeValue(manualCode.trim());
                    setManualCode('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-brand-red text-white text-[13px] font-bold"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {mode === 'field' && (
          <p className="absolute bottom-12 inset-x-6 text-center text-[15px] text-white z-20 pointer-events-none">
            Arahkan kamera ke barcode pada kemasan barang
          </p>
        )}
      </div>

      {/* Mode Cart Bottom Bar */}
      {mode === 'cart' && (
        <div className="bg-white text-app-ink rounded-t-[22px] shadow-[0_-4px_16px_rgba(0,0,0,0.45)] z-30">
          {cartExpanded && p.cart.length > 0 && (
            <div className="max-h-[220px] overflow-y-auto px-4 pt-3.5 pb-1 divide-y divide-gray-100">
              {p.cart.map((c) => (
                <div key={c.id} className="py-2 flex items-center gap-2">
                  <span className="flex-1 font-semibold text-[13px] truncate">
                    {c.name}
                  </span>
                  <span className="text-[12px] text-app-muted">
                    {p.formatQty(c.qty)} {c.unit}
                  </span>
                  <span className="font-bold text-[13px] ml-2">
                    {p.formatHarga(c.price * c.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => p.hapusCartItem(c.id)}
                    className="p-1 text-red-400"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              disabled={p.cart.length === 0}
              onClick={() => setCartExpanded((e) => !e)}
              className="flex items-center gap-2 text-left"
            >
              <ShoppingCart className="w-5 h-5 text-brand-red" />
              <div>
                <div className="text-[12px] font-semibold">
                  {p.formatQty(totalCartItems)} barang
                </div>
                <div className="text-[16px] font-bold text-brand-red">
                  {p.formatHarga(p.total)}
                </div>
              </div>
              {p.cart.length > 0 &&
                (cartExpanded ? (
                  <ChevronDown className="w-5 h-5 text-app-muted" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-app-muted" />
                ))}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-[14px] bg-brand-red text-white font-bold text-[14px]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Mode Count Bottom Bar */}
      {mode === 'count' && (
        <div className="bg-white text-app-ink rounded-t-[22px] shadow-[0_-4px_16px_rgba(0,0,0,0.45)] px-4 pt-3.5 pb-3 z-30">
          <div className="text-[12px] text-app-muted truncate">
            {countBarcode === null
              ? 'Scan barcode produk untuk mulai menghitung'
              : `Barcode: ${countBarcode}`}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="font-semibold text-[14px]">Stok awal</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepCount(-1)}
                className="p-1.5 rounded-lg bg-app-surface text-app-ink"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 text-center font-bold text-[22px]">
                {count}
              </span>
              <button
                type="button"
                onClick={() => stepCount(1)}
                className="p-1.5 rounded-lg bg-app-surface text-app-ink"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (countBarcode && count > 0) {
                onCountResult?.({ barcode: countBarcode, count });
              }
              onClose();
            }}
            className="mt-3 w-full py-3.5 rounded-[14px] bg-brand-red text-white font-bold text-[14px]"
          >
            {count > 0 ? `Selesai · ${count} pcs` : 'Selesai'}
          </button>
        </div>
      )}
    </div>
  );
};
