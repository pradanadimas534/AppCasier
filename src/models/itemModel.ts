export type ItemType = 'satuan' | 'timbang';
export type ItemUnit = 'pcs' | 'gram' | 'ons' | 'kg';

export interface ItemModel {
  id: number;
  name: string;
  price: number;
  stock: number;
  sold: number;
  type: ItemType;
  unit: ItemUnit | string;
  barcode: string;
  /** Kalau tidak null: barang ada di "Sampah" sejak tanggal ini (ISO string). */
  deletedAt: string | null;
}

export interface CartItem {
  id: number;
  name: string;
  type: ItemType;
  unit: string;
  price: number;
  qty: number;
}

export function isItemInTrash(item: ItemModel): boolean {
  return item.deletedAt !== null && item.deletedAt !== '';
}

export function parseItemFromFirestore(docId: string, data: Record<string, unknown>): ItemModel {
  const rawId = typeof data.id === 'number' ? Math.trunc(data.id) : parseInt(docId, 10);
  const deletedAtRaw = typeof data.deletedAt === 'string' && data.deletedAt.trim() !== ''
    ? data.deletedAt
    : null;

  return {
    id: Number.isNaN(rawId) ? 0 : rawId,
    name: typeof data.name === 'string' ? data.name : '',
    price: typeof data.price === 'number' ? data.price : Number(data.price ?? 0) || 0,
    stock: typeof data.stock === 'number' ? data.stock : Number(data.stock ?? 0) || 0,
    sold: typeof data.sold === 'number' ? data.sold : Number(data.sold ?? 0) || 0,
    type: data.type === 'timbang' ? 'timbang' : 'satuan',
    unit: typeof data.unit === 'string' && data.unit ? data.unit : 'pcs',
    barcode: typeof data.barcode === 'string' ? data.barcode : '',
    deletedAt: deletedAtRaw,
  };
}
