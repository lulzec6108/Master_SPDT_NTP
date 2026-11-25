import React, { useMemo, useState } from 'react';
import { CommodityItem, OfficerItem } from '../types';

interface LocalAssistantTabProps {
  commodities: CommodityItem[];
  officers: OfficerItem[];
  onCopyCode: (code: string, label: string) => void;
}

interface MissingScenario {
  id: string;
  label: string;
  doc: string;
  items: {
    code: string;
    name: string;
    block: string;
    reason: string;
  }[];
}

const MISSING_SCENARIOS: MissingScenario[] = [
  {
    id: 'memasak',
    label: 'Rumah Tangga Memasak',
    doc: 'SPDT26-K',
    items: [
      { code: '0111001', name: 'BERAS', block: 'Blok V', reason: 'Makanan pokok utama' },
      { code: '0115002', name: 'MINYAK GORENG', block: 'Blok V', reason: 'Wajib ada jika memasak' },
      { code: '0119032', name: 'GARAM', block: 'Blok V', reason: 'Bumbu dasar wajib' },
      { code: '0117051', name: 'BAWANG MERAH', block: 'Blok V', reason: 'Bumbu dasar memasak' },
      { code: '0117052', name: 'BAWANG PUTIH', block: 'Blok V', reason: 'Bumbu dasar memasak' },
      { code: '0342001', name: 'GAS LPG', block: 'Blok VI (03.4)', reason: 'Bahan bakar memasak (atau Kayu Bakar 0344002)' },
      { code: '0461012', name: 'SABUN CAIR/CUCI PIRING', block: 'Blok VI (04.6)', reason: 'Pemeliharaan dapur wajib' },
    ],
  },
  {
    id: 'wajib_rt',
    label: 'Pengeluaran Rutin Wajib RT',
    doc: 'SPDT26-K',
    items: [
      { code: '0312001', name: 'PERKIRAAN SEWA RUMAH MILIK SENDIRI', block: 'Blok VI (03.1)', reason: 'Wajib diisi sesuai status rumah' },
      { code: '0331001', name: 'BIAYA AIR PDAM', block: 'Blok VI (03.3)', reason: 'Subkelompok 03.3 wajib ada isian (atau Non-PDAM 0331002)' },
      { code: '0341001', name: 'BIAYA LISTRIK', block: 'Blok VI (03.4)', reason: 'Subkelompok 03.4 wajib ada isian' },
      { code: '0461005', name: 'SABUN DETERGEN BUBUK', block: 'Blok VI (04.6)', reason: 'Subkelompok 04.6 wajib ada isian' },
      { code: '1112005', name: 'SABUN MANDI', block: 'Blok VI (11.1.2)', reason: 'Kelas 11.1.2 Sabun Mandi wajib terisi' },
      { code: '1112004', name: 'PASTA GIGI', block: 'Blok VI (11.1.2)', reason: 'Kelas 11.1.2 Pasta Gigi wajib terisi' },
      { code: '1112012', name: 'SIKAT GIGI', block: 'Blok VI (11.1.2)', reason: 'Kelas 11.1.2 Sikat Gigi wajib dicek' },
    ],
  },
  {
    id: 'art_perempuan',
    label: 'Ada ART Perempuan > 10 Tahun',
    doc: 'SPDT26-K',
    items: [
      { code: '1112002', name: 'PEMBALUT WANITA', block: 'Blok VI (11.1.2)', reason: 'Uji silang ART perempuan usia produktif' },
      { code: '1112011', name: 'SAMPO', block: 'Blok VI (11.1.2)', reason: 'Perawatan pribadi Kelas 11.1.2' },
      { code: '1112006', name: 'BEDAK', block: 'Blok VI (11.1.2)', reason: 'Perawatan pribadi Kelas 11.1.2' },
      { code: '1112009', name: 'HAND BODY LOTION', block: 'Blok VI (11.1.2)', reason: 'Perawatan pribadi Kelas 11.1.2' },
      { code: '1112008', name: 'PARFUM', block: 'Blok VI (11.1.2)', reason: 'Perawatan pribadi Kelas 11.1.2' },
    ],
  },
  {
    id: 'anak_sekolah',
    label: 'Ada ART Masih Sekolah',
    doc: 'SPDT26-K',
    items: [
      { code: '0910002', name: 'UANG BAYARAN SEKOLAH SD', block: 'Blok VI (09.1/09.2)', reason: 'Biaya pendidikan ART sekolah (SMP 0920001 / SMA 0920002)' },
      { code: '0861001', name: 'BUKU TULIS', block: 'Blok VI (08.6)', reason: 'Wajib dicek jika ada biaya pendidikan' },
      { code: '0864001', name: 'PENSIL HITAM', block: 'Blok VI (08.6)', reason: 'Alat tulis (atau Pulpen/Ballpoint 0864003)' },
      { code: '0212026', name: 'SERAGAM SEKOLAH PRIA', block: 'Blok VI (02.1)', reason: 'Seragam sekolah pria (0212026) / wanita (0212056)' },
    ],
  },
  {
    id: 'kendaraan',
    label: 'Menggunakan Sepeda Motor',
    doc: 'SPDT26-K',
    items: [
      { code: '0622003', name: 'BENSIN SUBSIDI', block: 'Blok VI (06.2.2)', reason: 'Wajib ada jika memiliki motor (atau Bensin Nonsubsidi 0622004)' },
      { code: '0622005', name: 'OLI/PELUMAS', block: 'Blok VI (06.2.2)', reason: 'Perawatan rutin kendaraan' },
      { code: '0623008', name: 'SERVICE SUKU CADANG', block: 'Blok VI (06.2.3)', reason: 'Pemeliharaan kendaraan (atau Tambal Ban 0623007)' },
      { code: '1140002', name: 'PAJAK KENDARAAN BERMOTOR (STNK)', block: 'Blok VI (11.4)', reason: 'Pajak tahunan kendaraan bermotor' },
    ],
  },
  {
    id: 'pembantu',
    label: 'Ada Asisten RT (Kode Hubungan 8)',
    doc: 'SPDT26-K',
    items: [
      { code: '0462001', name: 'UPAH ASISTEN RUMAH TANGGA', block: 'Blok VI (04.6)', reason: 'Wajib terisi jika Blok IV ada kode hubungan 8' },
    ],
  },
  {
    id: 'bagi_hasil',
    label: 'Lahan Bagi Hasil (Kode 2 atau 3)',
    doc: 'SPDT26-TP / TH / TPR',
    items: [
      { code: '2206018', name: 'BIAYA BAGI HASIL (TANAMAN PANGAN)', block: 'Blok IV', reason: 'Wajib isi Nilai Rp & Persentase (%) di Kolom 2' },
      { code: '3207015', name: 'BIAYA BAGI HASIL (HORTIKULTURA)', block: 'Blok IV', reason: 'Wajib isi Nilai Rp & Persentase (%) di Kolom 2' },
      { code: '4205013', name: 'BIAYA BAGI HASIL (PERKEBUNAN)', block: 'Blok IV', reason: 'Wajib isi Nilai Rp & Persentase (%) di Kolom 2' },
    ],
  },
  {
    id: 'petani_karet_sawit',
    label: 'Petani Karet / Kelapa Sawit',
    doc: 'SPDT26-TPR',
    items: [
      { code: '4102010', name: 'KARET', block: 'Blok III', reason: 'Satuan Tanam: POHON · Produksi: KG' },
      { code: '4205014', name: 'ASAM SEMUT', block: 'Blok IV', reason: 'Pembeku getah karet (atau Cuka Getah 4205017)' },
      { code: '4207023', name: 'PISAU SADAP KARET', block: 'Blok IV', reason: 'Alat sadap karet (Mangkok Karet 4205008)' },
      { code: '4102012', name: 'KELAPA SAWIT', block: 'Blok III', reason: 'Satuan Tanam: POHON · Produksi: KG' },
      { code: '4207004', name: 'DODOS SAWIT', block: 'Blok IV', reason: 'Alat panen sawit (atau Egrek Sawit 4207006)' },
      { code: '4203009', name: 'ROUNDUP', block: 'Blok IV', reason: 'Herbisida kebun (atau Gramoxone 4203007)' },
    ],
  },
];

