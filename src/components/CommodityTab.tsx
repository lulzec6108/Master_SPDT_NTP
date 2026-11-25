import React, { useMemo, useState } from 'react';
import { CategoryType, CommodityItem, SectorId } from '../types';

export type FilterGroup = 'ALL' | CategoryType | 'FAVORITES';

interface CommodityTabProps {
  commodities: CommodityItem[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onCopyCode: (code: string, label: string) => void;
  isAdmin: boolean;
  onOpenAddCommodity: () => void;
  onOpenEditCommodity: (item: CommodityItem) => void;
  onDeleteCommodity: (code: string) => void;
  selectedSector: SectorId;
  onSelectSector: (sector: SectorId) => void;
  selectedGroup: FilterGroup;
  onSelectGroup: (group: FilterGroup) => void;
  onOpenSidebar: () => void;
  onProposeNewCommodity?: (draftName: string) => void;
}

export const SECTOR_FILTERS: { id: SectorId; codePrefix: string; label: string; shortLabel: string }[] = [
  { id: 'ALL', codePrefix: '01–82', label: 'Semua Sektor', shortLabel: 'Semua' },
  { id: '1_KONSUMSI', codePrefix: '01–11', label: 'Konsumsi RT', shortLabel: 'Konsumsi' },
  { id: '2_TP', codePrefix: '1 · 21–22', label: 'Tanaman Pangan', shortLabel: '1. Pangan' },
  { id: '3_TH', codePrefix: '2 · 31–32', label: 'Tanaman Hortikultura', shortLabel: '2. Horti' },
  { id: '4_TPR', codePrefix: '3 · 41–42', label: 'Perkebunan Rakyat', shortLabel: '3. Kebun' },
  { id: '5_TRK', codePrefix: '4 · 51–52', label: 'Peternakan', shortLabel: '4. Ternak' },
  { id: '6_IKT', codePrefix: '5 · 61–62', label: 'Perikanan Tangkap', shortLabel: '5. Tangkap' },
  { id: '7_IKB', codePrefix: '6 · 71–72', label: 'Perikanan Budidaya', shortLabel: '6. Budidaya' },
  { id: '8_HTN', codePrefix: '7 · 81–82', label: 'Kehutanan', shortLabel: '7. Hutan' },
];

export const CommodityTab: React.FC<CommodityTabProps> = ({
  commodities,
  favorites,
  onToggleFavorite,
  onCopyCode,
  isAdmin,
  onOpenAddCommodity,
  onOpenEditCommodity,
  onDeleteCommodity,
  selectedSector,
  onSelectSector,
  selectedGroup,
  onSelectGroup,
  onOpenSidebar,
  onProposeNewCommodity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(150);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredCommodities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    return commodities.filter((item) => {
      if (selectedSector !== 'ALL' && item.sectorId !== selectedSector) return false;
      if (selectedGroup === 'KONSUMSI' && item.categoryType !== 'KONSUMSI') return false;
      if (selectedGroup === 'PRODUKSI' && item.categoryType !== 'PRODUKSI') return false;
      if (selectedGroup === 'BIAYA_PRODUKSI' && item.categoryType !== 'BIAYA_PRODUKSI') return false;
      if (selectedGroup === 'FAVORITES' && !favorites.includes(item.code)) return false;

      if (tokens.length === 0) return true;
      const haystack = `${item.code} ${item.name} ${item.groupCode} ${item.groupName} ${item.unit}`.toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [commodities, searchQuery, selectedSector, selectedGroup, favorites]);

  const displayedCommodities = useMemo(
    () => filteredCommodities.slice(0, visibleCount),
    [filteredCommodities, visibleCount]
  );

  const handleCopy = (code: string, name: string) => {
    setCopiedCode(code);
    onCopyCode(code, `${code} · ${name}`);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 1400);
  };

  const handleSectorClick = (id: SectorId) => {
    onSelectSector(id);
    setVisibleCount(150);
  };

  const handleGroupClick = (grp: FilterGroup) => {
    onSelectGroup(grp);
    setVisibleCount(150);
  };

  const activeSectorObj = SECTOR_FILTERS.find((s) => s.id === selectedSector) || SECTOR_FILTERS[0];

  return (
    <div>
      {/* STICKY SEARCH & ADAPTIVE FLEX-WRAP FILTER BAR (ZERO HORIZONTAL SCROLLBARS) */}
      <div className="sticky top-[57px] z-20 -mx-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:px-6 dark:border-[#1E293B] dark:bg-[#0B0F19]/95">
        <div className="space-y-2.5">
          {/* Row 1: Search Input + Category Filter / Adaptive Mobile Filter Trigger */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.5 16.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(150);
                }}
                placeholder="Cari kode 7 digit atau uraian komoditas Buku 5 (contoh: 0111001, beras, karet)..."
                className="h-10 w-full rounded-md border border-[#CBD5E1] bg-white pr-28 pl-10 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8]"
              />
              <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setVisibleCount(150);
                    }}
                    className="rounded px-2 py-0.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-white"
                  >
                    Reset
                  </button>
                )}
                <span className="tabular-code text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  {filteredCommodities.length.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Adaptive Small-Screen Summary Bar + Desktop Category Segmented Control */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Flex-wrap Category Filter Buttons (Never scrolls horizontally) */}
              <div className="flex flex-wrap items-center gap-1 rounded-md border border-[#E2E8F0] bg-white p-0.5 dark:border-[#1E293B] dark:bg-[#111827]">
                {(
                  [
                    { id: 'ALL', label: 'Semua' },
                    { id: 'KONSUMSI', label: 'Konsumsi' },
                    { id: 'PRODUKSI', label: 'Produksi' },
                    { id: 'BIAYA_PRODUKSI', label: 'Biaya' },
                    { id: 'FAVORITES', label: `★ (${favorites.length})` },
                  ] as { id: FilterGroup; label: string }[]
                ).map((grp) => {
                  const active = selectedGroup === grp.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => handleGroupClick(grp.id)}
                      className={`h-7 rounded px-2.5 text-xs font-semibold whitespace-nowrap transition ${
                        active
                          ? 'bg-[#003D7A] text-white dark:bg-[#0284C7] dark:text-white'
                          : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      {grp.label}
                    </button>
                  );
                })}
              </div>

              {/* Small-screen Sector Pill Toggle & Sidebar Trigger */}
              <div className="flex items-center gap-1.5 sm:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                >
                  <span className="tabular-code text-[#003D7A] dark:text-[#38BDF8]">
                    {activeSectorObj.codePrefix}
                  </span>
                  <span>{activeSectorObj.shortLabel}</span>
                  <span className="text-[10px] text-[#64748B]">{showMobileFilters ? '▲' : '▼'}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSidebar}
                  className="flex h-8 items-center rounded-md border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#475569] dark:border-[#334155] dark:bg-[#111827] dark:text-[#94A3B8]"
                  title="Buka Sidebar Filter"
                >
                  Menu
                </button>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAddCommodity}
                  className="h-8 rounded-md bg-[#003D7A] px-3 text-xs font-semibold whitespace-nowrap text-white hover:bg-[#002B57] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
                >
                  + Komoditas
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Clean Flex-Wrap Sector Filter Bar (Always visible on >= sm, collapsible on mobile, ZERO scrollbar) */}
          <div
            className={`${
              showMobileFilters ? 'flex' : 'hidden sm:flex'
            } flex-wrap items-center justify-between gap-1.5 pt-0.5`}
          >
            <div className="flex flex-wrap items-center gap-1">
              {SECTOR_FILTERS.map((sec) => {
                const active = selectedSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      handleSectorClick(sec.id);
                      setShowMobileFilters(false);
                    }}
                    className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-semibold whitespace-nowrap transition ${
                      active
                        ? 'bg-[#0F172A] text-white dark:bg-[#F8FAFC] dark:text-[#0F172A]'
                        : 'border border-transparent bg-[#E2E8F0]/50 text-[#475569] hover:border-[#CBD5E1] hover:bg-white hover:text-[#0F172A] dark:bg-[#111827] dark:text-[#94A3B8] dark:hover:border-[#334155] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    <span
                      className={`tabular-code text-[11px] ${
                        active
                          ? 'text-[#38BDF8] dark:text-[#003D7A]'
                          : 'text-[#64748B] dark:text-[#64748B]'
                      }`}
                    >
                      {sec.codePrefix}
                    </span>
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            <a
              href="./assets/aistudio/Buku_5_Master_Komoditas_SPDT_NTP_2026_089343c2.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs font-semibold whitespace-nowrap text-[#64748B] transition hover:text-[#003D7A] xl:inline-block dark:text-[#94A3B8] dark:hover:text-[#38BDF8]"
            >
              Buku 5 (PDF) ↗
            </a>
          </div>
        </div>
      </div>

      {/* SCROLLABLE STRUCTURED DATA DIRECTORY */}
      <div className="mt-4">
        {filteredCommodities.length === 0 ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center dark:border-[#1E293B] dark:bg-[#111827]">
            <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Tidak ditemukan komoditas yang sesuai di Buku 5 Master Komoditas
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Jika komoditas ditemukan di lapangan namun belum memiliki kode 7-digit di Buku 5, silakan ajukan ke daftar komoditas belum berkode.
            </p>
            {onProposeNewCommodity && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => onProposeNewCommodity(searchQuery.trim().toUpperCase())}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#003D7A] px-4 text-xs font-semibold text-white transition hover:bg-[#002D5A] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
                >
                  <span>+ Ajukan{searchQuery.trim() ? ` "${searchQuery.trim().toUpperCase()}"` : ' Komoditas Baru'} (Belum Ada Kode)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white dark:border-[#1E293B] dark:bg-[#111827]">
            {/* Desktop Directory Column Headers */}
            <div className="hidden grid-cols-12 items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-[11px] font-semibold text-[#64748B] sm:grid dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
              <div className="col-span-2">Kode 7-Digit</div>
              <div className="col-span-5">Uraian Komoditas (Buku 5)</div>
              <div className="col-span-3">Satuan Baku</div>
              <div className="col-span-2 text-right">Tindakan</div>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {displayedCommodities.map((item) => {
                const isFav = favorites.includes(item.code);
                const isCopied = copiedCode === item.code;
                const isExpanded = expandedCode === item.code;

                return (
                  <div
                    key={item.code}
                    className="px-4 py-3 transition hover:bg-[#F8FAFC] sm:px-5 dark:hover:bg-[#1E293B]/50"
                  >
                    <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-12 sm:gap-4">
                      {/* Col 1: 7-Digit Code */}
                      <div className="flex items-center justify-between sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.code, item.name)}
                          className="tabular-code text-left text-base font-bold tracking-tight text-[#003D7A] hover:underline dark:text-[#38BDF8]"
                          title="Klik untuk menyalin kode"
                        >
                          {item.code}
                        </button>

                        {/* Mobile Actions */}
                        <div className="flex items-center gap-1.5 sm:hidden">
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(item.code)}
                            className={`flex h-8 w-8 items-center justify-center rounded text-sm transition ${
                              isFav
                                ? 'text-amber-500'
                                : 'text-[#94A3B8] hover:text-[#475569] dark:text-[#475569] dark:hover:text-[#94A3B8]'
                            }`}
                            aria-label="Simpan"
                          >
                            {isFav ? '★' : '☆'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.code, item.name)}
                            className={`h-8 rounded px-3 text-xs font-semibold transition ${
                              isCopied
                                ? 'bg-[#15803D] text-white'
                                : 'border border-[#CBD5E1] bg-white text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                            }`}
                          >
                            {isCopied ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      </div>

                      {/* Col 2: Commodity Name & Unboxed Metadata */}
                      <div
                        onClick={() => setExpandedCode(isExpanded ? null : item.code)}
                        className="cursor-pointer sm:col-span-5"
                      >
                        <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {item.name}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                          <span>{item.questionnaireCode}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-code">Kelompok {item.groupCode}</span>
                        </div>
                      </div>

                      {/* Col 3: Standard Units */}
                      <div className="sm:col-span-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="tabular-code font-semibold text-[#334155] dark:text-[#E2E8F0]">
                            {item.unit}
                          </span>
                          {item.plantUnit && (
                            <>
                              <span className="text-[#CBD5E1] dark:text-[#475569]" aria-hidden="true">
                                /
                              </span>
                              <span className="tabular-code text-[#15803D] dark:text-[#4ADE80]">
                                Tanam: {item.plantUnit}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Col 4: Desktop Actions */}
                      <div className="hidden items-center justify-end gap-1.5 sm:col-span-2 sm:flex">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(item.code)}
                          className={`flex h-8 w-8 items-center justify-center rounded text-sm transition ${
                            isFav
                              ? 'text-amber-500'
                              : 'text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] dark:text-[#475569] dark:hover:bg-[#1E293B] dark:hover:text-[#94A3B8]'
                          }`}
                          title={isFav ? 'Hapus dari tersimpan' : 'Tandai komoditas'}
                          aria-label="Simpan"
                        >
                          {isFav ? '★' : '☆'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.code, item.name)}
                          className={`h-8 min-w-[72px] rounded px-3 text-xs font-semibold transition ${
                            isCopied
                              ? 'bg-[#15803D] text-white'
                              : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#003D7A] hover:bg-[#003D7A] hover:text-white dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8] dark:hover:bg-[#0284C7]'
                          }`}
                        >
                          {isCopied ? 'Tersalin' : 'Salin'}
                        </button>

                        {isAdmin && (
                          <div className="flex items-center gap-1 pl-1">
                            <button
                              type="button"
                              onClick={() => onOpenEditCommodity(item)}
                              className="h-8 rounded px-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCommodity(item.code)}
                              className="h-8 rounded px-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Group Classification Detail */}
                    {isExpanded && (
                      <div className="mt-2.5 border-t border-[#F1F5F9] pt-2.5 text-xs text-[#64748B] dark:border-[#1E293B] dark:text-[#94A3B8]">
                        <span>
                          {item.sectorName} · {item.groupCode} — {item.groupName}
                        </span>
                        {item.notes && (
                          <p className="mt-1 text-[#334155] dark:text-[#CBD5E1]">{item.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More Footer */}
            {filteredCommodities.length > visibleCount && (
              <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 dark:border-[#1E293B] dark:bg-[#0F172A]">
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Menampilkan {displayedCommodities.length.toLocaleString('id-ID')} dari{' '}
                  {filteredCommodities.length.toLocaleString('id-ID')} komoditas Buku 5
                </span>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 250)}
                  className="h-8 rounded-md border border-[#CBD5E1] bg-white px-3.5 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:bg-[#334155]"
                >
                  Tampilkan Lebih Banyak
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
