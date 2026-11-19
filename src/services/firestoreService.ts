import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { type ItemModel, parseItemFromFirestore } from '../models/itemModel';
import { type UtangModel, parseUtangFromMap } from '../models/utangModel';
import { getTodayIsoKey } from '../utils/format';
import { db } from './firebase';

export interface BarangTerjualHariIni {
  id?: number | string;
  nama: string;
  jumlah: number;
  satuan: string;
  total: number;
}

export interface RiwayatPendapatanItem {
  tanggal: string;
  total: number;
  transaksi: number;
}

class FirestoreService {
  // ── ITEMS ────────────────────────────────────────────────────────
  private itemsCol(uid: string) {
    return collection(db, 'users', uid, 'items');
  }

  private itemData(item: ItemModel) {
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      sold: item.sold,
      type: item.type,
      unit: item.unit,
      barcode: item.barcode,
      deletedAt: item.deletedAt ?? null,
      updatedAt: serverTimestamp(),
    };
  }

  async getItems(uid: string): Promise<ItemModel[]> {
    const snap = await getDocs(this.itemsCol(uid));
    const items = snap.docs.map((d) =>
      parseItemFromFirestore(d.id, d.data() as Record<string, unknown>)
    );
    items.sort((a, b) => a.id - b.id);
    return items;
  }

  async addItem(uid: string, item: Omit<ItemModel, 'id'>): Promise<ItemModel[]> {
    const existingItems = await this.getItems(uid);
    const nextId =
      existingItems.length === 0
        ? 1
        : existingItems.reduce((highest, cur) => (cur.id > highest ? cur.id : highest), 0) + 1;
    const newItem: ItemModel = { ...item, id: nextId };
    await setDoc(doc(db, 'users', uid, 'items', String(nextId)), this.itemData(newItem));
    return this.getItems(uid);
  }

  async updateItem(uid: string, item: ItemModel): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'items', String(item.id)), this.itemData(item));
  }

  async deleteItem(uid: string, id: number): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'items', String(id)));
  }

  // ── CATATAN UTANG ───────────────────────────────────────────────
  private utangCol(uid: string) {
    return collection(db, 'users', uid, 'utang');
  }

  async getUtang(uid: string): Promise<UtangModel[]> {
    const snap = await getDocs(this.utangCol(uid));
    const list = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      const fallbackId = parseInt(d.id, 10) || 0;
      return parseUtangFromMap(data, fallbackId);
    });
    // Utang belum lunas dulu, lalu urutkan dari yang terbaru.
    list.sort((a, b) => {
      if (a.lunas !== b.lunas) return a.lunas ? 1 : -1;
      return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    });
    return list;
  }

  async addUtang(uid: string, utang: Omit<UtangModel, 'id'>): Promise<UtangModel[]> {
    const existing = await this.getUtang(uid);
    const nextId =
      existing.length === 0
        ? 1
        : existing.reduce((highest, cur) => (cur.id > highest ? cur.id : highest), 0) + 1;
    const baru: UtangModel = { ...utang, id: nextId };
    await setDoc(doc(db, 'users', uid, 'utang', String(nextId)), {
      id: baru.id,
      nama: baru.nama,
      tanggal: baru.tanggal,
      nominal: baru.nominal,
      totalDibayar: baru.totalDibayar,
      catatan: baru.catatan,
      lunas: baru.lunas,
      tanggalLunas: baru.tanggalLunas,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getUtang(uid);
  }

  async updateUtang(uid: string, utang: UtangModel): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'utang', String(utang.id)), {
      id: utang.id,
      nama: utang.nama,
      tanggal: utang.tanggal,
      nominal: utang.nominal,
      totalDibayar: utang.totalDibayar,
      catatan: utang.catatan,
      lunas: utang.lunas,
      tanggalLunas: utang.tanggalLunas,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteUtang(uid: string, id: number): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'utang', String(id)));
  }

  // ── USER REGISTRATION ────────────────────────────────────────────
  async registerUser(params: { uid: string; nama: string; email: string }): Promise<void> {
    await setDoc(
      doc(db, 'users', params.uid),
      {
        uid: params.uid,
        nama: params.nama,
        email: params.email,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async isUserRegistered(uid: string): Promise<boolean> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists();
  }

  // ── PENDAPATAN HARIAN ────────────────────────────────────────────
  async tambahPendapatan(params: {
    uid: string;
    total: number;
    barang: BarangTerjualHariIni[];
  }): Promise<void> {
    const tanggal = getTodayIsoKey();
    const ref = doc(db, 'users', params.uid, 'pendapatan', tanggal);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists()) {
        const data = snap.data() as Record<string, unknown>;
        const barangHariIni: Record<string, Record<string, unknown>> = {
          ...((data.barang as Record<string, Record<string, unknown>>) ?? {}),
        };
        for (const item of params.barang) {
          const id = String(item.id ?? item.nama);
          const lama = barangHariIni[id] ?? {};
          barangHariIni[id] = {
            nama: item.nama,
            jumlah: (Number(lama.jumlah) || 0) + Number(item.jumlah),
            total: (Number(lama.total) || 0) + Number(item.total),
            satuan: item.satuan,
          };
        }
        tx.update(ref, {
          total: increment(params.total),
          transaksi: increment(1),
          barang: barangHariIni,
          updatedAt: serverTimestamp(),
        });
      } else {
        const barangHariIni: Record<string, Record<string, unknown>> = {};
        for (const item of params.barang) {
          const id = String(item.id ?? item.nama);
          barangHariIni[id] = {
            nama: item.nama,
            jumlah: item.jumlah,
            total: item.total,
            satuan: item.satuan,
          };
        }
        tx.set(ref, {
          tanggal,
          total: params.total,
          transaksi: 1,
          barang: barangHariIni,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
  }

  async getPendapatanHariIni(uid: string): Promise<{
    total: number;
    transaksi: number;
    barang: BarangTerjualHariIni[];
  }> {
    try {
      const tanggal = getTodayIsoKey();
      const snap = await getDoc(doc(db, 'users', uid, 'pendapatan', tanggal));
      if (!snap.exists()) {
        return { total: 0, transaksi: 0, barang: [] };
      }
      const data = snap.data() as Record<string, unknown>;
      const barangMap = (data.barang as Record<string, Record<string, unknown>>) ?? {};
      const barang: BarangTerjualHariIni[] = Object.values(barangMap).map((b) => ({
        nama: typeof b.nama === 'string' ? b.nama : '-',
        jumlah: Number(b.jumlah) || 0,
        total: Number(b.total) || 0,
        satuan: typeof b.satuan === 'string' ? b.satuan : 'pcs',
      }));
      return {
        total: Number(data.total) || 0,
        transaksi: Math.trunc(Number(data.transaksi) || 0),
        barang,
      };
    } catch {
      return { total: 0, transaksi: 0, barang: [] };
    }
  }

  async getRiwayatPendapatan(uid: string): Promise<RiwayatPendapatanItem[]> {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'pendapatan'));
      const result: RiwayatPendapatanItem[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          tanggal: typeof data.tanggal === 'string' ? data.tanggal : d.id,
          total: Number(data.total) || 0,
          transaksi: Math.trunc(Number(data.transaksi) || 0),
        };
      });
      result.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
      return result;
    } catch {
      return [];
    }
  }
}

export const firestoreService = new FirestoreService();
