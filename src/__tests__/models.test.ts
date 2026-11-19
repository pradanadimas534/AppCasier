import { describe, expect, it } from 'vitest';
import { isItemInTrash, parseItemFromFirestore } from '../models/itemModel';
import { getUtangSisa, getUtangTotal, parseUtangFromMap } from '../models/utangModel';
import { compareSemver, isNewerVersion, sanitizeReleaseNotes } from '../services/updateService';
import { formatHarga, formatNomorStruk, formatQty, formatTanggal } from '../utils/format';

describe('ItemModel & UtangModel migration & formatters', () => {
  it('parses ItemModel from Firestore document correctly', () => {
    const item = parseItemFromFirestore('7', {
      name: 'Indomie Goreng',
      price: 3500,
      stock: 20,
      sold: 4,
      type: 'satuan',
      unit: 'pcs',
      barcode: '8998866200011',
    });
    expect(item.id).toBe(7);
    expect(item.name).toBe('Indomie Goreng');
    expect(item.price).toBe(3500);
    expect(isItemInTrash(item)).toBe(false);
  });

  it('migrates legacy UtangModel documents that used barang list', () => {
    const utang = parseUtangFromMap({
      id: 3,
      nama: 'Bu Sri',
      tanggal: '2026-05-10T00:00:00.000Z',
      barang: [
        { jumlah: 2, harga: 15000 },
        { jumlah: 1, harga: 20000 },
      ],
      totalDibayar: 10000,
    });
    expect(getUtangTotal(utang)).toBe(50000);
    expect(getUtangSisa(utang)).toBe(40000);
    expect(utang.lunas).toBe(false);
  });

  it('formats Rupiah, quantity, date, and receipt number matching Flutter', () => {
    expect(formatHarga(15000)).toBe('Rp 15.000');
    expect(formatQty(3)).toBe('3');
    expect(formatQty(1.5)).toBe('1.50');
    const date = new Date(2026, 4, 9, 14, 5, 8); // 9 Mei 2026 14:05:08
    expect(formatTanggal(date)).toBe('9 Mei 2026');
    expect(formatNomorStruk(date)).toBe('260509-140508');
  });

  it('compares app semantic versions and build numbers for OTA update detection', () => {
    expect(compareSemver('1.0.1', '1.0.0')).toBe(1);
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(isNewerVersion('1.0.0', 2, '1.0.0', 1)).toBe(true);
    expect(isNewerVersion('1.0.0', 1, '1.0.0', 1)).toBe(false);
    expect(isNewerVersion('1.1.0', 1, '1.0.5', 9)).toBe(true);
    const cleaned = sanitizeReleaseNotes(
      '*Full Changelog**: https://github.com/pradanadimas534/Kasir-Flutter/compare/build-24...build-25',
      ['Pembaruan instan 1-klik']
    );
    expect(cleaned).toEqual(['Pembaruan instan 1-klik']);
  });
});