const SYNONYM_MAP: Record<string, string[]> = {
  surya: ['0141003'],
  mild: ['0141003'],
  sampoerna: ['0141003', '0141002'],
  filter: ['0141003'],
  skm: ['0141003'],
  marlboro: ['0141001'],
  dunhill: ['0141001'],
  spm: ['0141001'],
  kretek: ['0141002', '0141003'],
  skt: ['0141002'],
  spt: ['0141004'],
  odol: ['1112004'],
  deterjen: ['0461005', '0461013'],
  rinso: ['0461005', '0461013'],
  sunlight: ['0461012'],
  elpiji: ['0342001'],
  lpg: ['0342001'],
  listrik: ['0341001'],
  pln: ['0341001'],
  pdam: ['0331001'],
  pertalite: ['0622003'],
  pertamax: ['0622004'],
  bensin: ['0622003', '0622004'],
  haruan: ['6101007', '0113075'],
  gabus: ['6101007', '0113075'],
  toman: ['6101028', '7103028', '0113099'],
  arwana: ['7104004', '7204004'],
};

export const LocalAssistantTab: React.FC<LocalAssistantTabProps> = ({
  commodities,
  officers,
  onCopyCode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([
    'wajib_rt',
    'memasak',
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, label: string, key: string) => {
    setCopiedKey(key);
    onCopyCode(code, `${code} · ${label}`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1400);
  };

  const toggleScenario = (id: string) => {
    setSelectedScenarioIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const assistantResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const tokens = q.split(/\s+/).filter((t) => t.length > 1);
    const matchedSynonymCodes = new Set<string>();

    tokens.forEach((tok) => {
      Object.entries(SYNONYM_MAP).forEach(([key, codes]) => {
        if (key.includes(tok) || tok.includes(key)) {
          codes.forEach((c) => matchedSynonymCodes.add(c));
        }
      });
    });

    const matchedCommodities = commodities
      .filter((item) => {
        if (matchedSynonymCodes.has(item.code)) return true;
        const haystack = `${item.code} ${item.name} ${item.groupName}`.toLowerCase();
        return tokens.every((tok) => haystack.includes(tok)) || haystack.includes(q);
      })
      .slice(0, 12);

    const matchedOfficers = officers
      .filter((off) => {
        const haystack = `${off.code} ${off.name} ${off.role || ''}`.toLowerCase();
        return tokens.some((tok) => haystack.includes(tok));
      })
      .slice(0, 6);

    return {
      commodities: matchedCommodities,
      officers: matchedOfficers,
    };
  }, [query, commodities, officers]);

  const activeScenarios = useMemo(
    () => MISSING_SCENARIOS.filter((s) => selectedScenarioIds.includes(s.id)),
    [selectedScenarioIds]
  );

  return (
    <div className="space-y-6">
      {/* STICKY QUERY BAR FOR LOCAL ASSISTANT */}
      <div className="sticky top-[57px] z-20 -mx-5 border-b border-[#E2E8F0] bg-[#F8FAFC]/95 px-5 py-3.5 backdrop-blur-xs sm:-mx-8 sm:px-8 dark:border-[#1E293B] dark:bg-[#0B0F19]/95">
        <div className="mx-auto max-w-6xl space-y-2.5">
          <div className="relative">
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Crosscheck Pemeriksaan: ketik nama komoditas Buku 5, sinonim lapangan, atau nama petugas (contoh: rokok surya, odol, asam semut, arwana)..."
              className="h-10 w-full rounded-md border border-[#CBD5E1] bg-white pr-20 pl-10 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded px-2 py-0.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: 'Sigaret Kretek Mesin (SKM)', q: '0141003' },
              { label: 'Sigaret Putih Mesin (SPM)', q: '0141001' },
              { label: 'Perawatan Pribadi (11.1.2)', q: '1112' },
              { label: 'Karet & Sawit (4102)', q: '4102' },
              { label: 'Ikan Perairan Umum (6101)', q: '6101' },
              { label: 'Ikan Hias / Arwana (7104)', q: 'arwana' },
              { label: 'Biaya Bagi Hasil', q: 'biaya bagi hasil' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setQuery(chip.q)}
                className="h-7 rounded border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold whitespace-nowrap text-[#475569] transition hover:border-[#CBD5E1] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#94A3B8] dark:hover:border-[#334155] dark:hover:text-[#F8FAFC]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instant Query Results */}
      {assistantResults && (
        <div className="space-y-4">
          {assistantResults.commodities.length === 0 &&
          assistantResults.officers.length === 0 ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center dark:border-[#1E293B] dark:bg-[#111827]">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Tidak ditemukan kode di Buku 5 untuk &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                Database hanya memuat komoditas resmi dari Buku 5 Master Komoditas SPDT NTP 2026.
              </p>
            </div>
          ) : (
            <>
              {assistantResults.commodities.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white dark:border-[#1E293B] dark:bg-[#111827]">
                  <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-xs font-semibold text-[#64748B] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                    Hasil Pencarian Komoditas Buku 5 ({assistantResults.commodities.length})
                  </div>
                  <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                    {assistantResults.commodities.map((item) => {
                      const key = `ast_c_${item.code}`;
                      const isCopied = copiedKey === key;
                      return (
                        <div
                          key={item.code}
                          className="flex flex-col justify-between gap-2 px-5 py-3 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-baseline gap-4">
                            <span className="tabular-code w-20 shrink-0 text-base font-bold text-[#003D7A] dark:text-[#38BDF8]">
                              {item.code}
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                {item.name}
                              </div>
                              <div className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                                Satuan: <strong className="text-[#334155] dark:text-[#E2E8F0]">{item.unit}</strong>
                                {item.plantUnit ? ` · Tanam: ${item.plantUnit}` : ''} ·{' '}
                                {item.questionnaireCode}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(item.code, item.name, key)}
                            className={`h-8 min-w-[72px] self-end rounded px-3 text-xs font-semibold transition sm:self-auto ${
                              isCopied
                                ? 'bg-[#15803D] text-white'
                                : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#003D7A] hover:bg-[#003D7A] hover:text-white dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                            }`}
                          >
                            {isCopied ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {assistantResults.officers.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white dark:border-[#1E293B] dark:bg-[#111827]">
                  <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-xs font-semibold text-[#64748B] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                    Hasil Kode Petugas 3-Digit ({assistantResults.officers.length})
                  </div>
                  <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                    {assistantResults.officers.map((off) => {
                      const key = `ast_o_${off.code}`;
                      const isCopied = copiedKey === key;
                      return (
                        <div
                          key={off.code}
                          className="flex items-center justify-between px-5 py-3"
                        >
                          <div className="flex items-baseline gap-4">
                            <span className="tabular-code w-20 shrink-0 text-base font-bold text-[#003D7A] dark:text-[#38BDF8]">
                              {off.code}
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                {off.name}
                              </div>
                              <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                                {off.role || 'PCL'}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(off.code, off.name, key)}
                            className={`h-8 min-w-[72px] rounded px-3 text-xs font-semibold transition ${
                              isCopied
                                ? 'bg-[#15803D] text-white'
                                : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#003D7A] hover:bg-[#003D7A] hover:text-white dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                            }`}
                          >
                            {isCopied ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Section 2: Interactive "Cek Apa yang Terlewat" (Missing Item Detector) */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Pemeriksaan Rincian Wajib & Kode yang Sering Terlewat
          </h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
            Pilih karakteristik rumah tangga sampel untuk menampilkan kode resmi Buku 5 yang wajib diperiksa konsistensinya.
          </p>
        </div>

        {/* Scenario Toggles */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {MISSING_SCENARIOS.map((sc) => {
            const active = selectedScenarioIds.includes(sc.id);
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => toggleScenario(sc.id)}
                className={`h-8 rounded-md border px-3 text-xs font-semibold transition ${
                  active
                    ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                    : 'border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>

        {/* Missing Items Output */}
        <div className="mt-5 space-y-4">
          {activeScenarios.map((sc) => (
            <div
              key={sc.id}
              className="overflow-hidden rounded-lg border border-[#E2E8F0] dark:border-[#1E293B]"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 dark:border-[#1E293B] dark:bg-[#0F172A]">
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {sc.label}
                </h3>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  {sc.doc}
                </span>
              </div>

              <div className="divide-y divide-[#E2E8F0] bg-white dark:divide-[#1E293B] dark:bg-[#111827]">
                {sc.items.map((item) => {
                  const key = `sc_${sc.id}_${item.code}`;
                  const isCopied = copiedKey === key;
                  return (
                    <div
                      key={key}
                      className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="tabular-code w-20 shrink-0 text-base font-bold text-[#003D7A] dark:text-[#38BDF8]">
                          {item.code}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {item.name}
                          </div>
                          <div className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                            <strong className="text-[#334155] dark:text-[#CBD5E1]">
                              {item.block}
                            </strong>{' '}
                            · {item.reason}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.code, item.name, key)}
                        className={`h-8 min-w-[72px] self-end rounded px-3 text-xs font-semibold transition sm:self-auto ${
                          isCopied
                            ? 'bg-[#15803D] text-white'
                            : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#003D7A] hover:bg-[#003D7A] hover:text-white dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                        }`}
                      >
                        {isCopied ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
