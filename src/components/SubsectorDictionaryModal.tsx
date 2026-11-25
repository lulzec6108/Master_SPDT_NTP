import React, { useState } from 'react';
import { SectorId } from '../types';

interface SubsectorDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSectorInDirectory: (sectorId: SectorId) => void;
  onCopyText: (text: string, label: string) => void;
}

export interface SubsectorDictEntry {
  subsectorCode: string; // '1' .. '7'
  name: string;
  questionnaire: string;
  commodityPrefix: string;
  productionPrefix: string;
  costPrefix: string;
  sectorId: SectorId;
  accentClass: string;
  description: string;
}

export const SUBSECTOR_DICTIONARY_ITEMS: SubsectorDictEntry[] = [
  {
    subsectorCode: '1',
    name: 'Tanaman Pangan',
    questionnaire: 'SPDT26-TP',
    commodityPrefix: '21–22',
    productionPrefix: '2101–2103',
    costPrefix: '2201–2207',
    sectorId: '2_TP',
    accentClass: 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950',
    description: 'Padi, Palawija (Jagung, Kedelai, Kacang Tanah, Ubi Kayu, Ubi Jalar, Talas, dll.)',
  },
  {
    subsectorCode: '2',
    name: 'Tanaman Hortikultura',
    questionnaire: 'SPDT26-TH',
    commodityPrefix: '31–32',
    productionPrefix: '3101–3104',
    costPrefix: '3201–3208',
    sectorId: '3_TH',
    accentClass: 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950',
    description: 'Sayuran, Buah-buahan, Tanaman Obat/Biofarmaka, dan Tanaman Hias',
  },
  {
    subsectorCode: '3',
    name: 'Perkebunan Rakyat',
    questionnaire: 'SPDT26-TPR',
    commodityPrefix: '41–42',
    productionPrefix: '4101–4102',
    costPrefix: '4201–4207',
    sectorId: '4_TPR',
    accentClass: 'bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-950',
    description: 'Karet, Kelapa Sawit, Kelapa, Kopi, Kakao, Lada, Cengkeh, Tebu, Tembakau, dll.',
  },
  {
    subsectorCode: '4',
    name: 'Peternakan',
    questionnaire: 'SPDT26-TRK',
    commodityPrefix: '51–52',
    productionPrefix: '5101–5104',
    costPrefix: '5201–5206',
    sectorId: '5_TRK',
    accentClass: 'bg-rose-600 text-white dark:bg-rose-400 dark:text-slate-950',
    description: 'Ternak Besar (Sapi, Kerbau), Ternak Kecil (Kambing, Domba, Babi), Unggas & Hasil Ternak',
  },
  {
    subsectorCode: '5',
    name: 'Perikanan Tangkap',
    questionnaire: 'SPDT26-IKT',
    commodityPrefix: '61–62',
    productionPrefix: '6101–6102',
    costPrefix: '6201–6205',
    sectorId: '6_IKT',
    accentClass: 'bg-blue-700 text-white dark:bg-blue-400 dark:text-slate-950',
    description: 'Penangkapan Ikan di Perairan Umum (Sungai, Danau, Rawa) & Penangkapan Ikan di Laut',
  },
  {
    subsectorCode: '6',
    name: 'Perikanan Budidaya',
    questionnaire: 'SPDT26-IKB',
    commodityPrefix: '71–72',
    productionPrefix: '7101–7104',
    costPrefix: '7201–7206',
    sectorId: '7_IKB',
    accentClass: 'bg-teal-600 text-white dark:bg-teal-400 dark:text-slate-950',
    description: 'Budidaya Air Tawar (Kolam, Karamba, Jaring Apung), Air Payau/Tambak, Laut & Ikan Hias',
  },
  {
    subsectorCode: '7',
    name: 'Kehutanan',
    questionnaire: 'SPDT26-HTN',
    commodityPrefix: '81–82',
    productionPrefix: '8101–8103',
    costPrefix: '8201–8205',
    sectorId: '8_HTN',
    accentClass: 'bg-lime-700 text-white dark:bg-lime-400 dark:text-slate-950',
    description: 'Kayu Rimba/Budidaya Kehutanan, Hasil Hutan Bukan Kayu (Rotan, Damar, Madu Hutan, dll.)',
  },
];

