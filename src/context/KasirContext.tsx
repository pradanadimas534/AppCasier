import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem, ItemModel, ItemType } from '../models/itemModel';
import { getUtangSisa, getUtangTotal, type UtangModel } from '../models/utangModel';
import { authService } from '../services/authService';
import {
  type BarangTerjualHariIni,
  firestoreService,
  type RiwayatPendapatanItem,
} from '../services/firestoreService';
import { formatHarga, formatQty, formatTanggal } from '../utils/format';

export const UMUR_SAMPAH_HARI = 30;

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export interface KasirContextValue {
  // State
  items: ItemModel[];
  trashItems: ItemModel[];
  cart: CartItem[];
  utangList: UtangModel[];
  isLoading: boolean;
  authChecked: boolean;
  isLoggedIn: boolean;
  status: string;
  loginError: string;
  pendapatanHariIni: number;
  transaksiHariIni: number;
  barangTerjualHariIni: BarangTerjualHariIni[];
  riwayatPendapatan: RiwayatPendapatanItem[];
  laporanLoading: boolean;

  // User info
  uid: string;
  userName: string;
  userEmail: string;
  userPhoto: string;

  // Toast
  toast: ToastMessage | null;
  showToast: (
    text: string,
    type?: ToastMessage['type'],
    action?: { label: string; onClick: () => void }
  ) => void;
  dismissToast: () => void;

  // Formatters & Helpers
  formatHarga: (v: number) => string;
  formatQty: (qty: number) => string;
  formatStock: (item: ItemModel) => string;
  formatTanggal: (isoOrDate: string | Date) => string;
  getThreshold: (item: ItemModel) => number;
  getStatus: (item: ItemModel) => 'Habis' | 'Menipis' | 'Aman';
  sisaHariSampah: (item: ItemModel) => number;

  // Auth Actions
  login: () => Promise<boolean>;
  logout: () => Promise<void>;

  // Cart Actions
  tambahKeCart: (item: ItemModel, qty?: number) => boolean;
  cariBarangDariBarcode: (barcode: string) => ItemModel | null;
  kurangiQty: (id: number) => void;
  hapusCartItem: (id: number) => void;
  clearCart: () => void;
  total: number;
  prosesBayar: (bayar: number) => Promise<void>;

  // Item Management
  addItem: (params: {
    name: string;
    price: number;
    stock: number;
    type: ItemType;
    unit: string;
    barcode?: string;
  }) => Promise<void>;
  hapusItem: (id: number) => Promise<void>;
  pulihkanItem: (id: number) => Promise<void>;
  hapusPermanenItem: (id: number) => Promise<void>;
  kosongkanSampah: () => Promise<void>;
  ubahStok: (id: number, value: number) => Promise<void>;
  tambahStok: (id: number, jumlah: number) => Promise<void>;
  ubahBarcode: (id: number, barcode: string) => Promise<void>;
  ubahHarga: (id: number, value: number) => Promise<void>;

  // Utang Management
  utangBelumLunas: UtangModel[];
  totalUtangBelumLunas: number;
  jumlahUtangBelumLunas: number;
  cariUtang: (id: number) => UtangModel | null;
  tambahUtang: (params: {
    nama: string;
    tanggal: Date;
    nominal: number;
    catatan?: string;
  }) => Promise<void>;
  hapusUtang: (id: number) => Promise<void>;
  bayarUtang: (id: number, nominalBayar: number) => Promise<void>;

  // Laporan & Stats
  loadRiwayatPendapatan: (force?: boolean) => Promise<void>;
  totalBarang: number;
  stokMenipis: number;
  stokHabis: number;
}

const KasirContext = createContext<KasirContextValue | null>(null);

