export interface UtangModel {
  id: number;
  nama: string;
  tanggal: string; // ISO string
  nominal: number;
  totalDibayar: number;
  catatan: string;
  lunas: boolean;
  tanggalLunas: string | null;
}

export function getUtangTotal(u: UtangModel): number {
  return u.nominal;
}

export function getUtangSisa(u: UtangModel): number {
  return Math.max(0, u.nominal - u.totalDibayar);
}

export function parseUtangFromMap(m: Record<string, unknown>, fallbackId = 0): UtangModel {
  // Migrasi ringan: nominal dokumen lama dihitung dari daftar barangnya.
  const barangList = Array.isArray(m.barang) ? m.barang : [];
  const barangLama = barangList.reduce<number>((jumlah, item) => {
    if (item && typeof item === 'object') {
      const data = item as Record<string, unknown>;
      const qty = typeof data.jumlah === 'number' ? data.jumlah : 1;
      const harga = typeof data.harga === 'number' ? data.harga : 0;
      return jumlah + qty * harga;
    }
    return jumlah;
  }, 0);

  const nominal = typeof m.nominal === 'number' ? m.nominal : barangLama;
  const rawLunas = typeof m.lunas === 'boolean' ? m.lunas : false;
  const rawTotalDibayar = typeof m.totalDibayar === 'number'
    ? m.totalDibayar
    : (rawLunas ? nominal : 0);
  const clampedDibayar = Math.min(Math.max(0, rawTotalDibayar), Math.max(0, nominal));
  const lunas = typeof m.lunas === 'boolean' ? m.lunas : clampedDibayar >= nominal;

  const rawId = typeof m.id === 'number' ? Math.trunc(m.id) : fallbackId;
  const tanggalStr = typeof m.tanggal === 'string' && !Number.isNaN(Date.parse(m.tanggal))
    ? m.tanggal
    : new Date().toISOString();
  const tanggalLunasStr = typeof m.tanggalLunas === 'string' && !Number.isNaN(Date.parse(m.tanggalLunas))
    ? m.tanggalLunas
    : null;

  return {
    id: Number.isNaN(rawId) ? 0 : rawId,
    nama: typeof m.nama === 'string' ? m.nama : '',
    tanggal: tanggalStr,
    nominal,
    totalDibayar: clampedDibayar,
    catatan: typeof m.catatan === 'string' ? m.catatan : '',
    lunas,
    tanggalLunas: tanggalLunasStr,
  };
}
