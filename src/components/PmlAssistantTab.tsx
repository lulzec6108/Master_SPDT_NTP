import React, { useState, useMemo } from 'react';
import { QuestionnaireId } from '../types';
import {
  PML_CHECKLIST_RULES,
  QUESTIONNAIRE_LIST,
  ROKOK_REFERENCE_CODES,
} from '../data/pmlRules';

interface PmlAssistantTabProps {
  checkedRuleIds: string[];
  onToggleRule: (ruleId: string) => void;
  onResetChecklist: (questionnaire?: QuestionnaireId) => void;
  onCopyText: (text: string, label: string) => void;
}

interface MergerRow {
  id: string;
  brandOrNote: string;
  col4QtyBeli: string;
  col5ValBeli: string;
  col17QtyProd: string;
  col18ValProd: string;
}

export const PmlAssistantTab: React.FC<PmlAssistantTabProps> = ({
  checkedRuleIds,
  onToggleRule,
  onResetChecklist,
  onCopyText,
}) => {
  const [activeTool, setActiveTool] = useState<'MERGER' | 'SANITY' | 'CHECKLIST'>('MERGER');
  const [selectedDoc, setSelectedDoc] = useState<QuestionnaireId>('SPDT26-K');

  // Merger Calculator State
  const [selectedRokokCode, setSelectedRokokCode] = useState('0141003');
  const [customMergeCode, setCustomMergeCode] = useState('0141003');
  const [customMergeName, setCustomMergeName] = useState('SIGARET KRETEK MESIN (SKM)');
  const [mergerRows, setMergerRows] = useState<MergerRow[]>([
    {
      id: 'r1',
      brandOrNote: 'Merek 1',
      col4QtyBeli: '32',
      col5ValBeli: '70000',
      col17QtyProd: '0',
      col18ValProd: '0',
    },
    {
      id: 'r2',
      brandOrNote: 'Merek 2',
      col4QtyBeli: '16',
      col5ValBeli: '34000',
      col17QtyProd: '16',
      col18ValProd: '34000',
    },
  ]);

  // Sanity Checker State
  const [luasTanamCol5, setLuasTanamCol5] = useState('2500');
  const [luasPanenCol7, setLuasPanenCol7] = useState('2400');
  const [totalProdCol8, setTotalProdCol8] = useState('1200');
  const [totalNilaiCol9, setTotalNilaiCol9] = useState('8400000');
  const [dijualQtyCol10, setDijualQtyCol10] = useState('950');
  const [konsumsiQtyCol12, setKonsumsiQtyCol12] = useState('200');
  const [lainnyaQtyCol13, setLainnyaQtyCol13] = useState('50');
  const [artCount, setArtCount] = useState('4');
  const [berasWeeklyKg, setBerasWeeklyKg] = useState('7.5');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyWithFeedback = (text: string, key: string, label: string) => {
    setCopiedKey(key);
    onCopyText(text, label);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1400);
  };

  const currentRules = useMemo(
    () => PML_CHECKLIST_RULES.filter((r) => r.questionnaire === selectedDoc),
    [selectedDoc]
  );

  const mergerTotals = useMemo(() => {
    let col4 = 0;
    let col5 = 0;
    let col17 = 0;
    let col18 = 0;

    mergerRows.forEach((row) => {
      col4 += parseFloat(row.col4QtyBeli || '0') || 0;
      col5 += parseFloat(row.col5ValBeli || '0') || 0;
      col17 += parseFloat(row.col17QtyProd || '0') || 0;
      col18 += parseFloat(row.col18ValProd || '0') || 0;
    });

    return {
      col4: Number(col4.toFixed(2)),
      col5: Math.round(col5),
      col17: Number(col17.toFixed(2)),
      col18: Math.round(col18),
      col19TotalQty: Number((col4 + col17).toFixed(2)),
      col20TotalVal: Math.round(col5 + col18),
    };
  }, [mergerRows]);

  const handleSelectRokokPreset = (code: string) => {
    setSelectedRokokCode(code);
    const found = ROKOK_REFERENCE_CODES.find((r) => r.code === code);
    if (found) {
      setCustomMergeCode(found.code);
      setCustomMergeName(found.type);
    }
  };

  const addMergerRow = () => {
    setMergerRows((prev) => [
      ...prev,
      {
        id: `r_${Date.now()}`,
        brandOrNote: `Merek ${prev.length + 1}`,
        col4QtyBeli: '0',
        col5ValBeli: '0',
        col17QtyProd: '0',
        col18ValProd: '0',
      },
    ]);
  };

  const updateMergerRow = (id: string, field: keyof MergerRow, value: string) => {
    setMergerRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeMergerRow = (id: string) => {
    if (mergerRows.length <= 1) return;
    setMergerRows((prev) => prev.filter((r) => r.id !== id));
  };

  const sanityResult = useMemo(() => {
    const tanam = parseFloat(luasTanamCol5 || '0') || 0;
    const panen = parseFloat(luasPanenCol7 || '0') || 0;
    const totalProd = parseFloat(totalProdCol8 || '0') || 0;
    const totalNilai = parseFloat(totalNilaiCol9 || '0') || 0;
    const dijual = parseFloat(dijualQtyCol10 || '0') || 0;
    const konsumsi = parseFloat(konsumsiQtyCol12 || '0') || 0;
    const lainnya = parseFloat(lainnyaQtyCol13 || '0') || 0;

    const sumDistribusi = Number((dijual + konsumsi + lainnya).toFixed(2));
    const selisihProd = Number((totalProd - sumDistribusi).toFixed(2));
    const isLuasValid = panen <= tanam;
    const isDistribusiValid = Math.abs(selisihProd) < 0.001;
    const unitPrice = totalProd > 0 ? Math.round(totalNilai / totalProd) : 0;

    return {
      tanam,
      panen,
      totalProd,
      sumDistribusi,
      selisihProd,
      isLuasValid,
      isDistribusiValid,
      unitPrice,
    };
  }, [
    luasTanamCol5,
    luasPanenCol7,
    totalProdCol8,
    totalNilaiCol9,
    dijualQtyCol10,
    konsumsiQtyCol12,
    lainnyaQtyCol13,
  ]);

  const perCapitaBeras = useMemo(() => {
    const art = Math.max(1, parseInt(artCount || '1', 10) || 1);
    const kg = parseFloat(berasWeeklyKg || '0') || 0;
    const perCapita = Number((kg / art).toFixed(2));
    const isNormal = perCapita >= 0.8 && perCapita <= 3.2;
    return { perCapita, isNormal };
  }, [artCount, berasWeeklyKg]);

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  return (
    <div className="space-y-5">
      {/* STICKY SUB-NAVIGATION FOR PML TOOLS */}
      <div className="sticky top-[57px] z-20 -mx-5 border-b border-[#E2E8F0] bg-[#F8FAFC]/95 px-5 py-3 backdrop-blur-xs sm:-mx-8 sm:px-8 dark:border-[#1E293B] dark:bg-[#0B0F19]/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-md border border-[#E2E8F0] bg-white p-0.5 dark:border-[#1E293B] dark:bg-[#111827]">
            {(
              [
                { id: 'MERGER', label: 'Gabung Rokok & Komoditas' },
                { id: 'SANITY', label: 'Uji Kewajaran Angka' },
                { id: 'CHECKLIST', label: 'Checklist Kuesioner' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTool(tab.id)}
                className={`h-8 rounded px-3.5 text-xs font-semibold whitespace-nowrap transition ${
                  activeTool === tab.id
                    ? 'bg-[#003D7A] text-white dark:bg-[#1E3A8A] dark:text-white'
                    : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <a
            href="/assets/aistudio/Buku_6_Pedoman_Pemeriksaan_SPDT_NTP_2026_bff80b8e.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#64748B] transition hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:text-[#38BDF8]"
          >
            Dokumen Buku 6 (PDF) ↗
          </a>
        </div>
      </div>

      {/* =====================================================================
          TOOL 1: MERGER CALCULATOR
         ===================================================================== */}
      {activeTool === 'MERGER' && (
        <div className="space-y-5">
          {/* Quick Rokok Code Selector (Exact Buku 5 Codes & BATANG Unit) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROKOK_REFERENCE_CODES.map((rk) => {
              const isSelected = selectedRokokCode === rk.code;
              return (
                <div
                  key={rk.code}
                  onClick={() => handleSelectRokokPreset(rk.code)}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    isSelected
                      ? 'border-[#003D7A] bg-white dark:border-[#38BDF8] dark:bg-[#111827]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] dark:border-[#1E293B] dark:bg-[#111827] dark:hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="tabular-code text-base font-bold text-[#003D7A] dark:text-[#38BDF8]">
                      {rk.code}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyWithFeedback(rk.code, `rk_${rk.code}`, rk.code);
                      }}
                      className="rounded border border-[#CBD5E1] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#0F172A] hover:bg-[#003D7A] hover:text-white dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
                    >
                      {copiedKey === `rk_${rk.code}` ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <div className="mt-1.5 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {rk.type}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-[#15803D] dark:text-[#4ADE80]">
                    Satuan Buku 5: {rk.unit}
                  </div>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">{rk.examples}</p>
                </div>
              );
            })}
          </div>

          {/* Calculator Box */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
            <div className="flex flex-col gap-3 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#1E293B]">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Kalkulator Penggabungan Baris Komoditas Berkode Sama (Blok V)
                </h3>
                <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Jumlahkan beberapa baris komoditas berkode 7 digit sama menjadi satu baris tunggal sesuai Buku 6 Hal. 15.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customMergeCode}
                  onChange={(e) => setCustomMergeCode(e.target.value)}
                  className="tabular-code h-9 w-24 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-bold text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#38BDF8]"
                />
                <input
                  type="text"
                  value={customMergeName}
                  onChange={(e) => setCustomMergeName(e.target.value)}
                  className="h-9 w-52 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {mergerRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:grid-cols-12 sm:items-end dark:border-[#1E293B] dark:bg-[#0F172A]"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Catatan / Merek
                    </label>
                    <input
                      type="text"
                      value={row.brandOrNote}
                      onChange={(e) => updateMergerRow(row.id, 'brandOrNote', e.target.value)}
                      className="mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Kol (4) Qty Beli
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={row.col4QtyBeli}
                      onChange={(e) => updateMergerRow(row.id, 'col4QtyBeli', e.target.value)}
                      className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Kol (5) Nilai Beli
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={row.col5ValBeli}
                      onChange={(e) => updateMergerRow(row.id, 'col5ValBeli', e.target.value)}
                      className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Kol (17) Qty Prod
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={row.col17QtyProd}
                      onChange={(e) => updateMergerRow(row.id, 'col17QtyProd', e.target.value)}
                      className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Kol (18) Nilai Prod
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={row.col18ValProd}
                      onChange={(e) => updateMergerRow(row.id, 'col18ValProd', e.target.value)}
                      className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div className="flex justify-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeMergerRow(row.id)}
                      disabled={mergerRows.length <= 1}
                      className="h-9 rounded px-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={addMergerRow}
                className="h-8 rounded-md border border-[#CBD5E1] bg-white px-3.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                + Tambah Baris
              </button>
            </div>

            {/* Clean Result Summary */}
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-6 dark:border-[#1E293B] dark:bg-[#0F172A]">
              <div>
                <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (4) Qty Beli
                </div>
                <div className="tabular-code mt-1 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {mergerTotals.col4}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (5) Nilai Beli
                </div>
                <div className="tabular-code mt-1 text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Rp {formatRupiah(mergerTotals.col5)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (17) Qty Prod
                </div>
                <div className="tabular-code mt-1 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {mergerTotals.col17}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (18) Nilai Prod
                </div>
                <div className="tabular-code mt-1 text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Rp {formatRupiah(mergerTotals.col18)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#003D7A] dark:text-[#38BDF8]">
                  Kol (19) Total Qty
                </div>
                <div className="tabular-code mt-1 text-base font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                  {mergerTotals.col19TotalQty}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#15803D] dark:text-[#4ADE80]">
                  Kol (20) Total Nilai
                </div>
                <div className="tabular-code mt-1 text-sm font-extrabold text-[#15803D] dark:text-[#4ADE80]">
                  Rp {formatRupiah(mergerTotals.col20TotalVal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TOOL 2: SANITY CHECKER
         ===================================================================== */}
      {activeTool === 'SANITY' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Subsector Production Balance */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Uji Keseimbangan Produksi Subsektor (Blok III)
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (5) Luas / Pohon Tanam
                </label>
                <input
                  type="number"
                  value={luasTanamCol5}
                  onChange={(e) => setLuasTanamCol5(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (7) Luas / Pohon Panen
                </label>
                <input
                  type="number"
                  value={luasPanenCol7}
                  onChange={(e) => setLuasPanenCol7(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                  Kol (8) Total Produksi
                </label>
                <input
                  type="number"
                  value={totalProdCol8}
                  onChange={(e) => setTotalProdCol8(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#003D7A] bg-white px-3 text-sm font-bold text-[#003D7A] dark:border-[#38BDF8] dark:bg-[#0F172A] dark:text-[#38BDF8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (9) Nilai Produksi (Rp)
                </label>
                <input
                  type="number"
                  value={totalNilaiCol9}
                  onChange={(e) => setTotalNilaiCol9(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (10) Dijual
                </label>
                <input
                  type="number"
                  value={dijualQtyCol10}
                  onChange={(e) => setDijualQtyCol10(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (12) Dikonsumsi
                </label>
                <input
                  type="number"
                  value={konsumsiQtyCol12}
                  onChange={(e) => setKonsumsiQtyCol12(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Kol (13) Lainnya (Bibit / Pakan / Bagi Hasil)
                </label>
                <input
                  type="number"
                  value={lainnyaQtyCol13}
                  onChange={(e) => setLainnyaQtyCol13(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-[#E2E8F0] pt-4 text-xs dark:border-[#1E293B]">
              <div
                className={`rounded-md border px-3.5 py-2.5 font-semibold ${
                  sanityResult.isLuasValid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {sanityResult.isLuasValid
                  ? `Valid: Luas Panen (${sanityResult.panen}) ≤ Luas Tanam (${sanityResult.tanam})`
                  : `Periksa: Luas Panen (${sanityResult.panen}) melebihi Luas Tanam (${sanityResult.tanam})`}
              </div>

              <div
                className={`rounded-md border px-3.5 py-2.5 font-semibold ${
                  sanityResult.isDistribusiValid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {sanityResult.isDistribusiValid
                  ? `Valid: Total Produksi (${sanityResult.totalProd}) = Jumlah Distribusi (${sanityResult.sumDistribusi})`
                  : `Selisih ${sanityResult.selisihProd} antara Kolom (8) dan Kolom (10+12+13)`}
              </div>

              <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 dark:border-[#1E293B] dark:bg-[#0F172A]">
                <span className="text-[#64748B] dark:text-[#94A3B8]">
                  Harga Implisit per Satuan
                </span>
                <span className="tabular-code font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Rp {formatRupiah(sanityResult.unitPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Rice Consumption Check */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Uji Kewajaran Beras Seminggu per ART (SPDT26-K)
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Jumlah ART
                </label>
                <input
                  type="number"
                  min={1}
                  value={artCount}
                  onChange={(e) => setArtCount(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Beras Seminggu Kol (19) (KG)
                </label>
                <input
                  type="number"
                  step="any"
                  value={berasWeeklyKg}
                  onChange={(e) => setBerasWeeklyKg(e.target.value)}
                  className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div
              className={`mt-5 rounded-md border p-4 text-xs ${
                perCapitaBeras.isNormal
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Konsumsi Beras per Kapita Seminggu</span>
                <span className="tabular-code text-base">{perCapitaBeras.perCapita} KG / ART</span>
              </div>
              <p className="mt-1.5 text-xs opacity-90">
                {perCapitaBeras.isNormal
                  ? 'Berada dalam rentang wajar (0,8 – 3,2 kg/orang/minggu).'
                  : 'Di luar rentang rata-rata (0,8 – 3,2 kg). Pastikan hanya mencatat yang benar-benar dikonsumsi seminggu terakhir atau beri penjelasan di Blok III Catatan.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TOOL 3: CONCISE QUESTIONNAIRE CHECKLIST
         ===================================================================== */}
      {activeTool === 'CHECKLIST' && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3.5 dark:border-[#1E293B]">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {QUESTIONNAIRE_LIST.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedDoc(q.id)}
                  className={`h-8 shrink-0 rounded px-3 text-xs font-semibold whitespace-nowrap transition ${
                    selectedDoc === q.id
                      ? 'bg-[#003D7A] text-white dark:bg-[#0284C7]'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] dark:bg-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {q.shortName}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onResetChecklist(selectedDoc)}
              className="text-xs font-semibold text-[#64748B] hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:text-[#38BDF8]"
            >
              Reset Centang
            </button>
          </div>

          <div className="mt-3 divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
            {currentRules.map((rule) => {
              const isChecked = checkedRuleIds.includes(rule.id);
              return (
                <label
                  key={rule.id}
                  className={`flex cursor-pointer items-start gap-3.5 py-3.5 transition ${
                    isChecked ? 'opacity-55' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleRule(rule.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-[#CBD5E1] text-[#003D7A] dark:border-[#475569]"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                      <span>{rule.block}</span>
                      <span className="text-[#CBD5E1] dark:text-[#475569]">·</span>
                      <span className="font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {rule.referencePage}
                      </span>
                    </div>
                    <h4
                      className={`mt-0.5 text-sm font-semibold ${
                        isChecked
                          ? 'line-through text-[#64748B] dark:text-[#64748B]'
                          : 'text-[#0F172A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      {rule.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                      {rule.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
