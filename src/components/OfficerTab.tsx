import React, { useMemo, useState } from 'react';
import { OfficerItem } from '../types';

interface OfficerTabProps {
  officers: OfficerItem[];
  onCopyCode: (code: string, label: string) => void;
  isAdmin: boolean;
  onOpenAddOfficer: () => void;
  onOpenEditOfficer: (item: OfficerItem) => void;
  onDeleteOfficer: (code: string) => void;
  onImportOfficersCsv: (csvText: string) => { ok: boolean; count: number; message: string };
}

export const OfficerTab: React.FC<OfficerTabProps> = ({
  officers,
  onCopyCode,
  isAdmin,
  onOpenAddOfficer,
  onOpenEditOfficer,
  onDeleteOfficer,
  onImportOfficersCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PCL' | 'PML'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  const filteredOfficers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return officers.filter((item) => {
      if (roleFilter !== 'ALL' && item.role !== roleFilter) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    });
  }, [officers, searchQuery, roleFilter]);

  const handleCopy = (code: string, name: string) => {
    setCopiedCode(code);
    onCopyCode(code, `${code} · ${name}`);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 1400);
  };

  const handleExportCsv = () => {
    const header = 'kode_petugas,nama_petugas,peran\n';
    const rows = officers
      .map((o) => `${o.code},"${o.name.replace(/"/g, '""')}",${o.role || 'PCL'}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kode_petugas_spdt_ntp_2026.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const res = onImportOfficersCsv(text);
      setCsvFeedback(res.message);
      setTimeout(() => setCsvFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {/* STICKY SEARCH & ROLE FILTER BAR */}
      <div className="sticky top-[57px] z-20 -mx-5 border-b border-[#E2E8F0] bg-[#F8FAFC]/95 px-5 py-3.5 backdrop-blur-xs sm:-mx-8 sm:px-8 dark:border-[#1E293B] dark:bg-[#0B0F19]/95">
        <div className="mx-auto max-w-6xl space-y-2.5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama petugas atau kode 3 digit (001 – 045)..."
                className="h-10 w-full rounded-md border border-[#CBD5E1] bg-white pr-24 pl-10 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8]"
              />
              <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="rounded px-2 py-0.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
                  >
                    Reset
                  </button>
                )}
                <span className="tabular-code text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  {filteredOfficers.length} petugas
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center rounded-md border border-[#E2E8F0] bg-white p-0.5 dark:border-[#1E293B] dark:bg-[#111827]">
                {(
                  [
                    { id: 'ALL', label: `Semua (${officers.length})` },
                    { id: 'PCL', label: 'PCL' },
                    { id: 'PML', label: 'PML' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoleFilter(tab.id)}
                    className={`h-8 rounded px-3 text-xs font-semibold whitespace-nowrap transition ${
                      roleFilter === tab.id
                        ? 'bg-[#003D7A] text-white dark:bg-[#1E3A8A] dark:text-white'
                        : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAddOfficer}
                  className="h-9 rounded-md bg-[#003D7A] px-3 text-xs font-semibold whitespace-nowrap text-white hover:bg-[#002B57] dark:bg-[#0284C7]"
                >
                  + Petugas
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-semibold text-[#64748B] dark:text-[#94A3B8]">
              <a
                href="./assets/aistudio/kode_petugas__1__79773466.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[#003D7A] dark:hover:text-[#38BDF8]"
              >
                Dokumen Kode Petugas (PDF) ↗
              </a>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={handleExportCsv}
                className="transition hover:text-[#003D7A] dark:hover:text-[#38BDF8]"
              >
                Unduh CSV
              </button>
              <span aria-hidden="true">·</span>
              <label className="cursor-pointer transition hover:text-[#003D7A] dark:hover:text-[#38BDF8]">
                Impor CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {csvFeedback && (
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {csvFeedback}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SCROLLABLE STRUCTURED OFFICER DIRECTORY */}
      <div className="mt-4 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white dark:border-[#1E293B] dark:bg-[#111827]">
        <div className="hidden grid-cols-12 items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-[11px] font-semibold text-[#64748B] sm:grid dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
          <div className="col-span-2">Kode 3-Digit</div>
          <div className="col-span-6">Nama Lengkap Petugas Lapangan</div>
          <div className="col-span-2">Jabatan</div>
          <div className="col-span-2 text-right">Tindakan</div>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
          {filteredOfficers.map((officer) => {
            const isCopied = copiedCode === officer.code;
            return (
              <div
                key={officer.code}
                className="grid grid-cols-1 items-center gap-2 px-4 py-3 transition hover:bg-[#F8FAFC] sm:grid-cols-12 sm:gap-4 sm:px-5 dark:hover:bg-[#1E293B]/50"
              >
                <div className="flex items-center justify-between sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(officer.code, officer.name)}
                    className="tabular-code text-base font-bold tracking-tight text-[#003D7A] hover:underline dark:text-[#38BDF8]"
                  >
                    {officer.code}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(officer.code, officer.name)}
                    className={`h-8 rounded px-3 text-xs font-semibold transition sm:hidden ${
                      isCopied
                        ? 'bg-[#15803D] text-white'
                        : 'border border-[#CBD5E1] bg-white text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                    }`}
                  >
                    {isCopied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>

                <div className="sm:col-span-6">
                  <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {officer.name}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {officer.role || 'PCL'}
                  </span>
                </div>

                <div className="hidden items-center justify-end gap-1.5 sm:col-span-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => handleCopy(officer.code, officer.name)}
                    className={`h-8 min-w-[72px] rounded px-3 text-xs font-semibold transition ${
                      isCopied
                        ? 'bg-[#15803D] text-white'
                        : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#003D7A] hover:bg-[#003D7A] hover:text-white dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8] dark:hover:bg-[#0284C7]'
                    }`}
                  >
                    {isCopied ? 'Tersalin' : 'Salin'}
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenEditOfficer(officer)}
                        className="h-8 rounded px-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteOfficer(officer.code)}
                        className="h-8 rounded px-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
