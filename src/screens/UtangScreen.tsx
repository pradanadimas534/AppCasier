import React, { useState } from 'react';
import { Calendar, Inbox, UserPlus, Wallet } from 'lucide-react';
import { AppEmptyState, AppHeader, PillChip, SearchPill } from '../components/AppUI';
import { useKasir } from '../context/KasirContext';
import { getUtangSisa, getUtangTotal } from '../models/utangModel';
import { UtangDetailScreen } from './UtangDetailScreen';
import { UtangFormScreen } from './UtangFormScreen';

export const UtangScreen: React.FC = () => {
  const p = useKasir();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'belum' | 'lunas' | 'semua'>('belum');
  const [showForm, setShowForm] = useState(false);
  const [selectedUtangId, setSelectedUtangId] = useState<number | null>(null);

  const q = search.trim().toLowerCase();
  const list = p.utangList.filter((u) => {
    const byStatus =
      filter === 'belum' ? !u.lunas : filter === 'lunas' ? u.lunas : true;
    const bySearch = !q || u.nama.toLowerCase().includes(q);
    return byStatus && bySearch;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AppHeader
        title="Catatan Utang"
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            title="Catat utang baru"
            className="p-2 rounded-full hover:bg-gray-100 text-app-inkSoft"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-[100px] space-y-3.5">
        {/* Ringkasan total belum lunas */}
        <div className="p-[18px] rounded-[18px] bg-gradient-to-br from-brand-soft to-brand-deep text-white">
          <div className="flex items-center gap-2 text-white/80 text-[12px] font-bold">
            <Wallet className="w-[18px] h-[18px]" />
            <span>TOTAL UTANG BELUM LUNAS</span>
          </div>
          <div className="text-[28px] font-bold mt-2 leading-tight">
            {p.formatHarga(p.totalUtangBelumLunas)}
          </div>
          <div className="text-[13px] text-white/80 mt-1">
            {p.jumlahUtangBelumLunas} catatan belum dilunasi
          </div>
        </div>

        {/* Search */}
        <SearchPill
          value={search}
          onChange={setSearch}
          placeholder="Cari nama..."
        />

        {/* Filter Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
          <PillChip
            label="Belum Lunas"
            active={filter === 'belum'}
            onClick={() => setFilter('belum')}
          />
          <PillChip
            label="Lunas"
            active={filter === 'lunas'}
            onClick={() => setFilter('lunas')}
          />
          <PillChip
            label="Semua"
            active={filter === 'semua'}
            onClick={() => setFilter('semua')}
          />
        </div>

        {/* List */}
        {list.length === 0 ? (
          <div className="pt-10">
            <AppEmptyState
              icon={<Inbox className="w-12 h-12" />}
              title="Tidak Ada data"
              message={'tekan + di kanan atas\nuntuk menambahkan data'}
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {list.map((u) => {
              const sisa = getUtangSisa(u);
              const total = getUtangTotal(u);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUtangId(u.id)}
                  className="w-full text-left p-3.5 rounded-2xl bg-white shadow-soft border border-gray-100/80 active:scale-[0.99] transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[15px] text-app-ink truncate">
                      {u.nama}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                        u.lunas
                          ? 'bg-app-success/10 text-app-success'
                          : 'bg-brand-red/10 text-brand-red'
                      }`}
                    >
                      {u.lunas ? 'LUNAS' : 'BELUM LUNAS'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[12px] text-app-muted mt-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{p.formatTanggal(u.tanggal)}</span>
                  </div>

                  <div
                    className={`font-bold text-[15px] mt-2.5 ${
                      u.lunas ? 'text-app-muted' : 'text-brand-red'
                    }`}
                  >
                    {u.lunas
                      ? `Total: ${p.formatHarga(total)}`
                      : `Sisa: ${p.formatHarga(sisa)} dari ${p.formatHarga(total)}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <UtangFormScreen
          onBack={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            p.showToast('Catatan utang tersimpan', 'success');
          }}
        />
      )}

      {selectedUtangId !== null && (
        <UtangDetailScreen
          utangId={selectedUtangId}
          onBack={() => setSelectedUtangId(null)}
        />
      )}
    </div>
  );
};
