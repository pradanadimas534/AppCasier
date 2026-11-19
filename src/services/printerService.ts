import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  formatHarga,
  formatNomorStruk,
  formatQty,
  formatTanggalJam,
} from '../utils/format';

export interface BluetoothPrinterDevice {
  name: string;
  address: string;
}

export interface PrintableStrukItem {
  nama: string;
  qty: number;
  unit: string;
  harga: number;
}

export interface PrintableStrukData {
  waktu: Date;
  kasir: string;
  items: PrintableStrukItem[];
  total: number;
  bayar: number;
  kembalian: number;
}

interface ThermalPrinterPluginInterface {
  getPairedDevices(): Promise<{ devices: BluetoothPrinterDevice[] }>;
  printBase64(options: { address: string; data: string }): Promise<{ printed: boolean }>;
}

const ThermalPrinter = registerPlugin<ThermalPrinterPluginInterface>('ThermalPrinter');

const STORAGE_PRINTER_KEY = 'kasirku_bt_printer';
const STORAGE_AUTOPRINT_KEY = 'kasirku_bt_autoprint';

// 58mm thermal paper typically fits 32 ASCII characters per line
const LINE_WIDTH = 32;

export function getSavedPrinter(): BluetoothPrinterDevice | null {
  try {
    const raw = localStorage.getItem(STORAGE_PRINTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BluetoothPrinterDevice;
    if (parsed && parsed.address) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function savePrinter(device: BluetoothPrinterDevice | null): void {
  try {
    if (!device) {
      localStorage.removeItem(STORAGE_PRINTER_KEY);
    } else {
      localStorage.setItem(STORAGE_PRINTER_KEY, JSON.stringify(device));
    }
  } catch {
    // ignore storage error
  }
}

export function getAutoPrintEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_AUTOPRINT_KEY);
    // Default true so once user picks a printer, it prints automatically after payment
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setAutoPrintEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_AUTOPRINT_KEY, String(enabled));
  } catch {
    // ignore
  }
}

/**
 * Format left & right aligned row for 58mm thermal paper (32 columns).
 */
export function formatTwoColumnRow(left: string, right: string, width = LINE_WIDTH): string {
  const cleanLeft = sanitizeAscii(left);
  const cleanRight = sanitizeAscii(right);
  const maxLeft = Math.max(1, width - cleanRight.length - 1);
  const trimmedLeft =
    cleanLeft.length > maxLeft ? cleanLeft.slice(0, maxLeft) : cleanLeft;
  const spaces = Math.max(1, width - trimmedLeft.length - cleanRight.length);
  return `${trimmedLeft}${' '.repeat(spaces)}${cleanRight}`;
}

function sanitizeAscii(str: string): string {
  // Replace non-ASCII / emojis so ESC/POS printers don't output garbled symbols
  return str.replace(/[^\x20-\x7E]/g, '').trim();
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Builds standard ESC/POS byte sequence for a 58mm thermal receipt.
 */
export function buildEscPosReceiptBytes(data: PrintableStrukData): Uint8Array {
  const chunks: number[] = [];
  const pushBytes = (...b: number[]) => chunks.push(...b);
  const pushText = (text: string) => {
    const clean = text.replace(/[^\x0A\x20-\x7E]/g, '');
    for (let i = 0; i < clean.length; i++) {
      chunks.push(clean.charCodeAt(i));
    }
  };
  const pushLine = (text = '') => pushText(`${text}\n`);

  const sepEquals = '='.repeat(LINE_WIDTH);
  const sepDash = '-'.repeat(LINE_WIDTH);

  // ESC @ : Initialize printer
  pushBytes(0x1b, 0x40);

  // Center align + Bold + Double height/width for store title
  pushBytes(0x1b, 0x61, 0x01); // Center
  pushBytes(0x1b, 0x45, 0x01); // Bold ON
  pushBytes(0x1d, 0x21, 0x11); // Double width & height
  pushLine('KASIR TOKO');
  pushBytes(0x1d, 0x21, 0x00); // Normal size
  pushBytes(0x1b, 0x45, 0x00); // Bold OFF
  pushLine('Kasir & Operasional');

  // Left align for body
  pushBytes(0x1b, 0x61, 0x00);
  pushLine(sepEquals);
  pushLine(`No   : ${formatNomorStruk(data.waktu)}`);
  pushLine(`Tgl  : ${formatTanggalJam(data.waktu)}`);
  pushLine(`Kasir: ${sanitizeAscii(data.kasir || 'Kasir Toko')}`);
  pushLine(sepDash);

  // Items
  for (const item of data.items) {
    const subtotal = item.qty * item.harga;
    pushLine(sanitizeAscii(item.nama));
    const qtyPrice = `  ${formatQty(item.qty)} ${item.unit} x ${formatHarga(item.harga)}`;
    pushLine(formatTwoColumnRow(qtyPrice, formatHarga(subtotal)));
  }

  pushLine(sepDash);

  // Totals
  pushBytes(0x1b, 0x45, 0x01); // Bold ON
  pushLine(formatTwoColumnRow('TOTAL', formatHarga(data.total)));
  pushBytes(0x1b, 0x45, 0x00); // Bold OFF
  pushLine(formatTwoColumnRow('Bayar', formatHarga(data.bayar)));
  pushLine(formatTwoColumnRow('Kembali', formatHarga(data.kembalian)));

  pushLine(sepEquals);

  // Footer centered
  pushBytes(0x1b, 0x61, 0x01);
  pushLine('Terima kasih telah berbelanja');
  pushLine('');
  pushLine('');
  pushLine('');

  // Reset align left
  pushBytes(0x1b, 0x61, 0x00);

  return new Uint8Array(chunks);
}

export function buildEscPosTestBytes(): Uint8Array {
  return buildEscPosReceiptBytes({
    waktu: new Date(),
    kasir: 'Test Printer',
    items: [
      { nama: 'Tes Cetak Thermal 58mm', qty: 1, unit: 'pcs', harga: 1000 },
    ],
    total: 1000,
    bayar: 1000,
    kembalian: 0,
  });
}

export async function getPairedBluetoothPrinters(): Promise<BluetoothPrinterDevice[]> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Koneksi Bluetooth Printer hanya tersedia di aplikasi Android (.apk).');
  }
  const res = await ThermalPrinter.getPairedDevices();
  return res.devices ?? [];
}

export async function printReceiptToBluetooth(
  data: PrintableStrukData,
  printerOverride?: BluetoothPrinterDevice | null
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Cetak Bluetooth hanya tersedia di aplikasi Android (.apk).');
  }
  const printer = printerOverride ?? getSavedPrinter();
  if (!printer) {
    throw new Error('Printer Bluetooth belum dipilih. Pilih printer di menu Pengaturan Printer.');
  }
  const bytes = buildEscPosReceiptBytes(data);
  const base64 = bytesToBase64(bytes);
  await ThermalPrinter.printBase64({
    address: printer.address,
    data: base64,
  });
}

export async function printTestToBluetooth(
  printerOverride?: BluetoothPrinterDevice | null
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Cetak Bluetooth hanya tersedia di aplikasi Android (.apk).');
  }
  const printer = printerOverride ?? getSavedPrinter();
  if (!printer) {
    throw new Error('Pilih printer Bluetooth terlebih dahulu.');
  }
  const bytes = buildEscPosTestBytes();
  const base64 = bytesToBase64(bytes);
  await ThermalPrinter.printBase64({
    address: printer.address,
    data: base64,
  });
}
