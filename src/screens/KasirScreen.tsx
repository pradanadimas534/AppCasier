import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Menu,
  MinusCircle,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { AppEmptyState, PillChip, SearchPill } from '../components/AppUI';
import { useKasir } from '../context/KasirContext';
import type { ItemModel } from '../models/itemModel';
import { type StrukData, StrukScreen } from './StrukScreen';

export const KasirScreen: React.FC<{
  onOpenDrawer: () => void;
}> = ({ onOpenDrawer }) => {
  const p = useKasir();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'satuan' | 'timbang'>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [bayarText, setBayarText] = useState('');
  const [timbangItem, setTimbangItem] = useState<ItemModel | null>(null);
  const [strukData, setStrukData] = useState<StrukData | null>(null);

  const filtered = p.items.filter((item) => {
    const matchSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchFilter = filter === 'all' || item.type === filter;
    return matchSearch && matchFilter;
  });

  const bayar = parseFloat(bayarText) || 0;
  const kembalian = bayar - p.total;
  const cartCount = p.cart.length;

  const handleProsesBayar = async () => {
    if (p.cart.length === 0 || bayar < p.total) return;
    const strukItems = p.cart.map((c) => ({
      nama: c.name,
      qty: c.qty,
      unit: c.unit,
      harga: c.price,
    }));
    const strukTotal = p.total;
    const currentBayar = bayar;
    const currentKembalian = kembalian < 0 ? 0 : kembalian;

    await p.prosesBayar(currentBayar);
    setBayarText('');
    setCartOpen(false);
    setStrukData({
      waktu: new Date(),
      kasir: p.userName.trim() || 'Kasir Toko',
      items: strukItems,
      total: strukTotal,
      bayar: currentBayar,
      kembalian: currentKembalian,
    });
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-3 pt-3 pb-[150px] overflow-hidden">
        {/* Header: menu + search */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Buka Menu"
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <Menu className="w-7 h-7 text-brand-red" />
          </button>
          <div className="flex-1">
            <SearchPill
              value={search}
              onChange={setSearch}
              placeholder="Cari barang..."
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-3.5 no-scrollbar">
          <PillChip
            label="All"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <PillChip
            label="Satuan"
            active={filter === 'satuan'}
            onClick={() => setFilter('satuan')}
          />
          <PillChip
            label="Timbangan"
            active={filter === 'timbang'}
            onClick={() => setFilter('timbang')}
          />
        </div>

        {/* Grid Barang */}
        <div className="flex-1 overflow-y-auto pb-4">
          {filtered.length === 0 ? (
            <AppEmptyState
              icon={<Package className="w-12 h-12" />}
              title="Tidak Ada Produk"
              message={'Tambahkan produk lewat menu Stok\nuntuk mulai berjualan'}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filtered.map((item) => (
                <ItemTile
                  key={item.id}
                  item={item}
                  onTap={() => {
                    if (item.stock <= 0) return;
                    if (item.type === 'timbang') {
                      setTimbangItem(item);
                    } else {
                      p.tambahKeCart(item, 1);
                      p.showToast(`${item.name} ditambahkan`, 'success');
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet Keranjang */}
      <div
        className={`fixed left-0 right-0 bottom-[58px] z-20 max-w-md mx-auto bg-white rounded-t-[20px] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col ${
          cartOpen ? 'h-[76vh]' : 'h-[62px]'
        }`}
      >
        {/* Handle & Header */}
        <button
          type="button"
          onClick={() => setCartOpen((o) => !o)}
          className="w-full flex flex-col items-center pt-2 pb-2 px-4 border-b border-gray-100 shrink-0"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full mb-1.5" />
          <div className="w-full flex items-center">
            <ShoppingCart className="w-5 h-5 text-brand-red" />
            <span className="ml-2 font-bold text-[15px] text-app-ink">
              Keranjang
            </span>
            <div className="flex-1" />
            {cartCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-[11px] font-bold text-red-700 mr-2">
                {cartCount} item
              </span>
            )}
            {cartOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        {/* Scrollable Content */}
        {cartOpen && (
          <div className="flex-1 overflow-y-auto px-3.5 pt-2.5 pb-6 space-y-2">
            {p.cart.length === 0 ? (
              <div className="py-6 flex flex-col items-center text-gray-400">
                <ShoppingCart className="w-11 h-11 text-gray-300 mb-2" />
                <span className="text-[13px]">Keranjang kosong</span>
              </div>
            ) : (
              p.cart.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] text-app-ink truncate">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {p.formatQty(c.qty)} {c.unit} × {p.formatHarga(c.price)}
                    </div>
                  </div>
                  <div className="font-bold text-[13px] text-green-600">
                    {p.formatHarga(c.price * c.qty)}
                  </div>
                  <button
                    type="button"
                    onClick={() => p.hapusCartItem(c.id)}
                    aria-label={`Hapus ${c.name}`}
                    className="p-1 text-red-400 hover:text-brand-red"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}

            {/* Area Bayar */}
            <div className="mt-3 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[15px] text-app-ink">Total</span>
                <span className="font-bold text-[20px] text-green-700">
                  {p.formatHarga(p.total)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={bayarText}
                  onChange={(e) =>
                    setBayarText(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  placeholder="Uang diterima..."
                  className="flex-1 px-3.5 py-3 rounded-xl bg-gray-50 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-red/30"
                />
                <button
                  type="button"
                  onClick={() => setBayarText(String(Math.round(p.total)))}
                  className="px-3 py-2 text-brand-red font-bold text-[14px]"
                >
                  Pas
                </button>
              </div>

              {bayar > 0 && (
                <div
                  className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between ${
                    kembalian < 0 ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <span
                    className={`font-medium text-[13px] ${
                      kembalian < 0 ? 'text-brand-red' : 'text-green-700'
                    }`}
                  >
                    Kembalian
                  </span>
                  <span
                    className={`font-bold text-[16px] ${
                      kembalian < 0 ? 'text-brand-red' : 'text-green-700'
                    }`}
                  >
                    {p.formatHarga(kembalian < 0 ? 0 : kembalian)}
                  </span>
                </div>
              )}

              <button
                type="button"
                disabled={p.cart.length === 0 || bayar < p.total}
                onClick={handleProsesBayar}
                className="w-full py-3.5 rounded-[14px] bg-brand-red text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.99] transition"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proses Pembayaran</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timbang Dialog */}
      {timbangItem && (
        <TimbangDialog
          item={timbangItem}
          onClose={() => setTimbangItem(null)}
          onAdd={(qty) => {
            p.tambahKeCart(timbangItem, qty);
            p.showToast(
              `${timbangItem.name} ${p.formatQty(qty)} ${timbangItem.unit} ditambahkan`,
              'success'
            );
            setTimbangItem(null);
          }}
        />
      )}

      {/* Struk Modal */}
      {strukData && (
        <StrukScreen data={strukData} onClose={() => setStrukData(null)} />
      )}
    </div>
  );
};

const ItemTile: React.FC<{
  item: ItemModel;
  onTap: () => void;
}> = ({ item, onTap }) => {
  const p = useKasir();
  const habis = item.stock <= 0;
  const timbang = item.type === 'timbang';
  const menipis = !habis && item.stock <= p.getThreshold(item);

  return (
    <button
      type="button"
      disabled={habis}
      onClick={onTap}
      className={`h-[138px] text-left p-2.5 rounded-[14px] border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between transition ${
        habis ? 'bg-gray-100 cursor-not-allowed' : 'bg-white active:scale-[0.98]'
      } ${timbang ? 'border-t-2 border-t-orange-300' : ''}`}
    >
      <div>
        <span
          className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            timbang
              ? 'bg-orange-50 text-orange-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          {timbang ? `⚖️ ${item.unit}` : '📦 pcs'}
        </span>
      </div>

      <div>
        <div
          className={`font-bold text-[13px] line-clamp-2 leading-snug ${
            habis ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {item.name}
        </div>
        <div
          className={`font-bold text-[12px] mt-0.5 ${
            habis ? 'text-gray-400' : 'text-green-700'
          }`}
        >
          {p.formatHarga(item.price)}
        </div>
        <div
          className={`text-[10px] mt-0.5 ${
            habis
              ? 'text-gray-400'
              : menipis
              ? 'text-orange-500'
              : 'text-gray-500'
          }`}
        >
          Stok: {p.formatStock(item)}
        </div>
      </div>
    </button>
  );
};

const TimbangDialog: React.FC<{
  item: ItemModel;
  onClose: () => void;
  onAdd: (qty: number) => void;
}> = ({ item, onClose, onAdd }) => {
  const p = useKasir();
  const [inputVal, setInputVal] = useState('');
  const qty = parseFloat(inputVal) || 0;

  const presets =
    item.unit === 'gram'
      ? [100, 250, 500, 1000, 2000]
      : item.unit === 'ons'
      ? [1, 2, 3, 5, 10]
      : item.unit === 'kg'
      ? [0.5, 1, 2, 5, 10]
      : [100, 250, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] max-w-sm w-full p-5 shadow-xl">
        <h3 className="font-bold text-[16px] text-app-ink">⚖️ {item.name}</h3>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {p.formatHarga(item.price)}/{item.unit} · Stok: {p.formatStock(item)}
        </p>

        {/* Display */}
        <div className="mt-4 w-full p-4 rounded-xl bg-gray-50 text-center">
          <div className="text-[32px] font-bold text-app-ink leading-tight">
            {qty > 0 ? p.formatQty(qty) : '0'}
          </div>
          <div className="text-[12px] text-gray-500">{item.unit}</div>
          {qty > 0 && (
            <div className="text-[16px] font-bold text-green-700 mt-1">
              {p.formatHarga(item.price * qty)}
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((pre) => {
            const active = qty === pre;
            const label =
              item.unit === 'gram' && pre >= 1000
                ? `${pre / 1000}kg`
                : `${pre} ${item.unit}`;
            return (
              <button
                key={pre}
                type="button"
                onClick={() => setInputVal(String(pre))}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition ${
                  active
                    ? 'bg-red-50 border-brand-red text-red-700'
                    : 'bg-gray-100 border-gray-300 text-gray-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Manual input */}
        <div className="mt-3">
          <input
            type="text"
            inputMode="decimal"
            value={inputVal}
            onChange={(e) =>
              setInputVal(e.target.value.replace(/[^0-9.]/g, ''))
            }
            placeholder={`Ketik jumlah (${item.unit})...`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-[14px] focus:outline-none focus:border-brand-red"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={qty <= 0 || qty > item.stock}
            onClick={() => onAdd(qty)}
            className="px-5 py-2 rounded-xl bg-brand-red text-white text-[14px] font-semibold disabled:opacity-40"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
};
