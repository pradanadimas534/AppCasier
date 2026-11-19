import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Edit3,
  Filter,
  Menu,
  Package,
  Plus,
  PlusSquare,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { AppEmptyState, BarcodeIcon, SearchPill } from '../components/AppUI';
import { useKasir } from '../context/KasirContext';
import type { ItemModel, ItemType } from '../models/itemModel';
import { SampahScreen } from './SampahScreen';

export const StokScreen: React.FC<{
  onOpenDrawer: () => void;
  onOpenScannerField: (onResult: (barcode: string) => void) => void;
  onOpenScannerCount: (
    onResult: (res: { barcode: string; count: number }) => void
  ) => void;
}> = ({ onOpenDrawer, onOpenScannerField, onOpenScannerCount }) => {
  const p = useKasir();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [jenisFilter, setJenisFilter] = useState<'all' | 'satuan' | 'timbang'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSampah, setShowSampah] = useState(false);

  // Add item form state
  const [newType, setNewType] = useState<ItemType>('satuan');
  const [newUnit, setNewUnit] = useState('pcs');
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [stockText, setStockText] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Inline edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editStockText, setEditStockText] = useState('');
  const [editPriceText, setEditPriceText] = useState('');
  const [editBarcodeText, setEditBarcodeText] = useState('');

  // Dialog states
  const [addStockItem, setAddStockItem] = useState<ItemModel | null>(null);
  const [addStockValue, setAddStockValue] = useState('');
  const [deleteItemTarget, setDeleteItemTarget] = useState<ItemModel | null>(null);

  const filtered = p.items.filter((item) => {
    const cocokCari =
      !search.trim() ||
      item.name.toLowerCase().includes(search.trim().toLowerCase());
    const cocokJenis = jenisFilter === 'all' || item.type === jenisFilter;
    return cocokCari && cocokJenis;
  });

  const handleSimpanBarang = async () => {
    const cleanName = name.trim();
    const price = parseFloat(priceText) || 0;
    const stock = parseFloat(stockText) || 0;

    if (!cleanName || price <= 0) {
      p.showToast('Isi nama dan harga dulu!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await p.addItem({
        name: cleanName,
        price,
        stock,
        type: newType,
        unit: newType === 'satuan' ? 'pcs' : newUnit,
        barcode: newType === 'satuan' ? barcode : '',
      });
      setName('');
      setPriceText('');
      setStockText('');
      setBarcode('');
      setShowForm(false);
      p.showToast(`${cleanName} berhasil ditambahkan`, 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      p.showToast(`Gagal menambahkan barang: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanHitungStok = () => {
    onOpenScannerCount((res) => {
      setBarcode(res.barcode);
      const existing = parseFloat(stockText) || 0;
      const total = existing + res.count;
      setStockText(total % 1 === 0 ? String(Math.trunc(total)) : String(total));
      p.showToast(`Barcode diisi · stok awal +${res.count}`, 'success');
    });
  };

  const handleSaveEdit = async (item: ItemModel) => {
    const newStock = parseFloat(editStockText);
    const newPrice = parseFloat(editPriceText);
    try {
      await p.ubahStok(item.id, Number.isNaN(newStock) ? item.stock : newStock);
      await p.ubahHarga(item.id, Number.isNaN(newPrice) ? item.price : newPrice);
      await p.ubahBarcode(item.id, editBarcodeText);
      setEditId(null);
      p.showToast('Perubahan disimpan', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      p.showToast(msg, 'error');
    }
  };

  const handleConfirmAddStock = async () => {
    if (!addStockItem) return;
    const jumlah = parseFloat(addStockValue) || 0;
    if (jumlah <= 0) {
      setAddStockItem(null);
      return;
    }
    const target = addStockItem;
    setAddStockItem(null);
    setAddStockValue('');
    try {
      await p.tambahStok(target.id, jumlah);
      p.showToast(
        `${p.formatQty(jumlah)} ${target.unit} ditambahkan ke ${target.name}`,
        'success'
      );
    } catch (e: unknown) {
      p.showToast(`Gagal menambah stok: ${String(e)}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemTarget) return;
    const target = deleteItemTarget;
    setDeleteItemTarget(null);
    await p.hapusItem(target.id);
    p.showToast(`${target.name} dipindahkan ke Sampah`, 'info', {
      label: 'Urungkan',
      onClick: () => {
        p.pulihkanItem(target.id);
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto px-3.5 pt-2 pb-[100px]">
      {/* Header */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Buka Menu"
          className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
        >
          <Menu className="w-7 h-7 text-brand-red" />
        </button>
        <h1 className="flex-1 font-poppins font-bold text-[20px] text-app-ink truncate">
          Stok Barang
        </h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="px-3.5 py-2.5 rounded-[14px] bg-brand-red text-white font-semibold text-[13px] flex items-center gap-1.5 active:scale-95 transition"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Tutup' : 'Tambah'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mt-2.5">
        <SumCard
          label="Total Barang"
          value={String(p.totalBarang)}
          colorClass="text-blue-600 bg-blue-500/10 border-blue-500/20"
          icon={<Package className="w-4 h-4 text-blue-600" />}
        />
        <SumCard
          label="Menipis"
          value={String(p.stokMenipis)}
          colorClass="text-orange-500 bg-orange-500/10 border-orange-500/20"
          icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
        />
        <SumCard
          label="Habis"
          value={String(p.stokHabis)}
          colorClass="text-brand-red bg-brand-red/10 border-brand-red/20"
          icon={<ShoppingCart className="w-4 h-4 text-brand-red" />}
        />
      </div>

      {/* Search + Filter + Sampah */}
      <div className="flex items-center gap-2 mt-3.5">
        <div className="flex-1">
          <SearchPill
            value={search}
            onChange={setSearch}
            placeholder="Cari barang..."
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilterModal(true)}
          aria-label="Filter jenis barang"
          className={`w-[46px] h-[46px] rounded-[14px] border border-gray-200 shadow-soft flex items-center justify-center transition ${
            jenisFilter !== 'all'
              ? 'bg-brand-red text-white'
              : 'bg-white text-app-inkSoft'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSampah(true)}
            aria-label="Buka Sampah"
            className="w-[46px] h-[46px] rounded-[14px] bg-white border border-gray-200 shadow-soft flex items-center justify-center text-app-inkSoft"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {p.trashItems.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 rounded-full bg-brand-red text-white text-[10px] font-bold text-center border-2 border-white">
              {p.trashItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Form Tambah Barang */}
      {showForm && (
        <div className="mt-3 p-3.5 rounded-2xl bg-white border border-gray-200 space-y-2.5">
          <div className="font-bold text-[14px] text-app-ink">
            Tambah Barang Baru
          </div>

          {/* Toggle jenis */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setNewType('satuan');
                setNewUnit('pcs');
              }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition ${
                newType === 'satuan'
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              📦 Satuan
            </button>
            <button
              type="button"
              onClick={() => {
                setNewType('timbang');
                setNewUnit('gram');
              }}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition ${
                newType === 'timbang'
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              ⚖️ Timbang
            </button>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">
              Nama Barang
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                newType === 'satuan'
                  ? 'Contoh: Indomie Goreng'
                  : 'Contoh: Telur / Beras / Tepung'
              }
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          {/* Barcode (hanya satuan) */}
          {newType === 'satuan' && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] text-gray-500 mb-1">
                  Barcode (opsional)
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan atau ketik manual"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-red/30"
                />
              </div>
              <button
                type="button"
                onClick={() => onOpenScannerField((code) => setBarcode(code))}
                title="Scan barcode"
                className="h-[40px] w-[42px] rounded-xl bg-red-50 flex items-center justify-center shrink-0"
              >
                <BarcodeIcon size={22} />
              </button>
            </div>
          )}

          {/* Harga, Satuan & Stok Awal */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                {newType === 'satuan'
                  ? 'Harga/pcs (Rp)'
                  : `Harga/${newUnit} (Rp)`}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={priceText}
                onChange={(e) =>
                  setPriceText(e.target.value.replace(/[^0-9]/g, ''))
                }
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-red/30"
              />
            </div>

            {newType === 'timbang' && (
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">
                  Satuan
                </label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-[13px] focus:outline-none"
                >
                  <option value="gram">per gram</option>
                  <option value="ons">per ons</option>
                  <option value="kg">per kg</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                Stok Awal
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={stockText}
                onChange={(e) =>
                  setStockText(e.target.value.replace(/[^0-9.]/g, ''))
                }
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-red/30"
              />
            </div>
          </div>

          {/* Tombol Scan Hitung Stok & Simpan */}
          {newType === 'satuan' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleScanHitungStok}
              className="w-full py-3 rounded-[14px] border border-brand-red text-brand-red font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              <BarcodeIcon size={20} />
              <span>Scan Barcode (hitung stok)</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSimpanBarang}
            className="w-full py-3.5 rounded-[14px] bg-brand-red text-white font-bold text-[14px] active:scale-[0.99] transition disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Barang'}
          </button>
        </div>
      )}

      {/* Daftar Barang */}
      <div className="mt-3 space-y-2">
        {filtered.length === 0 && !showForm ? (
          <div className="pt-10">
            <AppEmptyState
              icon={<Package className="w-12 h-12" />}
              title="Tidak Ada Produk"
              message={'pencet tambah produk\nuntuk menambah produk'}
            />
          </div>
        ) : (
          filtered.map((item) => {
            const editing = editId === item.id;
            const status = p.getStatus(item);
            const statusColor =
              status === 'Habis'
                ? 'text-brand-red bg-red-50'
                : status === 'Menipis'
                ? 'text-orange-600 bg-orange-50'
                : 'text-green-600 bg-green-50';

            return (
              <div
                key={item.id}
                className="p-3 rounded-[14px] bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[14px] text-app-ink truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          item.type === 'timbang'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {item.type === 'timbang'
                          ? `⚖️ ${item.unit}`
                          : '📦 pcs'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusColor}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {!editing ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAddStockItem(item);
                          setAddStockValue('');
                        }}
                        title="Tambah stok"
                        className="p-1.5 text-brand-red hover:bg-red-50 rounded-lg"
                      >
                        <PlusSquare className="w-[19px] h-[19px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(item.id);
                          setEditStockText(String(item.stock));
                          setEditPriceText(String(Math.trunc(item.price)));
                          setEditBarcodeText(item.barcode);
                        }}
                        title="Edit"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit3 className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteItemTarget(item)}
                        title="Hapus"
                        className="p-1.5 text-brand-red hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item)}
                        className="px-2 py-1 text-[13px] font-semibold text-brand-red"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="px-2 py-1 text-[13px] text-gray-500"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>

                {/* Info boxes or Inline Edit */}
                {!editing ? (
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    <InfoBox
                      label="Stok"
                      value={p.formatStock(item)}
                      color="blue"
                    />
                    <InfoBox
                      label="Harga"
                      value={`${p.formatHarga(item.price)}/${item.unit}`}
                      color="green"
                    />
                    <InfoBox
                      label="Terjual"
                      value={`${Math.trunc(item.sold)} ${item.unit}`}
                      color="purple"
                    />
                  </div>
                ) : (
                  <div className="mt-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">
                          Stok ({item.unit})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editStockText}
                          onChange={(e) =>
                            setEditStockText(
                              e.target.value.replace(/[^0-9.]/g, '')
                            )
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-gray-50 text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">
                          Harga (Rp)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editPriceText}
                          onChange={(e) =>
                            setEditPriceText(
                              e.target.value.replace(/[^0-9]/g, '')
                            )
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-gray-50 text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 mb-0.5">
                          Barcode
                        </label>
                        <input
                          type="text"
                          value={editBarcodeText}
                          onChange={(e) => setEditBarcodeText(e.target.value)}
                          placeholder="Kosongkan jika tidak memakai barcode"
                          className="w-full px-2.5 py-2 rounded-lg bg-gray-50 text-[13px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenScannerField((code) => setEditBarcodeText(code))
                        }
                        className="mt-4 p-2 rounded-lg bg-gray-100"
                      >
                        <BarcodeIcon size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-t-[20px] max-w-md w-full p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
            <div className="font-bold text-[15px] px-2 mb-2">
              Filter jenis barang
            </div>
            {(
              [
                ['all', 'Semua jenis'],
                ['satuan', '📦 Satuan'],
                ['timbang', '⚖️ Timbang'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setJenisFilter(key);
                  setShowFilterModal(false);
                }}
                className="w-full px-3 py-3 flex items-center justify-between rounded-xl hover:bg-gray-50 text-left text-[14px]"
              >
                <span>{label}</span>
                {jenisFilter === key && (
                  <Check className="w-5 h-5 text-brand-red" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tambah Stok Dialog */}
      {addStockItem && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <h3 className="font-bold text-[16px]">
              Tambah stok {addStockItem.name}
            </h3>
            <div className="mt-3">
              <label className="block text-[12px] text-gray-500 mb-1">
                Jumlah ({addStockItem.unit})
              </label>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={addStockValue}
                onChange={(e) =>
                  setAddStockValue(e.target.value.replace(/[^0-9.]/g, ''))
                }
                placeholder={`Contoh: ${
                  addStockItem.type === 'timbang' ? '0.5' : '10'
                }`}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-[14px] focus:outline-none focus:border-brand-red"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddStockItem(null)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAddStock}
                className="px-4 py-2 rounded-xl bg-brand-red text-white text-[13px] font-semibold"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Dialog */}
      {deleteItemTarget && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <h3 className="font-bold text-[16px]">Hapus Barang</h3>
            <p className="text-[13px] text-gray-600 mt-2">
              Pindahkan "{deleteItemTarget.name}" ke Sampah? Bisa dipulihkan
              dalam 30 hari.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteItemTarget(null)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-[13px] font-bold text-brand-red"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sampah Screen Overlay */}
      {showSampah && <SampahScreen onBack={() => setShowSampah(false)} />}
    </div>
  );
};

const SumCard: React.FC<{
  label: string;
  value: string;
  colorClass: string;
  icon: React.ReactNode;
}> = ({ label, value, colorClass, icon }) => (
  <div className={`p-3 rounded-[14px] border ${colorClass}`}>
    {icon}
    <div className="text-[22px] font-bold mt-1 leading-tight">{value}</div>
    <div className="text-[11px] opacity-80">{label}</div>
  </div>
);

const InfoBox: React.FC<{
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple';
}> = ({ label, value, color }) => {
  const styles =
    color === 'blue'
      ? 'bg-blue-500/[0.06] text-blue-600'
      : color === 'green'
      ? 'bg-green-500/[0.06] text-green-600'
      : 'bg-purple-500/[0.06] text-purple-600';

  return (
    <div className={`px-2.5 py-1.5 rounded-[10px] ${styles}`}>
      <div className="text-[10px] opacity-75">{label}</div>
      <div className="text-[12px] font-bold truncate">{value}</div>
    </div>
  );
};