export const SubsectorDictionaryModal: React.FC<SubsectorDictionaryModalProps> = ({
  isOpen,
  onClose,
  onSelectSectorInDirectory,
  onCopyText,
}) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['1']);

  if (!isOpen) return null;

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code].sort()
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#CBD5E1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#111827]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-[#003D7A] px-5 py-3.5 text-white dark:border-[#1E293B] dark:bg-[#0F2952]">
          <div>
            <div className="flex items-center gap-2">
              <span className="tabular-code rounded bg-white/15 px-2 py-0.5 text-xs font-bold text-[#38BDF8]">
                KODE 1 S.D. 7
              </span>
              <h2 className="text-sm font-bold tracking-tight sm:text-base">
                Kamus Kode Subsektor SPDT NTP 2026
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-sky-100/85">
              Urutan kode resmi subsektor pertanian (1 Tanaman Pangan s.d. 7 Kehutanan) & prefix Buku 5
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Tutup ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-5 p-4 sm:p-6">
          {/* Primary List: Kode 1 s.d. 7 di Depan */}
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="grid grid-cols-12 items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
              <div className="col-span-2 sm:col-span-2">Kode</div>
              <div className="col-span-6 sm:col-span-6">Nama Subsektor & Cakupan</div>
              <div className="col-span-4 text-right sm:col-span-4">Kuesioner & Aksi</div>
            </div>

            <div className="divide-y divide-[#E2E8F0] bg-white dark:divide-[#1E293B] dark:bg-[#111827]">
              {SUBSECTOR_DICTIONARY_ITEMS.map((item) => (
                <div
                  key={item.subsectorCode}
                  className="grid grid-cols-12 items-center gap-2 px-4 py-3 transition hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50"
                >
                  {/* Kode 1 - 7 di Depan */}
                  <div className="col-span-2 flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        onCopyText(
                          item.subsectorCode,
                          `Kode Subsektor ${item.subsectorCode} (${item.name})`
                        )
                      }
                      title="Klik untuk salin kode subsektor"
                      className={`tabular-code flex h-10 w-10 items-center justify-center rounded-md text-lg font-extrabold shadow-xs transition hover:scale-105 ${item.accentClass}`}
                    >
                      {item.subsectorCode}
                    </button>
                  </div>

                  {/* Nama Subsektor di Depan */}
                  <div className="col-span-6 pr-2">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="tabular-code text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                        {item.subsectorCode}.
                      </span>
                      <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {item.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {item.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#475569] dark:text-[#94A3B8]">
                      <span className="tabular-code">
                        Produksi: <strong className="text-[#0F172A] dark:text-[#E2E8F0]">{item.productionPrefix}</strong>
                      </span>
                      <span>·</span>
                      <span className="tabular-code">
                        Biaya: <strong className="text-[#0F172A] dark:text-[#E2E8F0]">{item.costPrefix}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Kuesioner, Prefix Buku 5 & Tombol Filter */}
                  <div className="col-span-4 flex flex-col items-end justify-center gap-1.5">
                    <div className="text-right">
                      <span className="tabular-code inline-block rounded border border-[#CBD5E1] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]">
                        {item.questionnaire}
                      </span>
                      <div className="tabular-code mt-0.5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Buku 5: {item.commodityPrefix}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSectorInDirectory(item.sectorId);
                          onClose();
                        }}
                        className="h-7 rounded bg-[#003D7A] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#002D5A] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
                      >
                        Buka Komoditas →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tambahan Referensi Kuesioner Konsumsi RT (01-11) */}
              <div className="grid grid-cols-12 items-center gap-2 bg-[#F8FAFC]/80 px-4 py-2.5 dark:bg-[#0F172A]/60">
                <div className="col-span-2 flex items-center">
                  <span className="tabular-code flex h-9 w-10 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-sm font-extrabold text-[#003D7A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#38BDF8]">
                    K
                  </span>
                </div>
                <div className="col-span-6 pr-2">
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Konsumsi Rumah Tangga (Blok V & Blok VI)
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Makanan & Minuman (01) s.d. Barang & Jasa Lainnya (11)
                  </p>
                </div>
                <div className="col-span-4 flex flex-col items-end gap-1">
                  <span className="tabular-code rounded border border-[#CBD5E1] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]">
                    SPDT26-K (01–11)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSectorInDirectory('1_KONSUMSI');
                      onClose();
                    }}
                    className="text-[11px] font-semibold text-[#003D7A] hover:underline dark:text-[#38BDF8]"
                  >
                    Buka Konsumsi →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Interactive Subsector Checklist & Copy Summary */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E293B] dark:bg-[#0F172A]">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Cek Cepat Subsektor Rumah Tangga (1 s.d. 7)
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Klik nomor subsektor di bawah untuk menandai subsektor yang diusahakan rumah tangga:
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const text = SUBSECTOR_DICTIONARY_ITEMS.map(
                    (s) => `${s.subsectorCode} = ${s.name} (${s.questionnaire} / Kode ${s.commodityPrefix})`
                  ).join('\n');
                  onCopyText(text, 'Kamus Lengkap Kode Subsektor 1-7');
                }}
                className="h-8 self-start rounded border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F1F5F9] sm:self-auto dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                Salin Ringkasan 1–7
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUBSECTOR_DICTIONARY_ITEMS.map((item) => {
                const active = selectedCodes.includes(item.subsectorCode);
                return (
                  <button
                    key={item.subsectorCode}
                    type="button"
                    onClick={() => toggleCode(item.subsectorCode)}
                    className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition ${
                      active
                        ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                        : 'border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#94A3B8]'
                    }`}
                  >
                    <span className="tabular-code font-extrabold">{item.subsectorCode}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedCodes.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border border-[#CBD5E1] bg-white px-3 py-2 text-xs dark:border-[#334155] dark:bg-[#111827]">
                <div>
                  <span className="font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Subsektor Terpilih:{' '}
                  </span>
                  <span className="tabular-code font-bold text-[#003D7A] dark:text-[#38BDF8]">
                    {selectedCodes
                      .map((c) => {
                        const found = SUBSECTOR_DICTIONARY_ITEMS.find((i) => i.subsectorCode === c);
                        return found ? `${found.subsectorCode} (${found.name})` : c;
                      })
                      .join(', ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onCopyText(
                      selectedCodes.join(', '),
                      `Kode Subsektor: ${selectedCodes.join(', ')}`
                    )
                  }
                  className="font-semibold text-[#003D7A] hover:underline dark:text-[#38BDF8]"
                >
                  Salin Kode
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp Rich Link Preview Share Helper */}
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-[#CBD5E1] bg-white p-3.5 sm:flex-row sm:items-center dark:border-[#334155] dark:bg-[#111827]">
            <div>
              <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Bagikan Link Portal ke Grup WhatsApp (Thumbnail & Deskripsi Aktif)
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Gunakan tombol di samping agar WhatsApp memuat gambar kartu thumbnail terbaru tanpa tertahan cache lama.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onCopyText(
                  'https://lulzec6108.github.io/Master_SPDT_NTP/?v=2026',
                  'Link WhatsApp Portal SPDT NTP 2026 (Thumbnail Aktif)'
                )
              }
              className="h-8 shrink-0 rounded-md bg-[#15803D] px-3 text-xs font-semibold text-white transition hover:bg-[#166534]"
            >
              Salin Link Share WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