export const KasirProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ItemModel[]>([]);
  const [trashItems, setTrashItems] = useState<ItemModel[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [utangList, setUtangList] = useState<UtangModel[]>([]);

  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [status, setStatus] = useState('');
  const [loginError, setLoginError] = useState('');

  const [uid, setUid] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  const [pendapatanHariIni, setPendapatanHariIni] = useState(0);
  const [transaksiHariIni, setTransaksiHariIni] = useState(0);
  const [barangTerjualHariIni, setBarangTerjualHariIni] = useState<BarangTerjualHariIni[]>([]);
  const [riwayatPendapatan, setRiwayatPendapatan] = useState<RiwayatPendapatanItem[]>([]);
  const [laporanLoading, setLaporanLoading] = useState(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (
      text: string,
      type: ToastMessage['type'] = 'info',
      action?: { label: string; onClick: () => void }
    ) => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      const id = Date.now();
      setToast({
        id,
        text,
        type,
        actionLabel: action?.label,
        onAction: action?.onClick,
      });
      toastTimerRef.current = window.setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, action ? 4000 : 2200);
    },
    []
  );

  // ── Helpers ──────────────────────────────────────────────────────
  const formatStock = useCallback((item: ItemModel): string => {
    if (item.type === 'timbang') {
      return `${Math.round(item.stock)} ${item.unit}`;
    }
    return `${Math.round(item.stock)} pcs`;
  }, []);

  const getThreshold = useCallback((item: ItemModel): number => {
    if (item.type === 'timbang') {
      if (item.unit === 'gram') return 500;
      if (item.unit === 'ons') return 5;
      return 1;
    }
    return 5;
  }, []);

  const getStatus = useCallback(
    (item: ItemModel): 'Habis' | 'Menipis' | 'Aman' => {
      if (item.stock <= 0) return 'Habis';
      if (item.stock <= getThreshold(item)) return 'Menipis';
      return 'Aman';
    },
    [getThreshold]
  );

  const sisaHariSampah = useCallback((item: ItemModel): number => {
    if (!item.deletedAt) return UMUR_SAMPAH_HARI;
    const deletedDate = new Date(item.deletedAt);
    if (Number.isNaN(deletedDate.getTime())) return UMUR_SAMPAH_HARI;
    const diffDays = Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
    const sisa = UMUR_SAMPAH_HARI - diffDays;
    return sisa < 0 ? 0 : sisa;
  }, []);

  // ── Firestore loaders ────────────────────────────────────────────
  const muatBarang = useCallback(async (currentUid: string) => {
    const semua = await firestoreService.getItems(currentUid);
    const batasMs = Date.now() - UMUR_SAMPAH_HARI * 24 * 60 * 60 * 1000;

    const expired = semua.filter(
      (i) => i.deletedAt && new Date(i.deletedAt).getTime() < batasMs
    );
    for (const b of expired) {
      try {
        await firestoreService.deleteItem(currentUid, b.id);
      } catch {
        // Ignore single cleanup failure
      }
    }
    const expiredIds = new Set(expired.map((e) => e.id));
    const valid = semua.filter((i) => !expiredIds.has(i.id));

    const aktif = valid
      .filter((i) => !i.deletedAt)
      .sort((a, b) => a.id - b.id);
    const sampah = valid
      .filter((i) => Boolean(i.deletedAt))
      .sort(
        (a, b) =>
          new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime()
      );

    setItems(aktif);
    setTrashItems(sampah);
  }, []);

  const loadPendapatan = useCallback(async (currentUid: string) => {
    if (!currentUid) return;
    try {
      const data = await firestoreService.getPendapatanHariIni(currentUid);
      setPendapatanHariIni(data.total);
      setTransaksiHariIni(data.transaksi);
      setBarangTerjualHariIni(data.barang);
    } catch {
      // Ignore background failure
    }
  }, []);

  const loadRiwayatPendapatan = useCallback(
    async (force = false) => {
      if (!uid) return;
      if (laporanLoading || (riwayatPendapatan.length > 0 && !force)) return;
      setLaporanLoading(true);
      try {
        const list = await firestoreService.getRiwayatPendapatan(uid);
        setRiwayatPendapatan(list);
      } finally {
        setLaporanLoading(false);
      }
    },
    [uid, laporanLoading, riwayatPendapatan.length]
  );

  // ── Auth lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    const unsub = authService.onUserChange(async (user) => {
      setAuthChecked(true);
      if (user) {
        const currentUid = user.uid;
        const currentName = user.displayName ?? '';
        const currentEmail = user.email ?? '';
        const currentPhoto = user.photoURL ?? '';

        setUid(currentUid);
        setUserName(currentName);
        setUserEmail(currentEmail);
        setUserPhoto(currentPhoto);
        setIsLoggedIn(true);
        setIsLoading(true);
        setStatus('Memuat data...');

        firestoreService.isUserRegistered(currentUid).then((ada) => {
          if (!ada) {
            firestoreService.registerUser({
              uid: currentUid,
              nama: currentName,
              email: currentEmail,
            });
          }
        });

        try {
          await muatBarang(currentUid);
          setStatus('');
        } catch {
          setItems([]);
          setTrashItems([]);
          setStatus('Gagal memuat data barang');
        }

        try {
          const utang = await firestoreService.getUtang(currentUid);
          setUtangList(utang);
        } catch {
          setUtangList([]);
        }

        loadPendapatan(currentUid);
        setIsLoading(false);
      } else {
        setItems([]);
        setTrashItems([]);
        setCart([]);
        setUtangList([]);
        setIsLoggedIn(false);
        setUid('');
        setUserName('');
        setUserEmail('');
        setUserPhoto('');
        setPendapatanHariIni(0);
        setTransaksiHariIni(0);
        setBarangTerjualHariIni([]);
        setRiwayatPendapatan([]);
        setLaporanLoading(false);
        setStatus('');
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [muatBarang, loadPendapatan]);

  // ── Login & Logout ───────────────────────────────────────────────
  const login = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setLoginError('');
    const ok = await authService.signIn();
    if (!ok) {
      setLoginError(authService.lastError);
      setIsLoading(false);
      return false;
    }
    return true;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.signOut();
  }, []);

  // ── Cart Operations ──────────────────────────────────────────────
  const tambahKeCart = useCallback(
    (item: ItemModel, qty = 1): boolean => {
      const currentItem = items.find((i) => i.id === item.id);
      if (!currentItem || currentItem.stock < qty) return false;

      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id ? { ...i, stock: Number((i.stock - qty).toFixed(4)) } : i
        )
      );

      setCart((prevCart) => {
        const idx = prevCart.findIndex((c) => c.id === item.id);
        if (idx !== -1) {
          return prevCart.map((c, i) =>
            i === idx ? { ...c, qty: Number((c.qty + qty).toFixed(4)) } : c
          );
        }
        return [
          ...prevCart,
          {
            id: item.id,
            name: item.name,
            type: item.type,
            unit: item.unit,
            price: item.price,
            qty,
          },
        ];
      });
      return true;
    },
    [items]
  );

  const cariBarangDariBarcode = useCallback(
    (barcode: string): ItemModel | null => {
      const kode = barcode.trim();
      if (!kode) return null;
      return items.find((item) => item.barcode.trim() === kode) ?? null;
    },
    [items]
  );

  const kurangiQty = useCallback((id: number) => {
    setCart((prevCart) => {
      const target = prevCart.find((c) => c.id === id);
      if (!target) return prevCart;
      const step = target.type === 'timbang' ? 0.1 : 1.0;

      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === id ? { ...i, stock: Number((i.stock + step).toFixed(4)) } : i
        )
      );

      const nextQty = Number((target.qty - step).toFixed(4));
      if (nextQty <= 0) {
        return prevCart.filter((c) => c.id !== id);
      }
      return prevCart.map((c) => (c.id === id ? { ...c, qty: nextQty } : c));
    });
  }, []);

  const hapusCartItem = useCallback((id: number) => {
    setCart((prevCart) => {
      const target = prevCart.find((c) => c.id === id);
      if (!target) return prevCart;

      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === id ? { ...i, stock: Number((i.stock + target.qty).toFixed(4)) } : i
        )
      );

      return prevCart.filter((c) => c.id !== id);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart((prevCart) => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          const inCart = prevCart.find((c) => c.id === item.id);
          return inCart
            ? { ...item, stock: Number((item.stock + inCart.qty).toFixed(4)) }
            : item;
        })
      );
      return [];
    });
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, c) => sum + c.price * c.qty, 0),
    [cart]
  );

  const prosesBayar = useCallback(
    async (bayar: number): Promise<void> => {
      if (cart.length === 0 || bayar < total) return;

      const updatedItems = items.map((item) => {
        const cartEntry = cart.find((c) => c.id === item.id);
        if (!cartEntry) return item;
        return {
          ...item,
          sold: Number((item.sold + cartEntry.qty).toFixed(4)),
        };
      });

      const totalBayar = total;
      const barangTerjual: BarangTerjualHariIni[] = cart.map((c) => ({
        id: c.id,
        nama: c.name,
        jumlah: c.qty,
        satuan: c.unit,
        total: c.price * c.qty,
      }));

      setItems(updatedItems);
      setCart([]);

      await Promise.all(
        updatedItems.map((item) => firestoreService.updateItem(uid, item))
      );

      firestoreService
        .tambahPendapatan({
          uid,
          total: totalBayar,
          barang: barangTerjual,
        })
        .then(() => {
          loadPendapatan(uid);
          firestoreService.getRiwayatPendapatan(uid).then(setRiwayatPendapatan);
        })
        .catch(() => {});
    },
    [cart, total, items, uid, loadPendapatan]
  );

  // ── Item Management ──────────────────────────────────────────────
  const addItem = useCallback(
    async (params: {
      name: string;
      price: number;
      stock: number;
      type: ItemType;
      unit: string;
      barcode?: string;
    }) => {
      const cleanName = params.name.trim();
      if (!cleanName || params.price <= 0) return;
      const cleanBarcode = (params.barcode ?? '').trim();
      if (
        cleanBarcode &&
        items.some((item) => item.barcode.trim() === cleanBarcode)
      ) {
        throw new Error('Barcode sudah dipakai oleh barang lain');
      }

      await firestoreService.addItem(uid, {
        name: cleanName,
        price: params.price,
        stock: params.stock,
        sold: 0,
        type: params.type,
        unit: params.unit,
        barcode: cleanBarcode,
        deletedAt: null,
      });
      await muatBarang(uid);
    },
    [items, uid, muatBarang]
  );

  const hapusItem = useCallback(
    async (id: number) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;
      setCart((prev) => prev.filter((c) => c.id !== id));
      const dibuang: ItemModel = {
        ...target,
        deletedAt: new Date().toISOString(),
      };
      await firestoreService.updateItem(uid, dibuang);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTrashItems((prev) => [dibuang, ...prev]);
    },
    [items, uid]
  );

  const pulihkanItem = useCallback(
    async (id: number) => {
      const target = trashItems.find((i) => i.id === id);
      if (!target) return;
      const pulih: ItemModel = { ...target, deletedAt: null };
      await firestoreService.updateItem(uid, pulih);
      setTrashItems((prev) => prev.filter((i) => i.id !== id));
      setItems((prev) => [...prev, pulih].sort((a, b) => a.id - b.id));
    },
    [trashItems, uid]
  );

  const hapusPermanenItem = useCallback(
    async (id: number) => {
      await firestoreService.deleteItem(uid, id);
      setTrashItems((prev) => prev.filter((i) => i.id !== id));
    },
    [uid]
  );

  const kosongkanSampah = useCallback(async () => {
    const ids = trashItems.map((i) => i.id);
    for (const id of ids) {
      try {
        await firestoreService.deleteItem(uid, id);
      } catch {
        // Ignore single item deletion error
      }
    }
    setTrashItems([]);
  }, [trashItems, uid]);

  const ubahStok = useCallback(
    async (id: number, value: number) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;
      const nextStock = value < 0 ? 0 : value;
      const updated: ItemModel = { ...target, stock: nextStock };
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      try {
        await firestoreService.updateItem(uid, updated);
      } catch (e) {
        setItems((prev) => prev.map((i) => (i.id === id ? target : i)));
        throw e;
      }
    },
    [items, uid]
  );

  const tambahStok = useCallback(
    async (id: number, jumlah: number) => {
      if (jumlah <= 0) return;
      const target = items.find((i) => i.id === id);
      if (!target) return;
      const updated: ItemModel = {
        ...target,
        stock: Number((target.stock + jumlah).toFixed(4)),
      };
      await firestoreService.updateItem(uid, updated);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [items, uid]
  );

  const ubahBarcode = useCallback(
    async (id: number, barcode: string) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;
      const cleanBarcode = barcode.trim();
      if (
        cleanBarcode &&
        items.some((item) => item.id !== id && item.barcode.trim() === cleanBarcode)
      ) {
        throw new Error('Barcode sudah dipakai oleh barang lain');
      }
      const updated: ItemModel = { ...target, barcode: cleanBarcode };
      await firestoreService.updateItem(uid, updated);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [items, uid]
  );

  const ubahHarga = useCallback(
    async (id: number, value: number) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;
      const updated: ItemModel = { ...target, price: value < 0 ? 0 : value };
      await firestoreService.updateItem(uid, updated);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [items, uid]
  );

  // ── Catatan Utang ────────────────────────────────────────────────
  const utangBelumLunas = useMemo(
    () => utangList.filter((u) => !u.lunas),
    [utangList]
  );

  const totalUtangBelumLunas = useMemo(
    () => utangBelumLunas.reduce((sum, u) => sum + getUtangSisa(u), 0),
    [utangBelumLunas]
  );

  const jumlahUtangBelumLunas = utangBelumLunas.length;

  const cariUtang = useCallback(
    (id: number): UtangModel | null =>
      utangList.find((u) => u.id === id) ?? null,
    [utangList]
  );

  const tambahUtang = useCallback(
    async (params: {
      nama: string;
      tanggal: Date;
      nominal: number;
      catatan?: string;
    }) => {
      const cleanNama = params.nama.trim();
      if (!cleanNama || params.nominal <= 0) {
        throw new Error('Nama dan nominal utang wajib diisi.');
      }
      const list = await firestoreService.addUtang(uid, {
        nama: cleanNama,
        tanggal: params.tanggal.toISOString(),
        nominal: params.nominal,
        totalDibayar: 0,
        catatan: (params.catatan ?? '').trim(),
        lunas: false,
        tanggalLunas: null,
      });
      setUtangList(list);
    },
    [uid]
  );

  const hapusUtang = useCallback(
    async (id: number) => {
      await firestoreService.deleteUtang(uid, id);
      setUtangList((prev) => prev.filter((u) => u.id !== id));
    },
    [uid]
  );

  const bayarUtang = useCallback(
    async (id: number, nominalBayar: number) => {
      const lama = utangList.find((u) => u.id === id);
      if (!lama) return;
      if (nominalBayar <= 0) {
        throw new Error('Nominal pelunasan harus lebih dari Rp 0.');
      }
      if (lama.lunas) return;
      const sisa = getUtangSisa(lama);
      if (nominalBayar > sisa) {
        throw new Error('Nominal pelunasan melebihi sisa utang.');
      }
      const dibayarBaru = lama.totalDibayar + nominalBayar;
      const sudahLunas = dibayarBaru >= getUtangTotal(lama);
      const baru: UtangModel = {
        ...lama,
        totalDibayar: dibayarBaru,
        lunas: sudahLunas,
        tanggalLunas: sudahLunas ? new Date().toISOString() : null,
      };
      setUtangList((prev) => prev.map((u) => (u.id === id ? baru : u)));
      try {
        await firestoreService.updateUtang(uid, baru);
      } catch (e) {
        setUtangList((prev) => prev.map((u) => (u.id === id ? lama : u)));
        throw e;
      }
    },
    [utangList, uid]
  );

  // ── Statistics ───────────────────────────────────────────────────
  const totalBarang = items.length;
  const stokMenipis = useMemo(
    () => items.filter((i) => i.stock > 0 && i.stock <= getThreshold(i)).length,
    [items, getThreshold]
  );
  const stokHabis = useMemo(
    () => items.filter((i) => i.stock <= 0).length,
    [items]
  );

  const value: KasirContextValue = {
    items,
    trashItems,
    cart,
    utangList,
    isLoading,
    authChecked,
    isLoggedIn,
    status,
    loginError,
    pendapatanHariIni,
    transaksiHariIni,
    barangTerjualHariIni,
    riwayatPendapatan,
    laporanLoading,
    uid,
    userName,
    userEmail,
    userPhoto,
    toast,
    showToast,
    dismissToast,
    formatHarga,
    formatQty,
    formatStock,
    formatTanggal,
    getThreshold,
    getStatus,
    sisaHariSampah,
    login,
    logout,
    tambahKeCart,
    cariBarangDariBarcode,
    kurangiQty,
    hapusCartItem,
    clearCart,
    total,
    prosesBayar,
    addItem,
    hapusItem,
    pulihkanItem,
    hapusPermanenItem,
    kosongkanSampah,
    ubahStok,
    tambahStok,
    ubahBarcode,
    ubahHarga,
    utangBelumLunas,
    totalUtangBelumLunas,
    jumlahUtangBelumLunas,
    cariUtang,
    tambahUtang,
    hapusUtang,
    bayarUtang,
    loadRiwayatPendapatan,
    totalBarang,
    stokMenipis,
    stokHabis,
  };

  return <KasirContext.Provider value={value}>{children}</KasirContext.Provider>;
};

export function useKasir(): KasirContextValue {
  const ctx = useContext(KasirContext);
  if (!ctx) {
    throw new Error('useKasir must be used inside KasirProvider');
  }
  return ctx;
}
