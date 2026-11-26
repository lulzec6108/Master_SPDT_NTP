import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CategoryType,
  CommodityItem,
  OfficerItem,
  ProposedCommodityItem,
  ProposedSectorType,
} from '../types';
import { BLOK_7A_SUBGROUPS, BLOK_7B_GROUPS } from './Spdt26kCalculator';

interface ProposedCommodityTabProps {
  proposals: ProposedCommodityItem[];
  commodities: CommodityItem[];
  officers: OfficerItem[];
  initialDraftName?: string;
  onClearDraftName?: () => void;
  onAddProposal: (
    item: Omit<ProposedCommodityItem, 'id' | 'createdAtMs'>
  ) => Promise<void>;
  onUpdateProposal: (
    id: string,
    item: Omit<ProposedCommodityItem, 'id' | 'createdAtMs'>
  ) => Promise<void>;
  onToggleStatus: (item: ProposedCommodityItem) => Promise<void>;
  onDeleteProposal: (id: string) => Promise<void>;
  onCopyText: (text: string, label: string) => void;
  isFirebaseConnected: boolean;
}

export interface GroupOptionDef {
  groupCode: string;
  printedPrefix: string;
  blockName: string;
  groupLabel: string;
  category: CategoryType;
  recommendedUnits: string[];
  blockHint?: string;
}

export interface SectorOptionDef {
  id: ProposedSectorType;
  subsectorNumber: string;
  label: string;
  shortLabel: string;
  questionnaire: string;
  codeRange: string;
  codePrefixes: string[];
  pdfFileName: string;
  fieldGuideNote: string;
}

export const SECTOR_OPTIONS: SectorOptionDef[] = [
  {
    id: 'KONSUMSI',
    subsectorNumber: 'K',
    label: 'K · 01–11 Konsumsi Rumah Tangga (SPDT26-K)',
    shortLabel: 'Konsumsi RT (SPDT26-K)',
    questionnaire: 'SPDT26-K',
    codeRange: '01–11',
    codePrefixes: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
    pdfFileName: 'Kues_SPDT_NTP_2026__Konsumsi__d572b96b.pdf',
    fieldGuideNote:
      'Kuesioner Konsumsi Rumah Tangga: Blok V (Makanan, Minuman & Tembakau Seminggu Terakhir) dan Blok VI (Bukan Makanan Sebulan/Setahun Terakhir).',
  },
  {
    id: 'TANAMAN_PANGAN',
    subsectorNumber: '1',
    label: '1 · 21–22 Tanaman Pangan (SPDT26-TP)',
    shortLabel: '1. Tanaman Pangan (SPDT26-TP)',
    questionnaire: 'SPDT26-TP',
    codeRange: '21–22',
    codePrefixes: ['21', '22'],
    pdfFileName: 'Kues_SPDT_NTP_2026__TP__5fdac17d.pdf',
    fieldGuideNote:
      'Subsektor 1 Tanaman Pangan: Blok III Produksi (Kode 210....) dan Blok IV Pengeluaran A. Bibit (220....), B.1 Pupuk Subsidi (2203...), B.2 Pupuk Nonsubsidi (2204...), B.3 Obat/Pestisida (2205...), C. Sewa/Pajak (2206...), D. Transportasi (2207...), E. Barang Modal (2208...), F. Upah Buruh (2210...).',
  },
  {
    id: 'HORTIKULTURA',
    subsectorNumber: '2',
    label: '2 · 31–32 Tanaman Hortikultura (SPDT26-TH)',
    shortLabel: '2. Hortikultura (SPDT26-TH)',
    questionnaire: 'SPDT26-TH',
    codeRange: '31–32',
    codePrefixes: ['31', '32'],
    pdfFileName: 'Kues_SPDT_NTP_2026__TH__39bd9c52.pdf',
    fieldGuideNote:
      'Subsektor 2 Tanaman Hortikultura: Blok III.A Produksi Sayuran/Buah/Obat/Hias & Blok III.B Penangkaran Tumbuhan Liar (Kode 310....; Satuan Tanam: 1. M², 2. Pohon, 3. Rumpun; Satuan Produksi: 1. Kg, 2. Tangkai, 3. Pohon, 4. Rumpun) serta Blok IV Pengeluaran A s.d. F (320.... s.d. 3210...).',
  },
  {
    id: 'PERKEBUNAN',
    subsectorNumber: '3',
    label: '3 · 41–42 Tanaman Perkebunan Rakyat (SPDT26-TPR)',
    shortLabel: '3. Perkebunan Rakyat (SPDT26-TPR)',
    questionnaire: 'SPDT26-TPR',
    codeRange: '41–42',
    codePrefixes: ['41', '42'],
    pdfFileName: 'Kues_SPDT_NTP_2026__TPR__31e54e32.pdf',
    fieldGuideNote:
      'Subsektor 3 Perkebunan Rakyat: Blok III Produksi Perkebunan (Kode 410....; Satuan Luas/Tanam: 1. M², 2. Pohon, 3. Rumpun, 4. Lajar; dilengkapi Tabel Faktor Konversi di Hal. 12 PDF) serta Blok IV Pengeluaran A s.d. F (420.... s.d. 4208...).',
  },
  {
    id: 'PETERNAKAN',
    subsectorNumber: '4',
    label: '4 · 51–52 Peternakan (SPDT26-TRK)',
    shortLabel: '4. Peternakan (SPDT26-TRK)',
    questionnaire: 'SPDT26-TRK',
    codeRange: '51–52',
    codePrefixes: ['51', '52'],
    pdfFileName: 'Kues_SPDT_NTP_2026__TRK__2f7addbe.pdf',
    fieldGuideNote:
      'Subsektor 4 Peternakan: Blok III.A Produksi Ternak/Unggas (Ekor/Koloni), Blok III.B Penangkaran Satwa Liar (Ekor/Koloni), Blok III.C Hasil Ternak/Unggas (1. Butir, 2. Kg, 3. Liter) [Kode 510....] serta Blok IV Pengeluaran A.1 Bibit/DOC (5201...), A.2 Bakalan (5202...), B.1 Obat/Vaksin (5203–5205...), B.2/B.3 Pakan (5206...), C–F (5207... s.d. 5210...).',
  },
  {
    id: 'PERIKANAN_TANGKAP',
    subsectorNumber: '5',
    label: '5 · 61–62 Perikanan Tangkap (SPDT26-IKT)',
    shortLabel: '5. Perikanan Tangkap (SPDT26-IKT)',
    questionnaire: 'SPDT26-IKT',
    codeRange: '61–62',
    codePrefixes: ['61', '62'],
    pdfFileName: 'Kues_SPDT_NTP_2026__IKT__45d67ba1.pdf',
    fieldGuideNote:
      'Subsektor 5 Perikanan Tangkap: Blok IV Produksi Penangkapan Ikan (Kode 610....; Satuan: Kg; dilengkapi Kamus Nama Ikan Nasional vs Nama Daerah di Hal. 12 PDF) serta Blok V Pengeluaran A. Sewa/Perbekalan (6201...), B. Transportasi (6202...), C. Barang Modal Tangkap (6203...), D. Upah/Bagi Hasil (6204...).',
  },
  {
    id: 'PERIKANAN_BUDIDAYA',
    subsectorNumber: '6',
    label: '6 · 71–72 Perikanan Budidaya (SPDT26-IKB)',
    shortLabel: '6. Perikanan Budidaya (SPDT26-IKB)',
    questionnaire: 'SPDT26-IKB',
    codeRange: '71–72',
    codePrefixes: ['71', '72'],
    pdfFileName: 'Kues_SPDT_NTP_2026__IKB__985a9e5e.pdf',
    fieldGuideNote:
      'Subsektor 6 Perikanan Budidaya: Blok III Produksi Pembudidayaan Ikan (Kode 710....) serta Blok IV Pengeluaran A. Benih Ikan (720....), B.1 Pupuk Subsidi (7204...), B.2 Pupuk Nonsubsidi (7205...), B.3 Obat Budidaya (7206...), B.4 Pakan Ikan (7207...), C. Sewa/Pajak (7208...), D. Transportasi (7209...), E. Barang Modal (7210...), F. Upah Buruh (7211...).',
  },
  {
    id: 'KEHUTANAN',
    subsectorNumber: '7',
    label: '7 · 81–82 Kehutanan (SPDT26-HTN)',
    shortLabel: '7. Kehutanan (SPDT26-HTN)',
    questionnaire: 'SPDT26-HTN',
    codeRange: '81–82',
    codePrefixes: ['81', '82'],
    pdfFileName: 'Kues_SPDT_NTP_2026__HTN__95f09896.pdf',
    fieldGuideNote:
      'Subsektor 7 Kehutanan: Blok III.A Budidaya Tanaman Kehutanan (Satuan Produksi: 1. Batang, 2. M³, 3. Kg), Blok III.B Pemungutan Hasil Hutan (1. Batang, 2. Liter, 3. Kg, 4. Pohon, 5. M³), Blok III.C Penangkapan Satwa Liar (Ekor) [Kode 810....] serta Blok IV Pengeluaran A s.d. F (820.... s.d. 8210...).',
  },
];

function formatKonsumsiPrintedPrefix(code: string): string {
  const rawDigits = code.replace(/[^0-9]/g, '');
  if (rawDigits.length === 3) {
    return `${rawDigits}1...`;
  }
  return (rawDigits + '....').slice(0, 7);
}

const KONSUMSI_GROUP_OPTIONS: GroupOptionDef[] = [
  ...BLOK_7A_SUBGROUPS.map((s) => ({
    groupCode: s.code,
    printedPrefix: formatKonsumsiPrintedPrefix(s.code),
    blockName: `Blok V (${s.code})`,
    groupLabel: `Blok V (${s.code}) — ${s.label}`,
    category: 'KONSUMSI' as CategoryType,
    recommendedUnits: ['KG', 'ONS', 'LITER', 'BUTIR', 'BUNGKUS', 'IKAT', 'PORSI', 'BATANG'],
    blockHint: 'Konsumsi Makanan, Minuman, dan Tembakau Seminggu Terakhir (Blok V SPDT26-K)',
  })),
  ...BLOK_7B_GROUPS.flatMap((g) =>
    g.subgroups.map((s) => ({
      groupCode: s.code,
      printedPrefix: formatKonsumsiPrintedPrefix(s.code),
      blockName: `Blok VI (${s.code})`,
      groupLabel: `Blok VI (${s.code}) — ${s.label}`,
      category: 'KONSUMSI' as CategoryType,
      recommendedUnits: ['BUAH', 'PASANG', 'BULAN', 'KWH', 'LITER', 'PAKET', 'UNIT', 'KALI'],
      blockHint: `Konsumsi Bukan Makanan — Kelompok ${g.groupTitle} (Blok VI SPDT26-K)`,
    }))
  ),
];

export const SECTOR_GROUP_MAP: Record<ProposedSectorType, GroupOptionDef[]> = {
  KONSUMSI: KONSUMSI_GROUP_OPTIONS,
  TANAMAN_PANGAN: [
    {
      groupCode: '210',
      printedPrefix: '210....',
      blockName: 'Blok III',
      groupLabel: 'Blok III — Produksi Tanaman Pangan (Padi, Palawija, Umbi & Hasil Ikutan)',
      category: 'PRODUKSI',
      recommendedUnits: ['KG', 'IKAT', 'KARUNG', 'TON'],
      blockHint: 'Kolom 2 Kuesioner SPDT26-TP tercetak prefix 210.... (Satuan Luas Panen: M²)',
    },
    {
      groupCode: '220',
      printedPrefix: '220....',
      blockName: 'Blok IV.A',
      groupLabel: 'Blok IV.A — Bibit / Benih Tanaman Pangan (Beli maupun Produksi Sendiri)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'BATANG', 'STEK', 'IKAT', 'BUNGKUS'],
      blockHint: 'Kolom 2 Rincian A Bibit/Benih SPDT26-TP tercetak prefix 220....',
    },
    {
      groupCode: '2203',
      printedPrefix: '2203...',
      blockName: 'Blok IV.B.1',
      groupLabel: 'Blok IV.B.1 — Pupuk Subsidi Tanaman Pangan (Urea, NPK Phonska, Organik)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK'],
      blockHint: 'Kolom 2 Rincian B.1 Pupuk Subsidi SPDT26-TP tercetak prefix 2203...',
    },
    {
      groupCode: '2204',
      printedPrefix: '2204...',
      blockName: 'Blok IV.B.2',
      groupLabel: 'Blok IV.B.2 — Pupuk Nonsubsidi Tanaman Pangan (Urea, NPK, ZA, SP-36, Kandang/Kompos)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK', 'KARUNG'],
      blockHint: 'Kolom 2 Rincian B.2 Pupuk Nonsubsidi SPDT26-TP tercetak prefix 2204...',
    },
    {
      groupCode: '2205',
      printedPrefix: '2205...',
      blockName: 'Blok IV.B.3',
      groupLabel: 'Blok IV.B.3 — Obat-obatan / Pestisida / Insektisida / Herbisida / Fungisida / ZPT',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KG', 'BOTOL', 'BUNGKUS', 'ML', 'GRAM'],
      blockHint: 'Kolom 2 Rincian B.3 Obat-obatan SPDT26-TP tercetak prefix 2205...',
    },
    {
      groupCode: '2206',
      printedPrefix: '2206...',
      blockName: 'Blok IV.C',
      groupLabel: 'Blok IV.C — Biaya Sewa Lahan/Alat, Pajak, Irigasi, Karung & Pengeluaran Lain',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['MUSIM', 'TAHUN', 'HARI', 'HA', 'LEMBAR', 'BUAH', 'LITER'],
      blockHint: 'Kolom 2 Rincian C Biaya Sewa, Pajak & Pengeluaran Lain SPDT26-TP tercetak prefix 2206...',
    },
    {
      groupCode: '2207',
      printedPrefix: '2207...',
      blockName: 'Blok IV.D',
      groupLabel: 'Blok IV.D — Transportasi, BBM Usaha, Ongkos Angkut & Komunikasi',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KALI', 'BULAN', 'KG', 'RETU'],
      blockHint: 'Kolom 2 Rincian D Transportasi & Komunikasi SPDT26-TP tercetak prefix 2207...',
    },
    {
      groupCode: '2208',
      printedPrefix: '2208...',
      blockName: 'Blok IV.E',
      groupLabel: 'Blok IV.E — Barang Modal Tanaman Pangan (Cangkul, Sabit, Pompa, Traktor, Terpal, dll.)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BUAH', 'UNIT', 'SET', 'METER', 'LEMBAR'],
      blockHint: 'Kolom 2 Rincian E Barang Modal SPDT26-TP tercetak prefix 2208...',
    },
    {
      groupCode: '2210',
      printedPrefix: '2210...',
      blockName: 'Blok IV.F',
      groupLabel: 'Blok IV.F — Upah Buruh Harian / Borongan (Olah Tanah, Tanam, Siang, Panen, Pascapanen)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['HOK', 'BORONGAN', 'HARI', 'ORANG'],
      blockHint: 'Kolom 2 Rincian F Upah Buruh SPDT26-TP tercetak prefix 2210...',
    },
  ],
  HORTIKULTURA: [
    {
      groupCode: '310A',
      printedPrefix: '310....',
      blockName: 'Blok III.A',
      groupLabel: 'Blok III.A — Produksi Tanaman Sayuran, Buah-buahan, Tanaman Obat & Tanaman Hias',
      category: 'PRODUKSI',
      recommendedUnits: ['KG', 'TANGKAI', 'POHON', 'RUMPUN', 'IKAT', 'POT'],
      blockHint:
        'Kolom 2 Blok III.A SPDT26-TH tercetak 310.... (Satuan Tanam: 1. M², 2. Pohon, 3. Rumpun | Satuan Produksi: 1. Kg, 2. Tangkai, 3. Pohon, 4. Rumpun)',
    },
    {
      groupCode: '310B',
      printedPrefix: '310....',
      blockName: 'Blok III.B',
      groupLabel: 'Blok III.B — Produksi Penangkaran Tumbuhan Liar',
      category: 'PRODUKSI',
      recommendedUnits: ['POHON', 'RUMPUN', 'BATANG', 'KG'],
      blockHint: 'Kolom 2 Blok III.B SPDT26-TH tercetak prefix 310.... (Satuan Baku: Pohon)',
    },
    {
      groupCode: '320',
      printedPrefix: '320....',
      blockName: 'Blok IV.A',
      groupLabel: 'Blok IV.A — Bibit / Benih Hortikultura (Biji, Semai, Stek, Anakan, Umbi Bibit)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BUNGKUS', 'GRAM', 'KG', 'POHON', 'BATANG', 'BIJI', 'POLIBAG'],
      blockHint: 'Kolom 2 Rincian A Bibit/Benih SPDT26-TH tercetak prefix 32.....',
    },
    {
      groupCode: '3204',
      printedPrefix: '3204...',
      blockName: 'Blok IV.B.1',
      groupLabel: 'Blok IV.B.1 — Pupuk Subsidi Hortikultura',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK'],
      blockHint: 'Kolom 2 Rincian B.1 Pupuk Subsidi SPDT26-TH tercetak prefix 3204...',
    },
    {
      groupCode: '3205',
      printedPrefix: '3205...',
      blockName: 'Blok IV.B.2',
      groupLabel: 'Blok IV.B.2 — Pupuk Nonsubsidi Hortikultura (NPK, Kandang, Kompos, Pupuk Daun/Cair)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK', 'KARUNG', 'BOTOL'],
      blockHint: 'Kolom 2 Rincian B.2 Pupuk Nonsubsidi SPDT26-TH tercetak prefix 3205...',
    },
    {
      groupCode: '3206',
      printedPrefix: '3206...',
      blockName: 'Blok IV.B.3',
      groupLabel: 'Blok IV.B.3 — Obat-obatan / Pestisida / Fungisida / ZPT Hortikultura',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KG', 'BOTOL', 'BUNGKUS', 'ML', 'GRAM'],
      blockHint: 'Kolom 2 Rincian B.3 Obat-obatan SPDT26-TH tercetak prefix 3206...',
    },
    {
      groupCode: '3207',
      printedPrefix: '3207...',
      blockName: 'Blok IV.C',
      groupLabel: 'Blok IV.C — Biaya Sewa, Pajak, Mulsa, Ajir/Lanjaran, Pot, Media Tanam & Pengeluaran Lain',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['ROL', 'BATANG', 'BUAH', 'KARUNG', 'MUSIM', 'TAHUN', 'HARI'],
      blockHint: 'Kolom 2 Rincian C Biaya Sewa, Pajak & Pengeluaran Lain SPDT26-TH tercetak prefix 3207...',
    },
    {
      groupCode: '3208',
      printedPrefix: '3208...',
      blockName: 'Blok IV.D',
      groupLabel: 'Blok IV.D — Transportasi dan Komunikasi Usaha Hortikultura',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KALI', 'BULAN', 'KG'],
      blockHint: 'Kolom 2 Rincian D Transportasi & Komunikasi SPDT26-TH tercetak prefix 3208...',
    },
    {
      groupCode: '3209',
      printedPrefix: '3209...',
      blockName: 'Blok IV.E',
      groupLabel: 'Blok IV.E — Barang Modal Hortikultura (Sprayer, Pompa, Selang, Gunting Pangkas, Greenhouse)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BUAH', 'UNIT', 'METER', 'ROL', 'SET'],
      blockHint: 'Kolom 2 Rincian E Barang Modal SPDT26-TH tercetak prefix 3209...',
    },
    {
      groupCode: '3210',
      printedPrefix: '3210...',
      blockName: 'Blok IV.F',
      groupLabel: 'Blok IV.F — Upah Buruh Harian / Borongan Hortikultura',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['HOK', 'BORONGAN', 'HARI'],
      blockHint: 'Kolom 2 Rincian F Upah Buruh SPDT26-TH tercetak prefix 3210...',
    },
  ],
  PERKEBUNAN: [
    {
      groupCode: '410',
      printedPrefix: '410....',
      blockName: 'Blok III',
      groupLabel: 'Blok III — Produksi Tanaman Perkebunan Rakyat (Sawit, Karet, Kopi, Kakao, Kelapa, Tebu, dll.)',
      category: 'PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'BUTIR', 'BATANG', 'IKAT'],
      blockHint:
        'Kolom 2 Blok III SPDT26-TPR tercetak 410.... (Satuan Tanam: 1. M², 2. Pohon, 3. Rumpun, 4. Lajar; Lihat Tabel Konversi di Hal. 12 PDF)',
    },
    {
      groupCode: '420',
      printedPrefix: '420....',
      blockName: 'Blok IV.A',
      groupLabel: 'Blok IV.A — Bibit / Benih Tanaman Perkebunan (Kecambah, Bibit Polibag, Stek, Entres)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['POHON', 'BATANG', 'POLIBAG', 'BUTIR', 'KG'],
      blockHint: 'Kolom 2 Rincian A Bibit/Benih SPDT26-TPR tercetak prefix 420....',
    },
    {
      groupCode: '4202',
      printedPrefix: '4202...',
      blockName: 'Blok IV.B.1',
      groupLabel: 'Blok IV.B.1 — Pupuk Subsidi Perkebunan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK'],
      blockHint: 'Kolom 2 Rincian B.1 Pupuk Subsidi SPDT26-TPR tercetak prefix 4202...',
    },
    {
      groupCode: '4203',
      printedPrefix: '4203...',
      blockName: 'Blok IV.B.2',
      groupLabel: 'Blok IV.B.2 — Pupuk Nonsubsidi Perkebunan (Urea, NPK, Dolomit, Kieserite, Borate, Janjang Kosong)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK', 'KARUNG'],
      blockHint: 'Kolom 2 Rincian B.2 Pupuk Nonsubsidi SPDT26-TPR tercetak prefix 4203...',
    },
    {
      groupCode: '4204',
      printedPrefix: '4204...',
      blockName: 'Blok IV.B.3',
      groupLabel: 'Blok IV.B.3 — Obat-obatan / Herbisida / Pestisida / Asam Semut (Penggumpal Lateks)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KG', 'BOTOL', 'BUNGKUS'],
      blockHint: 'Kolom 2 Rincian B.3 Obat-obatan SPDT26-TPR tercetak prefix 4204...',
    },
    {
      groupCode: '4205',
      printedPrefix: '4205...',
      blockName: 'Blok IV.C',
      groupLabel: 'Blok IV.C — Biaya Sewa, Pajak, Mangkok Sadap, Talang, Karung & Pengeluaran Lainnya',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BUAH', 'TAHUN', 'MUSIM', 'HARI', 'LEMBAR', 'LITER'],
      blockHint: 'Kolom 2 Rincian C Biaya Sewa, Pajak & Pengeluaran Lainnya SPDT26-TPR tercetak prefix 4205...',
    },
    {
      groupCode: '4206',
      printedPrefix: '4206...',
      blockName: 'Blok IV.D',
      groupLabel: 'Blok IV.D — Transportasi, Ongkos Angkut TBS/Hasil Kebun & Komunikasi',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KG', 'TON', 'KALI', 'BULAN'],
      blockHint: 'Kolom 2 Rincian D Transportasi & Komunikasi SPDT26-TPR tercetak prefix 4206...',
    },
    {
      groupCode: '4207',
      printedPrefix: '4207...',
      blockName: 'Blok IV.E',
      groupLabel: 'Blok IV.E — Barang Modal Perkebunan (Dodos, Egrek, Pisau Sadap, Angkong, Tangki Semprot)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BUAH', 'UNIT', 'SET', 'BATANG'],
      blockHint: 'Kolom 2 Rincian E Barang Modal SPDT26-TPR tercetak prefix 4207...',
    },
    {
      groupCode: '4208',
      printedPrefix: '4208...',
      blockName: 'Blok IV.F',
      groupLabel: 'Blok IV.F — Upah Buruh Harian / Borongan Perkebunan (Rawat, Pupuk, Panen/Sadap, Pascapanen)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['HOK', 'BORONGAN', 'KG', 'HARI'],
      blockHint: 'Kolom 2 Rincian F Upah Buruh SPDT26-TPR tercetak prefix 4208...',
    },
  ],
  PETERNAKAN: [
    {
      groupCode: '510A',
      printedPrefix: '510....',
      blockName: 'Blok III.A',
      groupLabel: 'Blok III.A — Produksi Ternak / Unggas (Sapi, Kerbau, Kambing, Domba, Babi, Ayam, Itik, Puyuh, Lebah)',
      category: 'PRODUKSI',
      recommendedUnits: ['EKOR', 'KOLONI', 'KG'],
      blockHint: 'Kolom 2 Blok III.A SPDT26-TRK tercetak prefix 510.... (Satuan: Ekor / Koloni)',
    },
    {
      groupCode: '510B',
      printedPrefix: '510....',
      blockName: 'Blok III.B',
      groupLabel: 'Blok III.B — Produksi Penangkaran Satwa Liar (Burung Berkicau, Rusa, Reptil, dll.)',
      category: 'PRODUKSI',
      recommendedUnits: ['EKOR', 'KOLONI', 'PASANG'],
      blockHint: 'Kolom 2 Blok III.B SPDT26-TRK tercetak prefix 510.... (Satuan: Ekor / Koloni)',
    },
    {
      groupCode: '510C',
      printedPrefix: '510....',
      blockName: 'Blok III.C',
      groupLabel: 'Blok III.C — Produksi Hasil Ternak / Unggas (Telur, Susu Segar, Madu, Wol, Pupuk Kandang/Kotoran)',
      category: 'PRODUKSI',
      recommendedUnits: ['BUTIR', 'KG', 'LITER', 'KARUNG'],
      blockHint: 'Kolom 2 Blok III.C SPDT26-TRK tercetak prefix 510.... (Kode Satuan: 1. Butir, 2. Kg, 3. Liter)',
    },
    {
      groupCode: '5201',
      printedPrefix: '5201...',
      blockName: 'Blok IV.A.1',
      groupLabel: 'Blok IV.A.1 — Bibit / Benih Ternak & Unggas (DOC, DOD, DOQ, Bibit Indukan, Semen Beku/IB)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['EKOR', 'DOSIS', 'BOKS', 'KOLONI'],
      blockHint: 'Kolom 2 Rincian A.1 Bibit/Benih Ternak SPDT26-TRK tercetak prefix 5201...',
    },
    {
      groupCode: '5202',
      printedPrefix: '5202...',
      blockName: 'Blok IV.A.2',
      groupLabel: 'Blok IV.A.2 — Bakalan Ternak (Anakan Sapi, Kambing, Domba, Babi untuk Penggemukan)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['EKOR'],
      blockHint: 'Kolom 2 Rincian A.2 Bakalan Ternak SPDT26-TRK tercetak prefix 5202...',
    },
    {
      groupCode: '5203',
      printedPrefix: '5203...',
      blockName: 'Blok IV.B.1',
      groupLabel: 'Blok IV.B.1 — Obat-obatan, Vaksin, Vitamin, Mineral & Desinfektan Kandang (5203–5205)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BOTOL', 'BUNGKUS', 'DOSIS', 'ML', 'LITER', 'KG', 'SACHET'],
      blockHint: 'Kolom 2 Rincian B.1 Obat-obatan Ternak SPDT26-TRK mencakup prefix 5203..., 5204..., 5205...',
    },
    {
      groupCode: '5206A',
      printedPrefix: '5206...',
      blockName: 'Blok IV.B.2',
      groupLabel: 'Blok IV.B.2 — Pakan Ternak / Unggas (Konsentrat, Pur/Pelet, Jagung, Dedak, Rumput/Hijauan, Ampas Tahu)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'SAK', 'IKAT', 'KARUNG'],
      blockHint: 'Kolom 2 Rincian B.2 Pakan Ternak/Unggas SPDT26-TRK tercetak prefix 5206...',
    },
    {
      groupCode: '5206B',
      printedPrefix: '5206...',
      blockName: 'Blok IV.B.3',
      groupLabel: 'Blok IV.B.3 — Pakan Satwa Liar (Jangkrik, Kroto, Ulat Hongkong, Buah, Biji-bijian)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'ONS', 'BUNGKUS', 'EKOR'],
      blockHint: 'Kolom 2 Rincian B.3 Pakan Satwa Liar SPDT26-TRK tercetak prefix 5206...',
    },
    {
      groupCode: '5207',
      printedPrefix: '5207...',
      blockName: 'Blok IV.C',
      groupLabel: 'Blok IV.C — Biaya Sewa Kandang/Lahan, Pajak, Listrik/Air Kandang, Sekam & Pengeluaran Lain',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BULAN', 'TAHUN', 'KARUNG', 'KWH', 'TABUNG', 'EKOR'],
      blockHint: 'Kolom 2 Rincian C Biaya Sewa, Pajak & Pengeluaran Lain SPDT26-TRK tercetak prefix 5207...',
    },
    {
      groupCode: '5208',
      printedPrefix: '5208...',
      blockName: 'Blok IV.D',
      groupLabel: 'Blok IV.D — Transportasi, Angkutan Ternak/Pakan & Komunikasi',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KALI', 'EKOR', 'BULAN'],
      blockHint: 'Kolom 2 Rincian D Transportasi & Komunikasi SPDT26-TRK tercetak prefix 5208...',
    },
    {
      groupCode: '5209',
      printedPrefix: '5209...',
      blockName: 'Blok IV.E',
      groupLabel: 'Blok IV.E — Barang Modal Peternakan (Tempat Pakan/Minum, Mesin Chopper, Pemanas/Brooder, Kandang)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BUAH', 'UNIT', 'SET', 'METER'],
      blockHint: 'Kolom 2 Rincian E Barang Modal SPDT26-TRK tercetak prefix 5209...',
    },
    {
      groupCode: '5210',
      printedPrefix: '5210...',
      blockName: 'Blok IV.F',
      groupLabel: 'Blok IV.F — Upah Buruh Harian / Borongan Peternakan (Pemeliharaan Kandang, Cari Rumput, Panen)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['HOK', 'BULAN', 'BORONGAN', 'HARI'],
      blockHint: 'Kolom 2 Rincian F Upah Buruh SPDT26-TRK tercetak prefix 5210...',
    },
  ],
  PERIKANAN_TANGKAP: [
    {
      groupCode: '610',
      printedPrefix: '610....',
      blockName: 'Blok IV',
      groupLabel: 'Blok IV — Produksi Perikanan Kegiatan Penangkapan Ikan (Laut & Perairan Umum Daratan)',
      category: 'PRODUKSI',
      recommendedUnits: ['KG'],
      blockHint:
        'Kolom 2 Blok IV SPDT26-IKT tercetak prefix 610.... (Satuan: Kg; Lihat Daftar Nama Ikan Nasional vs Nama Daerah di Hal. 12 PDF)',
    },
    {
      groupCode: '6201',
      printedPrefix: '6201...',
      blockName: 'Blok V.A',
      groupLabel: 'Blok V.A — Biaya Sewa Perahu/Alat, Pajak/Retribusi Lelang, Es Balok, Umpan, Garam & Perbekalan Melaut',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BALOK', 'KG', 'LITER', 'TRIP', 'BUNGKUS', 'TAHUN'],
      blockHint: 'Kolom 2 Blok V Rincian A SPDT26-IKT tercetak prefix 6201...',
    },
    {
      groupCode: '6202',
      printedPrefix: '6202...',
      blockName: 'Blok V.B',
      groupLabel: 'Blok V.B — Transportasi, BBM Melaut/Angkut & Komunikasi Penangkapan Ikan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'TRIP', 'BULAN', 'KALI'],
      blockHint: 'Kolom 2 Blok V Rincian B Transportasi & Komunikasi SPDT26-IKT tercetak prefix 6202...',
    },
    {
      groupCode: '6203',
      printedPrefix: '6203...',
      blockName: 'Blok V.C',
      groupLabel: 'Blok V.C — Barang Modal Penangkapan Ikan (Perahu, Mesin Tempel, Jaring, Pancing, Bubu, Coolbox, GPS)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['UNIT', 'BUAH', 'SET', 'PCS', 'ROL', 'METER'],
      blockHint: 'Kolom 2 Blok V Rincian C Barang Modal SPDT26-IKT tercetak prefix 6203...',
    },
    {
      groupCode: '6204',
      printedPrefix: '6204...',
      blockName: 'Blok V.D',
      groupLabel: 'Blok V.D — Upah Buruh / ABK Harian, Borongan & Bagi Hasil Penangkapan Ikan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['TRIP', 'HOK', 'BAGI HASIL', 'BULAN'],
      blockHint: 'Kolom 2 Blok V Rincian D Upah Buruh SPDT26-IKT tercetak prefix 6204...',
    },
  ],
  PERIKANAN_BUDIDAYA: [
    {
      groupCode: '710',
      printedPrefix: '710....',
      blockName: 'Blok III',
      groupLabel: 'Blok III — Produksi Perikanan Kegiatan Pembudidayaan Ikan (Konsumsi, Ikan Hias, Rumput Laut)',
      category: 'PRODUKSI',
      recommendedUnits: ['KG', 'EKOR', 'PASANG'],
      blockHint: 'Kolom 2 Blok III SPDT26-IKB tercetak prefix 710.... (Satuan: Kg / Ekor)',
    },
    {
      groupCode: '720',
      printedPrefix: '720....',
      blockName: 'Blok IV.A',
      groupLabel: 'Blok IV.A — Benih Ikan Budidaya (Benih/Bibit Ikan, Nener, Benur Udang, Bibit Rumput Laut)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['EKOR', 'RIBU EKOR', 'KG', 'KANTONG', 'REAN'],
      blockHint: 'Kolom 2 Rincian A Benih Ikan SPDT26-IKB tercetak prefix 720....',
    },
    {
      groupCode: '7204',
      printedPrefix: '7204...',
      blockName: 'Blok IV.B.1',
      groupLabel: 'Blok IV.B.1 — Pupuk Subsidi Budidaya Ikan (Urea/SP-36/Organik Tambak & Kolam)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK'],
      blockHint: 'Kolom 2 Rincian B.1 Pupuk Subsidi SPDT26-IKB tercetak prefix 7204...',
    },
    {
      groupCode: '7205',
      printedPrefix: '7205...',
      blockName: 'Blok IV.B.2',
      groupLabel: 'Blok IV.B.2 — Pupuk Nonsubsidi Budidaya Ikan (Pupuk Kandang, Urea, TSP, Tonik Tambak)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK', 'KARUNG'],
      blockHint: 'Kolom 2 Rincian B.2 Pupuk Non Subsidi SPDT26-IKB tercetak prefix 7205...',
    },
    {
      groupCode: '7206',
      printedPrefix: '7206...',
      blockName: 'Blok IV.B.3',
      groupLabel: 'Blok IV.B.3 — Obat-obatan, Probiotik, Vitamin, Kapur/Dolomit & Saponin Budidaya Ikan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KG', 'BOTOL', 'BUNGKUS', 'SAK'],
      blockHint: 'Kolom 2 Rincian B.3 Obat-obatan SPDT26-IKB tercetak prefix 7206...',
    },
    {
      groupCode: '7207',
      printedPrefix: '7207...',
      blockName: 'Blok IV.B.4',
      groupLabel: 'Blok IV.B.4 — Pakan Ikan (Pelet Pabrikan, Pakan Mandiri, Ikan Rucah, Cacing/Artemia, Dedak)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'SAK', 'KALENG', 'BUNGKUS'],
      blockHint: 'Kolom 2 Rincian B.4 Pakan Ikan SPDT26-IKB tercetak prefix 7207...',
    },
    {
      groupCode: '7208',
      printedPrefix: '7208...',
      blockName: 'Blok IV.C',
      groupLabel: 'Blok IV.C — Biaya Sewa Kolam/Tambak, Pajak, Listrik Kincir/Pompa, Plastik Packing & Oksigen',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['MUSIM', 'TAHUN', 'BULAN', 'KWH', 'TABUNG', 'PAK'],
      blockHint: 'Kolom 2 Rincian C Biaya Sewa, Pajak & Pengeluaran Lainnya SPDT26-IKB tercetak prefix 7208...',
    },
    {
      groupCode: '7209',
      printedPrefix: '7209...',
      blockName: 'Blok IV.D',
      groupLabel: 'Blok IV.D — Transportasi, BBM Pompa/Angkut & Komunikasi Budidaya Ikan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KALI', 'BULAN', 'KG'],
      blockHint: 'Kolom 2 Rincian D Transportasi & Komunikasi SPDT26-IKB tercetak prefix 7209...',
    },
    {
      groupCode: '7210',
      printedPrefix: '7210...',
      blockName: 'Blok IV.E',
      groupLabel: 'Blok IV.E — Barang Modal Budidaya Ikan (Kincir Air, Pompa, Terpal Kolam, Waring/Jaring KJA, Aerator)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['UNIT', 'BUAH', 'METER', 'ROL', 'LEMBAR', 'SET'],
      blockHint: 'Kolom 2 Rincian E Barang Modal SPDT26-IKB tercetak prefix 7210...',
    },
    {
      groupCode: '7211',
      printedPrefix: '7211...',
      blockName: 'Blok IV.F',
      groupLabel: 'Blok IV.F — Upah Buruh Harian / Borongan Budidaya Ikan (Olah Tambak/Kolam, Jaga, Panen, Ikat Bibit)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['HOK', 'BORONGAN', 'BULAN', 'BENTANG'],
      blockHint: 'Kolom 2 Rincian F Upah Buruh SPDT26-IKB tercetak prefix 7211...',
    },
  ],
  KEHUTANAN: [
    {
      groupCode: '810A',
      printedPrefix: '810....',
      blockName: 'Blok III.A',
      groupLabel: 'Blok III.A — Produksi Budidaya Tanaman Kehutanan (Jati, Sengon, Mahoni, Akasia, Bambu, Rotan, dll.)',
      category: 'PRODUKSI',
      recommendedUnits: ['BATANG', 'M3', 'KG', 'POHON', 'RUMPUN'],
      blockHint:
        'Kolom 2 Blok III.A SPDT26-HTN tercetak 810.... (Satuan Tanam: 1. Pohon, 2. Lajar, 3. Rumpun | Satuan Produksi: 1. Batang, 2. M³, 3. Kg)',
    },
    {
      groupCode: '810B',
      printedPrefix: '810....',
      blockName: 'Blok III.B',
      groupLabel: 'Blok III.B — Produksi Pemungutan Hasil Hutan Kayu & Bukan Kayu (Getah Pinus/Damar, Madu Hutan, Gaharu, Kayu Bakar)',
      category: 'PRODUKSI',
      recommendedUnits: ['BATANG', 'LITER', 'KG', 'POHON', 'M3', 'IKAT'],
      blockHint:
        'Kolom 2 Blok III.B SPDT26-HTN tercetak 810.... (Kode Satuan Produksi: 1. Batang, 2. Liter, 3. Kg, 4. Pohon, 5. M³)',
    },
    {
      groupCode: '810C',
      printedPrefix: '810....',
      blockName: 'Blok III.C',
      groupLabel: 'Blok III.C — Produksi Penangkapan Satwa Liar Kehutanan',
      category: 'PRODUKSI',
      recommendedUnits: ['EKOR', 'PASANG'],
      blockHint: 'Kolom 2 Blok III.C SPDT26-HTN tercetak prefix 810.... (Satuan: Ekor)',
    },
    {
      groupCode: '820',
      printedPrefix: '820....',
      blockName: 'Blok IV.A',
      groupLabel: 'Blok IV.A — Bibit / Benih Tanaman Kehutanan (Anakan, Stump, Bibit Polibag, Benih Biji)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['BATANG', 'POHON', 'POLIBAG', 'KG'],
      blockHint: 'Kolom 2 Rincian A Bibit/Benih SPDT26-HTN tercetak prefix 820....',
    },
    {
      groupCode: '8203',
      printedPrefix: '8203...',
      blockName: 'Blok IV.B.1',
      groupLabel: 'Blok IV.B.1 — Pupuk Subsidi & Nonsubsidi Kehutanan (8203 / 8204)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'LITER', 'SAK', 'KARUNG'],
      blockHint: 'Kolom 2 Rincian B.1 Pupuk Kehutanan SPDT26-HTN tercetak prefix 8203... (Subsidi) & 8204... (Nonsubsidi)',
    },
    {
      groupCode: '8205',
      printedPrefix: '8205...',
      blockName: 'Blok IV.B.2',
      groupLabel: 'Blok IV.B.2 — Obat-obatan / Pestisida / Herbisida / Stimulan Sadap Kehutanan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'KG', 'BOTOL', 'BUNGKUS'],
      blockHint: 'Kolom 2 Rincian B.2 Obat-obatan SPDT26-HTN tercetak prefix 8205...',
    },
    {
      groupCode: '8206',
      printedPrefix: '8206...',
      blockName: 'Blok IV.B.3',
      groupLabel: 'Blok IV.B.3 — Pakan Satwa Liar Kehutanan',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['KG', 'ONS', 'IKAT'],
      blockHint: 'Kolom 2 Rincian B.3 Pakan Satwa Liar SPDT26-HTN tercetak prefix 8206...',
    },
    {
      groupCode: '8207',
      printedPrefix: '8207...',
      blockName: 'Blok IV.C',
      groupLabel: 'Blok IV.C — Biaya Sewa, Pajak, Iuran/Retribusi Kehutanan, BBM Chainsaw & Pengeluaran Lain',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['TAHUN', 'MUSIM', 'LITER', 'HA', 'BUAH'],
      blockHint: 'Kolom 2 Rincian C Biaya Sewa, Pajak & Pengeluaran Lain SPDT26-HTN tercetak prefix 8207...',
    },
    {
      groupCode: '8208',
      printedPrefix: '8208...',
      blockName: 'Blok IV.D',
      groupLabel: 'Blok IV.D — Transportasi, Ongkos Angkut Kayu/Hasil Hutan & Komunikasi',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['LITER', 'M3', 'RETU', 'KALI', 'BULAN'],
      blockHint: 'Kolom 2 Rincian D Transportasi & Komunikasi SPDT26-HTN tercetak prefix 8208...',
    },
    {
      groupCode: '8209',
      printedPrefix: '8209...',
      blockName: 'Blok IV.E',
      groupLabel: 'Blok IV.E — Barang Modal Kehutanan (Chainsaw/Gergaji Mesin, Parang, Kapak, Pisau Sadap, Tali/Tambang)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['UNIT', 'BUAH', 'SET', 'METER'],
      blockHint: 'Kolom 2 Rincian E Barang Modal SPDT26-HTN tercetak prefix 8209...',
    },
    {
      groupCode: '8210',
      printedPrefix: '8210...',
      blockName: 'Blok IV.F',
      groupLabel: 'Blok IV.F — Upah Buruh Harian / Borongan Kehutanan (Tanam, Tebang, Belah, Pikul/Angkut)',
      category: 'BIAYA_PRODUKSI',
      recommendedUnits: ['HOK', 'BORONGAN', 'M3', 'BATANG', 'HARI'],
      blockHint: 'Kolom 2 Rincian F Upah Buruh SPDT26-HTN tercetak prefix 8210...',
    },
  ],
};

const COMMON_UNITS = [
  'KG',
  'IKAT',
  'BUNGKUS',
  'LITER',
  'BUTIR',
  'BATANG',
  'BUAH',
  'EKOR',
  'POHON',
  'RUMPUN',
  'M3',
  'HOK',
  'BORONGAN',
  'SAK',
  'UNIT',
  'PAKET',
];

function getPrintedPrefixForProposal(item: ProposedCommodityItem): string {
  const groups = SECTOR_GROUP_MAP[item.sector] || [];
  const exact = groups.find(
    (g) =>
      g.groupCode.toUpperCase() === item.groupCode.toUpperCase() ||
      g.groupCode.replace(/\./g, '') === item.groupCode.replace(/\./g, '')
  );
  if (exact) return exact.printedPrefix;

  if (item.sector === 'KONSUMSI') {
    return formatKonsumsiPrintedPrefix(item.groupCode);
  }

  const digits = item.groupCode.replace(/[^0-9]/g, '');
  if (digits.length >= 3) return (digits + '....').slice(0, 7);
  return item.groupCode;
}

function stripAutoPrefixNote(rawNote: string): string {
  if (!rawNote) return '';
  const cleaned = rawNote
    .replace(/^\[Prefix\s+[^\]]+\]\s*/i, '')
    .replace(/^Prefix Kode Kuesioner\s+SPDT26-[A-Z]+\s+\([^)]+\):\s*[0-9.]+\s*/i, '')
    .trim();
  return cleaned;
}

// ============================================================================
// HD PROPORTIONAL REPORT ENGINE (MULTI-LINE WORD WRAP, ZERO '...' TRUNCATION,
// ZERO ASPECT-RATIO DISTORTION, A4 LANDSCAPE MULTI-PAGE PDF & HD PNG)
// ============================================================================

interface ReportColumnDef {
  title: string;
  x: number;
  w: number;
}

const REPORT_LOGICAL_WIDTH = 1400;
const REPORT_A4_LANDSCAPE_HEIGHT = 990; // Exact A4 Landscape ratio (1400 / 990 = 1.41414)

const REPORT_COLS: ReportColumnDef[] = [
  { title: 'NO', x: 28, w: 42 },
  { title: 'STATUS KODE', x: 76, w: 128 },
  { title: 'PREFIX KODE', x: 212, w: 102 },
  { title: 'NAMA KOMODITAS DIAJUKAN', x: 322, w: 250 },
  { title: 'SATUAN', x: 582, w: 94 },
  { title: 'KUESIONER / SUBSEKTOR', x: 686, w: 184 },
  { title: 'BLOK & RINCIAN KUESIONER', x: 880, w: 266 },
  { title: 'PETUGAS PENGAJU & CATATAN', x: 1156, w: 216 },
];

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const clean = (text || '-').trim();
  if (!clean) return ['-'];

  const paragraphs = clean.split(/\n+/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        // If single word itself exceeds maxWidth, split character by character
        if (ctx.measureText(word).width > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width <= maxWidth) {
              chunk += ch;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          currentLine = chunk;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : ['-'];
}

interface MeasuredProposalRow {
  item: ProposedCommodityItem;
  index: number;
  printedPrefix: string;
  nameLines: string[];
  unitLines: string[];
  sectorLines: string[];
  groupLines: string[];
  officerLines: string[];
  noteLines: string[];
  rowHeight: number;
}

function measureProposalRows(items: ProposedCommodityItem[]): MeasuredProposalRow[] {
  const measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d')!;
  const lineH = 17;

  return items.map((item, idx) => {
    const printedPrefix = getPrintedPrefixForProposal(item);
    const secObj = SECTOR_OPTIONS.find((s) => s.id === item.sector);
    const sectorText = secObj
      ? `${secObj.questionnaire} (${secObj.codeRange}) — ${secObj.shortLabel.replace(/\s*\(SPDT26-[A-Z]+\)/, '')}`
      : item.sector;

    ctx.font = 'bold 12.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    const nameLines = wrapTextLines(ctx, item.name, REPORT_COLS[3].w - 12);

    ctx.font = 'bold 11.5px "JetBrains Mono", monospace';
    const unitLines = wrapTextLines(ctx, item.unit, REPORT_COLS[4].w - 10);

    ctx.font = '600 11.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    const sectorLines = wrapTextLines(ctx, sectorText, REPORT_COLS[5].w - 12);

    ctx.font = '600 11.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    const groupFullText = `[${item.groupCode}] ${item.groupLabel}`;
    const groupLines = wrapTextLines(ctx, groupFullText, REPORT_COLS[6].w - 12);

    ctx.font = 'bold 11px "Plus Jakarta Sans", Montserrat, sans-serif';
    const officerFullText = `${item.officerCode} — ${item.officerName}`;
    const officerLines = wrapTextLines(ctx, officerFullText, REPORT_COLS[7].w - 10);

    const userNote = stripAutoPrefixNote(item.note || '');
    ctx.font = '500 10.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    const noteLines = userNote
      ? wrapTextLines(ctx, `Catatan: ${userNote}`, REPORT_COLS[7].w - 10)
      : [];

    const col7TotalLines = officerLines.length + noteLines.length;
    const maxLines = Math.max(
      1,
      nameLines.length,
      unitLines.length,
      sectorLines.length,
      groupLines.length,
      col7TotalLines
    );

    const rowHeight = Math.max(54, maxLines * lineH + 24);

    return {
      item,
      index: idx,
      printedPrefix,
      nameLines,
      unitLines,
      sectorLines,
      groupLines,
      officerLines,
      noteLines,
      rowHeight,
    };
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInstitutionalReportHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  totalItems: number,
  unreviewedCount: number,
  reviewedCount: number,
  activeSectorFilter: ProposedSectorType | 'ALL',
  pageNumber: number,
  totalPages: number,
  nowStr: string
): number {
  const activeSecObj =
    activeSectorFilter !== 'ALL'
      ? SECTOR_OPTIONS.find((s) => s.id === activeSectorFilter)
      : undefined;

  // Main Deep Navy Institutional Header Banner
  const bannerH = 112;
  const grad = ctx.createLinearGradient(0, 0, width, bannerH);
  grad.addColorStop(0, '#002248');
  grad.addColorStop(0.6, '#003D7A');
  grad.addColorStop(1, '#034C96');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, bannerH);

  // Top Gold/Sky Accent Stripe
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(0, 0, width * 0.7, 4);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(width * 0.7, 0, width * 0.3, 4);

  // Emblem Box (Left) - Custom Balance Scale / Neraca SPDT
  const logoX = 28;
  const logoY = 22;
  const logoSize = 68;
  drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 10);
  ctx.fillStyle = '#0A2540';
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Draw Balance Scale Vector inside Emblem Box
  const cx = logoX + logoSize / 2;
  const cy = logoY + logoSize / 2;
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx, cy + 20);
  ctx.moveTo(cx - 12, cy + 20);
  ctx.lineTo(cx + 12, cy + 20);
  ctx.stroke();

  // Beam
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 10);
  ctx.lineTo(cx + 20, cy - 10);
  ctx.stroke();

  // Left Scale Pan (Emerald)
  ctx.strokeStyle = '#4ADE80';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 10);
  ctx.lineTo(cx - 25, cy + 4);
  ctx.lineTo(cx - 15, cy + 4);
  ctx.closePath();
  ctx.stroke();

  // Right Scale Pan (Amber)
  ctx.strokeStyle = '#FB923C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 20, cy - 10);
  ctx.lineTo(cx + 15, cy + 4);
  ctx.lineTo(cx + 25, cy + 4);
  ctx.closePath();
  ctx.stroke();

  // Center Pivot Dot
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(cx, cy - 10, 3, 0, Math.PI * 2);
  ctx.fill();

  // Header Typography (Left-Center)
  const textX = logoX + logoSize + 18;
  ctx.fillStyle = '#7DD3FC';
  ctx.font = 'bold 11.5px "JetBrains Mono", monospace';
  ctx.fillText(
    'SURVEI PENYEMPURNAAN DIAGRAM TIMBANG NILAI TUKAR PETANI (SPDT NTP 2026)',
    textX,
    33
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 21px "Plus Jakarta Sans", Montserrat, sans-serif';
  ctx.fillText(
    activeSecObj
      ? `DAFTAR USULAN KODE KOMODITAS BARU — KUESIONER ${activeSecObj.questionnaire}`
      : 'DAFTAR USULAN KODE KOMODITAS BARU (8 KUESIONER SPDT NTP 2026)',
    textX,
    60
  );

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 13px "Plus Jakarta Sans", Montserrat, sans-serif';
  ctx.fillText(
    'Rekapitulasi Temuan Komoditas Lapangan Belum Berkode di Buku 5 Master Komoditas Beserta Prefix Kode Pengawas',
    textX,
    84
  );

  // Right Summary Cards inside Header Banner (2 Cards: TOTAL USULAN & BELUM ADA KODE)
  const cardW = 136;
  const cardH = 66;
  const cardGap = 12;
  const statCards = [
    {
      label: 'TOTAL USULAN',
      value: `${totalItems}`,
      sub: 'Komoditas',
      bg: 'rgba(15, 23, 42, 0.55)',
      border: '#38BDF8',
      valColor: '#FFFFFF',
    },
    {
      label: 'BELUM ADA KODE',
      value: `${unreviewedCount}`,
      sub: 'Perlu Kode',
      bg: 'rgba(15, 23, 42, 0.55)',
      border: '#FDA4AF',
      valColor: '#FECDD3',
    },
  ];

  const cardsStartX = width - 28 - (cardW * statCards.length + cardGap * (statCards.length - 1));
  const cardY = 23;

  statCards.forEach((sc, i) => {
    const cxPos = cardsStartX + i * (cardW + cardGap);
    drawRoundedRect(ctx, cxPos, cardY, cardW, cardH, 8);
    ctx.fillStyle = sc.bg;
    ctx.fill();
    ctx.strokeStyle = sc.border;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(sc.label, cxPos + 14, cardY + 19);

    ctx.fillStyle = sc.valColor;
    ctx.font = 'bold 21px "JetBrains Mono", monospace';
    ctx.fillText(sc.value, cxPos + 14, cardY + 46);
    const valWidth = ctx.measureText(sc.value).width;

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '600 11px "Plus Jakarta Sans", Montserrat, sans-serif';
    ctx.fillText(sc.sub, cxPos + 14 + valWidth + 8, cardY + 45);
  });

  // Metadata Sub-bar below Navy Banner
  const metaY = bannerH;
  const metaH = 38;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, metaY, width, metaH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, metaY + metaH);
  ctx.lineTo(width, metaY + metaH);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 12px "Plus Jakarta Sans", Montserrat, sans-serif';
  const scopeLabel = activeSecObj
    ? `Cakupan Kuesioner: ${activeSecObj.label}`
    : 'Cakupan Kuesioner: Semua 8 Kuesioner Resmi (SPDT26-K, TP, TH, TPR, TRK, IKT, IKB, HTN)';
  ctx.fillText(scopeLabel, 28, metaY + 23);

  ctx.fillStyle = '#475569';
  ctx.font = '600 11.5px "JetBrains Mono", monospace';
  const rightMeta = `Dicetak: ${nowStr}   |   Halaman ${pageNumber} dari ${totalPages}`;
  const rmWidth = ctx.measureText(rightMeta).width;
  ctx.fillText(rightMeta, width - 28 - rmWidth, metaY + 23);

  // Table Column Header Bar
  const thY = metaY + metaH;
  const thH = 42;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, thY, width, thH);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 11px "Plus Jakarta Sans", Montserrat, sans-serif';
  REPORT_COLS.forEach((col) => {
    ctx.fillText(col.title, col.x, thY + 25);
  });

  return thY + thH;
}

function drawProposalRowsOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  rows: MeasuredProposalRow[]
): number {
  let curY = startY;
  const lineH = 17;

  if (rows.length === 0) {
    const emptyH = 68;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, curY, width, emptyH);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, curY + emptyH);
    ctx.lineTo(width, curY + emptyH);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '600 13px "Plus Jakarta Sans", Montserrat, sans-serif';
    ctx.fillText(
      'Belum ada komoditas usulan pada filter kuesioner ini.',
      28,
      curY + 38
    );
    return curY + emptyH;
  }

  rows.forEach((row) => {
    const { item, index, rowHeight } = row;
    ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(0, curY, width, rowHeight);

    // Subtle vertical column dividers for high readability
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    REPORT_COLS.slice(1).forEach((col) => {
      ctx.beginPath();
      ctx.moveTo(col.x - 8, curY);
      ctx.lineTo(col.x - 8, curY + rowHeight);
      ctx.stroke();
    });

    // Row bottom border
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, curY + rowHeight);
    ctx.lineTo(width, curY + rowHeight);
    ctx.stroke();

    const textTopY = curY + 24;

    // 1. NO
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(String(index + 1).padStart(2, '0'), REPORT_COLS[0].x, textTopY);

    // 2. STATUS KODE Badge
    const isReviewed = item.status === 'DITINJAU_PML';
    drawRoundedRect(ctx, REPORT_COLS[1].x, curY + 12, 118, 24, 5);
    ctx.fillStyle = isReviewed ? '#FEF3C7' : '#FFE4E6';
    ctx.fill();
    ctx.strokeStyle = isReviewed ? '#F59E0B' : '#FB7185';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isReviewed ? '#92400E' : '#BE123C';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(
      isReviewed ? 'DITINJAU PML' : 'BELUM ADA KODE',
      REPORT_COLS[1].x + 9,
      curY + 28
    );

    // 3. PREFIX KODE Badge
    drawRoundedRect(ctx, REPORT_COLS[2].x, curY + 12, 90, 24, 5);
    ctx.fillStyle = '#EFF6FF';
    ctx.fill();
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#003D7A';
    ctx.font = 'bold 11.5px "JetBrains Mono", monospace';
    ctx.fillText(row.printedPrefix, REPORT_COLS[2].x + 10, curY + 28);

    // 4. NAMA KOMODITAS DIAJUKAN (Multi-line full text, zero '...')
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    row.nameLines.forEach((line, lIdx) => {
      ctx.fillText(line, REPORT_COLS[3].x, textTopY + lIdx * lineH);
    });

    // 5. SATUAN (Multi-line full text)
    ctx.fillStyle = '#003D7A';
    ctx.font = 'bold 11.5px "JetBrains Mono", monospace';
    row.unitLines.forEach((line, lIdx) => {
      ctx.fillText(line, REPORT_COLS[4].x, textTopY + lIdx * lineH);
    });

    // 6. KUESIONER / SUBSEKTOR (Multi-line full text)
    ctx.fillStyle = '#1E293B';
    ctx.font = '600 11.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    row.sectorLines.forEach((line, lIdx) => {
      ctx.fillText(line, REPORT_COLS[5].x, textTopY + lIdx * lineH);
    });

    // 7. BLOK & RINCIAN KUESIONER (Multi-line full text, zero '...')
    ctx.fillStyle = '#0F172A';
    ctx.font = '600 11.5px "Plus Jakarta Sans", Montserrat, sans-serif';
    row.groupLines.forEach((line, lIdx) => {
      ctx.fillText(line, REPORT_COLS[6].x, textTopY + lIdx * lineH);
    });

    // 8. PETUGAS PENGAJU & CATATAN (Multi-line full text, zero '...')
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "Plus Jakarta Sans", Montserrat, sans-serif';
    row.officerLines.forEach((line, lIdx) => {
      ctx.fillText(line, REPORT_COLS[7].x, textTopY + lIdx * lineH);
    });

    if (row.noteLines.length > 0) {
      ctx.fillStyle = '#475569';
      ctx.font = '500 10.5px "Plus Jakarta Sans", Montserrat, sans-serif';
      const noteStartOffset = row.officerLines.length * lineH;
      row.noteLines.forEach((line, lIdx) => {
        ctx.fillText(line, REPORT_COLS[7].x, textTopY + noteStartOffset + lIdx * lineH);
      });
    }

    curY += rowHeight;
  });

  return curY;
}

function drawInstitutionalReportFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  footerY: number,
  footerH: number,
  pageNumber: number,
  totalPages: number
) {
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, footerY, width, footerH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = '600 11px "Plus Jakarta Sans", Montserrat, sans-serif';
  ctx.fillText(
    'Portal Master Komoditas & Pemeriksaan PML SPDT NTP 2026 — Database Murni Buku 5 (2.986 Komoditas) & Rekapitulasi Usulan Lapangan',
    28,
    footerY + 29
  );

  ctx.fillStyle = '#003D7A';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  const pageLabel = `Halaman ${pageNumber} / ${totalPages}`;
  const plW = ctx.measureText(pageLabel).width;
  ctx.fillText(pageLabel, width - 28 - plW, footerY + 29);
}

/**
 * Renders 1 or more proportional A4 Landscape HD canvases (2800 x 1980 px at scale=2)
 * for multi-page PDF export so the aspect ratio is 100% locked (zero stretching/gepeng)
 * and all text wraps cleanly across multiple lines.
 */
function renderProposalsToPaginatedPdfCanvases(
  items: ProposedCommodityItem[],
  activeSectorFilter: ProposedSectorType | 'ALL'
): HTMLCanvasElement[] {
  const scale = 2; // 2800 x 1980 px HD
  const width = REPORT_LOGICAL_WIDTH;
  const pageHeight = REPORT_A4_LANDSCAPE_HEIGHT;
  const headerAndTableHeadH = 192; // 112 banner + 38 meta + 42 table header
  const footerH = 48;
  const maxRowsAreaH = pageHeight - headerAndTableHeadH - footerH - 12;

  const measuredRows = measureProposalRows(items);
  const pages: MeasuredProposalRow[][] = [];

  if (measuredRows.length === 0) {
    pages.push([]);
  } else {
    let currentPage: MeasuredProposalRow[] = [];
    let currentH = 0;
    for (const row of measuredRows) {
      if (currentPage.length > 0 && currentH + row.rowHeight > maxRowsAreaH) {
        pages.push(currentPage);
        currentPage = [row];
        currentH = row.rowHeight;
      } else {
        currentPage.push(row);
        currentH += row.rowHeight;
      }
    }
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
  }

  const totalItems = items.length;
  const reviewedCount = items.filter((i) => i.status === 'DITINJAU_PML').length;
  const unreviewedCount = totalItems - reviewedCount;
  const nowStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return pages.map((pageRows, pIdx) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = pageHeight * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    // Pure White A4 Landscape Sheet Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, pageHeight);

    const rowsStartY = drawInstitutionalReportHeader(
      ctx,
      width,
      totalItems,
      unreviewedCount,
      reviewedCount,
      activeSectorFilter,
      pIdx + 1,
      pages.length,
      nowStr
    );

    drawProposalRowsOnCanvas(ctx, width, rowsStartY, pageRows);

    drawInstitutionalReportFooter(
      ctx,
      width,
      pageHeight - footerH,
      footerH,
      pIdx + 1,
      pages.length
    );

    return canvas;
  });
}

/**
 * Renders a single continuous HD proportional PNG canvas (width 2800px at scale=2)
 * with full multi-line text wrapping and zero distortion.
 */
function renderProposalsToPngCanvas(
  items: ProposedCommodityItem[],
  activeSectorFilter: ProposedSectorType | 'ALL'
): HTMLCanvasElement {
  const scale = 2;
  const width = REPORT_LOGICAL_WIDTH;
  const headerAndTableHeadH = 192;
  const footerH = 48;

  const measuredRows = measureProposalRows(items);
  const rowsTotalH =
    measuredRows.length === 0
      ? 68
      : measuredRows.reduce((acc, r) => acc + r.rowHeight, 0);

  const totalHeight = headerAndTableHeadH + rowsTotalH + footerH;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, totalHeight);

  const totalItems = items.length;
  const reviewedCount = items.filter((i) => i.status === 'DITINJAU_PML').length;
  const unreviewedCount = totalItems - reviewedCount;
  const nowStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const rowsStartY = drawInstitutionalReportHeader(
    ctx,
    width,
    totalItems,
    unreviewedCount,
    reviewedCount,
    activeSectorFilter,
    1,
    1,
    nowStr
  );

  drawProposalRowsOnCanvas(ctx, width, rowsStartY, measuredRows);

  drawInstitutionalReportFooter(
    ctx,
    width,
    totalHeight - footerH,
    footerH,
    1,
    1
  );

  return canvas;
}

/**
 * Generates a valid multi-page binary PDF 1.4 Blob from an array of A4 Landscape HD canvases.
 * Every page is placed onto an exact A4 Landscape MediaBox (842 x 595 pt) with 1:1 proportional
 * aspect ratio (never stretched or squashed).
 */
function generateMultiPagePdfBlobFromCanvases(canvases: HTMLCanvasElement[]): Blob {
  const pdfPageW = 842; // A4 Landscape width in pt
  const pdfPageH = 595; // A4 Landscape height in pt

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  const pushStr = (s: string) => {
    const bytes = encoder.encode(s);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    currentOffset += b.length;
  };

  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  offsets[1] = currentOffset;
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages (Kids will be objects 3, 6, 9, ... for each page)
  const pageCount = canvases.length;
  const pageObjIds: number[] = [];
  for (let i = 0; i < pageCount; i++) {
    pageObjIds.push(3 + i * 3);
  }

  offsets[2] = currentOffset;
  pushStr(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>\nendobj\n`
  );

  canvases.forEach((canvas, idx) => {
    const pageObjId = 3 + idx * 3;
    const imgObjId = pageObjId + 1;
    const contentObjId = pageObjId + 2;

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const base64 = jpegDataUrl.split(',')[1];
    const binaryImg = atob(base64);
    const imgLength = binaryImg.length;
    const imgW = canvas.width;
    const imgH = canvas.height;

    // Page Object
    offsets[pageObjId] = currentOffset;
    pushStr(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPageW} ${pdfPageH}] /Resources << /XObject << /Im0 ${imgObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );

    // Image XObject
    offsets[imgObjId] = currentOffset;
    pushStr(
      `${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLength} >>\nstream\n`
    );
    const imgBytes = new Uint8Array(imgLength);
    for (let i = 0; i < imgLength; i++) {
      imgBytes[i] = binaryImg.charCodeAt(i);
    }
    pushBytes(imgBytes);
    pushStr('\nendstream\nendobj\n');

    // Proportional placement calculation (preserve exact aspect ratio inside 842 x 595 pt)
    const scale = Math.min(pdfPageW / imgW, pdfPageH / imgH);
    const drawW = Number((imgW * scale).toFixed(2));
    const drawH = Number((imgH * scale).toFixed(2));
    const offsetX = Number(((pdfPageW - drawW) / 2).toFixed(2));
    const offsetY = Number((pdfPageH - drawH).toFixed(2));

    const contentStream = `q\n${drawW} 0 0 ${drawH} ${offsetX} ${offsetY} cm\n/Im0 Do\nQ\n`;
    offsets[contentObjId] = currentOffset;
    pushStr(
      `${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
    );
  });

  const totalObjects = 2 + pageCount * 3;
  const xrefOffset = currentOffset;
  pushStr(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= totalObjects; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' });
}

export const ProposedCommodityTab: React.FC<ProposedCommodityTabProps> = ({
  proposals,
  commodities,
  officers,
  initialDraftName,
  onClearDraftName,
  onAddProposal,
  onUpdateProposal,
  onToggleStatus,
  onDeleteProposal,
  onCopyText,
  isFirebaseConnected,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  // Edit & Delete Confirmation Modal State
  const [editingProposal, setEditingProposal] = useState<ProposedCommodityItem | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ProposedCommodityItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State (Open to all officers without Admin login)
  const [name, setName] = useState(initialDraftName || '');
  const [unit, setUnit] = useState('KG');
  const [sector, setSector] = useState<ProposedSectorType>('KONSUMSI');
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [selectedOfficerCode, setSelectedOfficerCode] = useState('UMUM');
  const [customOfficerName, setCustomOfficerName] = useState('PETUGAS LAPANGAN');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter State for List
  const [filterSector, setFilterSector] = useState<ProposedSectorType | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialDraftName) {
      setEditingProposal(null);
      setName(initialDraftName);
      if (onClearDraftName) onClearDraftName();
    }
  }, [initialDraftName, onClearDraftName]);

  const currentSectorObj = useMemo(
    () => SECTOR_OPTIONS.find((s) => s.id === sector) || SECTOR_OPTIONS[0],
    [sector]
  );

  const availableGroups = useMemo(() => SECTOR_GROUP_MAP[sector] || [], [sector]);

  const handleSectorChange = (newSector: ProposedSectorType) => {
    setSector(newSector);
    setSelectedGroupIdx(0);
    const firstGroup = (SECTOR_GROUP_MAP[newSector] || [])[0];
    if (firstGroup && firstGroup.recommendedUnits.length > 0 && !editingProposal) {
      setUnit(firstGroup.recommendedUnits[0]);
    }
  };

  const currentGroup = availableGroups[selectedGroupIdx] || availableGroups[0];

  const handleSelectGroup = (idx: number) => {
    setSelectedGroupIdx(idx);
    const grp = availableGroups[idx];
    if (grp && grp.recommendedUnits.length > 0 && !editingProposal) {
      setUnit(grp.recommendedUnits[0]);
    }
  };

  // Start Editing an Existing Proposal
  const handleStartEdit = (item: ProposedCommodityItem) => {
    setFormError(null);
    setEditingProposal(item);
    setSector(item.sector);

    const groupsForSector = SECTOR_GROUP_MAP[item.sector] || [];
    const foundIdx = groupsForSector.findIndex(
      (g) =>
        g.groupCode.toUpperCase() === item.groupCode.toUpperCase() ||
        g.groupCode.replace(/\./g, '') === item.groupCode.replace(/\./g, '')
    );
    setSelectedGroupIdx(foundIdx >= 0 ? foundIdx : 0);

    setName(item.name);
    setUnit(item.unit);

    const matchingOfficer = officers.find((o) => o.code === item.officerCode);
    if (matchingOfficer) {
      setSelectedOfficerCode(matchingOfficer.code);
      setCustomOfficerName(matchingOfficer.name);
    } else {
      setSelectedOfficerCode('UMUM');
      setCustomOfficerName(item.officerName || 'PETUGAS LAPANGAN');
    }

    setNote(stripAutoPrefixNote(item.note || ''));

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCancelEdit = () => {
    setEditingProposal(null);
    setFormError(null);
    setName('');
    setNote('');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteItem) return;
    setIsDeleting(true);
    try {
      await onDeleteProposal(pendingDeleteItem.id);
      if (editingProposal && editingProposal.id === pendingDeleteItem.id) {
        handleCancelEdit();
      }
      setPendingDeleteItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Count proposals per questionnaire for badges
  const proposalCountsBySector = useMemo(() => {
    const counts: Record<string, number> = { ALL: proposals.length };
    SECTOR_OPTIONS.forEach((s) => {
      counts[s.id] = 0;
    });
    proposals.forEach((p) => {
      counts[p.sector] = (counts[p.sector] || 0) + 1;
    });
    return counts;
  }, [proposals]);

  // Live Buku 5 Duplicate / Similarity Checker
  const matchingBuku5Items = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) return [];

    const activePrefixes = currentSectorObj.codePrefixes;

    return commodities
      .filter((c) => {
        const cName = c.name.toLowerCase();
        return cName.includes(q) || tokens.every((t) => cName.includes(t));
      })
      .sort((a, b) => {
        const aInSector = activePrefixes.some((pref) => a.code.startsWith(pref)) ? 1 : 0;
        const bInSector = activePrefixes.some((pref) => b.code.startsWith(pref)) ? 1 : 0;
        return bInSector - aInSector;
      })
      .slice(0, 6);
  }, [name, commodities, currentSectorObj]);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return proposals.filter((item) => {
      if (filterSector !== 'ALL' && item.sector !== filterSector) return false;
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (!q) return true;
      const prefix = getPrintedPrefixForProposal(item).toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.groupCode.toLowerCase().includes(q) ||
        item.groupLabel.toLowerCase().includes(q) ||
        prefix.includes(q) ||
        item.officerName.toLowerCase().includes(q) ||
        item.officerCode.toLowerCase().includes(q) ||
        (item.note || '').toLowerCase().includes(q)
      );
    });
  }, [proposals, filterSector, filterCategory, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim().toUpperCase();
    const trimmedUnit = unit.trim().toUpperCase();
    if (trimmedName.length < 2) {
      setFormError('Nama komoditas minimal 2 karakter.');
      return;
    }
    if (!trimmedUnit) {
      setFormError('Satuan komoditas wajib diisi.');
      return;
    }

    const officerObj = officers.find((o) => o.code === selectedOfficerCode);
    const finalOfficerCode = officerObj ? officerObj.code : 'UMUM';
    const finalOfficerName = officerObj
      ? officerObj.name
      : customOfficerName.trim().toUpperCase() || 'PETUGAS LAPANGAN';

    const cleanedUserNote = stripAutoPrefixNote(note);
    const noteWithPrefix = cleanedUserNote
      ? `[Prefix ${currentGroup.printedPrefix}] ${cleanedUserNote}`
      : `Prefix Kode Kuesioner ${currentSectorObj.questionnaire} (${currentGroup.blockName}): ${currentGroup.printedPrefix}`;

    setIsSubmitting(true);
    try {
      const payload: Omit<ProposedCommodityItem, 'id' | 'createdAtMs'> = {
        name: trimmedName.slice(0, 160),
        unit: trimmedUnit.slice(0, 40),
        sector,
        category: currentGroup.category,
        groupCode: currentGroup.groupCode.slice(0, 40),
        groupLabel: currentGroup.groupLabel.slice(0, 160),
        officerCode: finalOfficerCode.slice(0, 16),
        officerName: finalOfficerName.slice(0, 120),
        note: noteWithPrefix.slice(0, 400),
        status: editingProposal ? editingProposal.status : 'BELUM_ADA_KODE',
      };

      if (editingProposal) {
        await onUpdateProposal(editingProposal.id, payload);
        setEditingProposal(null);
      } else {
        await onAddProposal(payload);
      }
      setName('');
      setNote('');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Gagal menyimpan pengajuan komoditas.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // EXPORT HANDLERS: CSV, PNG HD, PDF MULTI-PAGE A4 LANDSCAPE HD
  // ============================================================================
  const activeFilterSuffix = useMemo(() => {
    if (filterSector === 'ALL') return '8_kuesioner_spdt2026';
    const sec = SECTOR_OPTIONS.find((s) => s.id === filterSector);
    return sec ? `${sec.questionnaire.toLowerCase()}_spdt2026` : 'spdt2026';
  }, [filterSector]);

  const handleExportCsv = () => {
    const headers = [
      'No',
      'Status Kode',
      'Kuesioner',
      'Subsektor',
      'Blok & Kode Kelompok',
      'Prefix Kode Cetakan Kuesioner',
      'Nama Blok / Rincian Kuesioner',
      'Kategori',
      'Nama Komoditas Diajukan',
      'Satuan',
      'Kode Petugas',
      'Nama Petugas Pengaju',
      'Catatan Lapangan',
      'Waktu Pengajuan',
    ];

    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredProposals.map((item, idx) => {
      const secObj = SECTOR_OPTIONS.find((s) => s.id === item.sector);
      const prefixStr = getPrintedPrefixForProposal(item);
      const dateStr = new Date(item.createdAtMs).toLocaleString('id-ID');
      return [
        String(idx + 1),
        item.status === 'DITINJAU_PML' ? 'DITINJAU PML' : 'BELUM ADA KODE',
        secObj ? secObj.questionnaire : item.sector,
        secObj ? secObj.label : item.sector,
        item.groupCode,
        prefixStr,
        item.groupLabel,
        item.category,
        item.name,
        item.unit,
        item.officerCode,
        item.officerName,
        stripAutoPrefixNote(item.note || '') || item.note || '',
        dateStr,
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usulan_kode_komoditas_${activeFilterSuffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onCopyText('CSV Diunduh', `${filteredProposals.length} usulan komoditas diekspor ke CSV`);
  };

  const handleExportPng = () => {
    const canvas = renderProposalsToPngCanvas(filteredProposals, filterSector);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usulan_kode_komoditas_${activeFilterSuffix}_HD.png`;
      link.click();
      URL.revokeObjectURL(url);
      onCopyText('PNG HD Diunduh', `${filteredProposals.length} usulan diekspor ke PNG HD Proporsional`);
    }, 'image/png');
  };

  const handleExportPdf = () => {
    const canvases = renderProposalsToPaginatedPdfCanvases(filteredProposals, filterSector);
    const pdfBlob = generateMultiPagePdfBlobFromCanvases(canvases);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usulan_kode_komoditas_${activeFilterSuffix}_A4_HD.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    onCopyText(
      'PDF A4 HD Diunduh',
      `${filteredProposals.length} usulan (${canvases.length} Halaman A4 Landscape HD)`
    );
  };

  const activeFilterSectorObj = useMemo(
    () => (filterSector !== 'ALL' ? SECTOR_OPTIONS.find((s) => s.id === filterSector) : undefined),
    [filterSector]
  );

  // Merge recommended units for the active block with general units
  const unitButtons = useMemo(() => {
    const rec = currentGroup ? currentGroup.recommendedUnits : [];
    const combined = [...rec];
    COMMON_UNITS.forEach((u) => {
      if (!combined.includes(u)) combined.push(u);
    });
    return { recommended: rec, all: combined.slice(0, 14) };
  }, [currentGroup]);

  return (
    <div className="space-y-5 pt-4">
      {/* Top Info & Export Bar */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E293B] dark:bg-[#111827]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
              <span>USULAN KODE KOMODITAS 8 KUESIONER SPDT NTP 2026</span>
              <span>·</span>
              <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                {isFirebaseConnected
                  ? 'Sinkronisasi Real-Time Semua Perangkat Aktif'
                  : 'Mode Penyimpanan Lokal'}
              </span>
            </div>
            <h1 className="mt-1 text-base font-bold text-[#0F172A] sm:text-lg dark:text-[#F8FAFC]">
              Pengajuan Komoditas Belum Berkode (SPDT26-K, TP, TH, TPR, TRK, IKT, IKB, HTN)
            </h1>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Petugas PCL & PML dapat langsung mengajukan maupun mengedit komoditas lapangan yang
              belum memiliki kode di Buku 5 untuk <strong>ke-8 kuesioner subsektor</strong>. Hasil
              ekspor <strong>PDF A4 Landscape Multi-Halaman HD</strong> & <strong>PNG HD</strong>{' '}
              otomatis menampilkan teks penuh tanpa terpotong (<code className="font-bold">...</code>)
              dan proporsional.
            </p>
          </div>

          {/* 3 Export Buttons: CSV, PNG HD, PDF A4 HD */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-bold whitespace-nowrap text-[#0F172A] transition hover:border-[#003D7A] hover:text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]"
            >
              <span>Ekspor CSV ({filteredProposals.length})</span>
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#003D7A] bg-white px-3 text-xs font-bold whitespace-nowrap text-[#003D7A] transition hover:bg-[#EFF6FF] dark:border-[#38BDF8] dark:bg-[#0F172A] dark:text-[#38BDF8] dark:hover:bg-[#1E3A8A]/40"
            >
              <span>Ekspor PNG HD ({filteredProposals.length})</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#003D7A] px-3.5 text-xs font-bold whitespace-nowrap text-white transition hover:bg-[#002D5A] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
            >
              <span>Ekspor PDF A4 HD ({filteredProposals.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Form on Left (5 cols), Real-Time Table on Right (7 cols) */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* LEFT COLUMN: Open Entry & Edit Form for All 8 Questionnaires */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`rounded-lg border bg-white p-4 sm:p-5 lg:col-span-5 dark:bg-[#111827] ${
            editingProposal
              ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-500'
              : 'border-[#E2E8F0] dark:border-[#1E293B]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {editingProposal
                  ? 'Mode Edit Usulan Kode Komoditas'
                  : 'Form Usulan Kode Komoditas per Kuesioner'}
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {editingProposal
                  ? `Mengubah entrian: ${editingProposal.name}`
                  : 'Terbuka untuk seluruh PCL & PML tanpa login pengelola'}
              </p>
            </div>
            <span
              className={`tabular-code rounded px-2 py-0.5 text-[10px] font-bold ${
                editingProposal
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {editingProposal ? 'MODE EDIT' : currentSectorObj.questionnaire}
            </span>
          </div>

          {/* Active Edit Mode Banner */}
          {editingProposal && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/40">
              <div className="min-w-0">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  Sedang Mengedit:{' '}
                </span>
                <span className="font-extrabold text-[#0F172A] dark:text-white">
                  {editingProposal.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="shrink-0 rounded border border-amber-400 bg-white px-2 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-[#0F172A] dark:text-amber-300"
              >
                Batal Edit
              </button>
            </div>
          )}

          {formError && (
            <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
              {formError}
            </div>
          )}

          <div className="mt-4 space-y-3.5">
            {/* 1. Pilih Kuesioner Subsektor (8 Kuesioner) + Tombol Buka PDF Kuesioner */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  1. Pilih Kuesioner Subsektor (8 Kuesioner) *
                </label>
                <a
                  href={`${import.meta.env.BASE_URL}assets/aistudio/${currentSectorObj.pdfFileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-[#003D7A]/30 bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#003D7A] transition hover:bg-[#DBEAFE] dark:border-[#38BDF8]/40 dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]"
                >
                  <span>Buka PDF {currentSectorObj.questionnaire} ↗</span>
                </a>
              </div>

              {/* 8 Quick Questionnaire Selector Chips */}
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {SECTOR_OPTIONS.map((s) => {
                  const isActive = sector === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSectorChange(s.id)}
                      className={`flex flex-col items-start rounded border px-2 py-1.5 text-left transition ${
                        isActive
                          ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                      }`}
                    >
                      <span className="tabular-code text-[10px] font-extrabold">
                        {s.subsectorNumber === 'K' ? 'K · 01-11' : `Sub ${s.subsectorNumber} · ${s.codeRange}`}
                      </span>
                      <span className="truncate text-[10px] font-semibold opacity-95">
                        {s.questionnaire.replace('SPDT26-', '')}
                      </span>
                    </button>
                  );
                })}
              </div>

              <select
                value={sector}
                onChange={(e) => handleSectorChange(e.target.value as ProposedSectorType)}
                className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              >
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-[11px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                {currentSectorObj.fieldGuideNote}
              </p>
            </div>

            {/* 2. Blok & Rincian Kuesioner + Saran Prefix Kode 4 Digit Otomatis */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                2. Blok & Rincian pada Kuesioner {currentSectorObj.questionnaire} *
              </label>
              <select
                value={selectedGroupIdx}
                onChange={(e) => handleSelectGroup(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              >
                {availableGroups.map((g, idx) => (
                  <option key={g.groupCode + idx} value={idx}>
                    [{g.printedPrefix}] {g.groupLabel}
                  </option>
                ))}
              </select>

              {currentGroup && (
                <div className="mt-2 rounded-md border border-[#BFDBFE] bg-[#EFF6FF]/70 p-2.5 text-xs dark:border-[#1E3A8A] dark:bg-[#1E3A8A]/25">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        Saran Prefix Kode ({currentGroup.blockName}):
                      </span>
                      <span className="tabular-code rounded bg-[#003D7A] px-2 py-0.5 text-xs font-extrabold text-white dark:bg-[#0284C7]">
                        {currentGroup.printedPrefix}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onCopyText(
                          currentGroup.printedPrefix.replace(/\./g, ''),
                          `Prefix Kode ${currentGroup.printedPrefix}`
                        )
                      }
                      className="text-[11px] font-bold text-[#003D7A] hover:underline dark:text-[#38BDF8]"
                    >
                      Salin Digit Awal
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#334155] dark:text-[#CBD5E1]">
                    <span>
                      Kategori:{' '}
                      <strong className="text-[#003D7A] dark:text-[#38BDF8]">
                        {currentGroup.category.replace('_', ' ')}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Satuan Baku Blok:{' '}
                      <strong className="tabular-code">
                        {currentGroup.recommendedUnits.join(', ')}
                      </strong>
                    </span>
                  </div>
                  {currentGroup.blockHint && (
                    <div className="mt-1 text-[10px] text-[#475569] dark:text-[#94A3B8]">
                      {currentGroup.blockHint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Nama Komoditas */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                3. Nama Komoditas yang Diajukan *
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: DAUN KRATOM / PUPUK HAYATI CAIR / IKAN LOKAL..."
                className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold uppercase text-[#0F172A] placeholder:normal-case placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:focus:border-[#38BDF8]"
              />

              {/* Live Buku 5 Duplicate Warning */}
              {matchingBuku5Items.length > 0 && (
                <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs dark:border-amber-800/80 dark:bg-amber-950/40">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    ⚠ Peringatan: Ditemukan {matchingBuku5Items.length} komoditas serupa yang SUDAH
                    ADA KODE di Buku 5!
                  </div>
                  <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-200/90">
                    Periksa apakah komoditas yang Anda maksud sudah memiliki kode resmi Buku 5
                    berikut:
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {matchingBuku5Items.map((m) => {
                      const isSameSubsector = currentSectorObj.codePrefixes.some((pref) =>
                        m.code.startsWith(pref)
                      );
                      return (
                        <div
                          key={m.code}
                          className="flex items-center justify-between gap-2 rounded border border-amber-200 bg-white px-2.5 py-1.5 dark:border-amber-900 dark:bg-[#111827]"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="tabular-code font-bold text-[#003D7A] dark:text-[#38BDF8]">
                                {m.code}
                              </span>
                              {isSameSubsector && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                  Sesuai {currentSectorObj.questionnaire}
                                </span>
                              )}
                              <span className="truncate font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                                {m.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                              Satuan: {m.unit} · {m.questionnaireCode} ({m.groupName})
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onCopyText(m.code, `${m.code} - ${m.name}`)}
                            className="shrink-0 rounded bg-[#003D7A] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#002D5A] dark:bg-[#0284C7]"
                          >
                            Pakai Kode Ini
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Satuan Standar (Prioritaskan Satuan Baku Blok Kuesioner) */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                4. Satuan Standar sesuai Blok Kuesioner *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Contoh: KG, IKAT, LITER, BATANG, M3, HOK..."
                className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-bold uppercase text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {unitButtons.all.map((u) => {
                  const isRecommended = unitButtons.recommended.includes(u);
                  const isSelected = unit.toUpperCase() === u;
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`tabular-code rounded border px-2 py-0.5 text-[10px] font-bold transition ${
                        isSelected
                          ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                          : isRecommended
                            ? 'border-[#93C5FD] bg-[#EFF6FF] text-[#003D7A] hover:border-[#003D7A] dark:border-[#1E3A8A] dark:bg-[#1E3A8A]/30 dark:text-[#38BDF8]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]'
                      }`}
                    >
                      {u}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Petugas Pengaju */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                5. Petugas Pengaju (Kode 001–045 / Umum)
              </label>
              <select
                value={selectedOfficerCode}
                onChange={(e) => setSelectedOfficerCode(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              >
                <option value="UMUM">UMUM — Input Nama Petugas Manual</option>
                {officers.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </option>
                ))}
              </select>
              {selectedOfficerCode === 'UMUM' && (
                <input
                  type="text"
                  maxLength={120}
                  value={customOfficerName}
                  onChange={(e) => setCustomOfficerName(e.target.value)}
                  placeholder="Ketik nama petugas pengaju..."
                  className="mt-1.5 h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold uppercase text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              )}
            </div>

            {/* 6. Catatan / Keterangan Lapangan */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                6. Catatan / Rincian Halaman Kuesioner (Opsional)
              </label>
              <textarea
                rows={2}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`Contoh: Ditemukan pada sampel ${currentSectorObj.questionnaire} ${currentGroup?.blockName || ''}, nama lokal daerah...`}
                className="mt-1 w-full rounded-md border border-[#CBD5E1] bg-white p-2.5 text-xs font-medium text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex h-10 flex-1 items-center justify-center rounded-md px-4 text-xs font-bold text-white transition disabled:opacity-50 ${
                  editingProposal
                    ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500'
                    : 'bg-[#003D7A] hover:bg-[#002D5A] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]'
                }`}
              >
                {isSubmitting
                  ? 'Menyimpan...'
                  : editingProposal
                    ? `Simpan Perubahan Usulan (${currentSectorObj.questionnaire})`
                    : `+ Ajukan Komoditas ke ${currentSectorObj.questionnaire} (Prefix ${currentGroup?.printedPrefix || ''})`}
              </button>
              {editingProposal && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="h-10 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-bold text-[#334155] hover:bg-[#E2E8F0] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN: Real-Time Proposed Commodities List Filtered per Questionnaire */}
        <div className="space-y-4 lg:col-span-7">
          {/* Filter & Search Bar (Flex-wrap, zero horizontal scrollbar) */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 dark:border-[#1E293B] dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Daftar Usulan per Kuesioner ({filteredProposals.length} dari {proposals.length})
                </span>
                {activeFilterSectorObj && (
                  <a
                    href={`${import.meta.env.BASE_URL}assets/aistudio/${activeFilterSectorObj.pdfFileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded border border-[#003D7A]/30 bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#003D7A] hover:bg-[#DBEAFE] dark:border-[#38BDF8]/40 dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]"
                  >
                    <span>Lihat PDF {activeFilterSectorObj.questionnaire} ↗</span>
                  </a>
                )}
              </div>
              {(filterSector !== 'ALL' || filterCategory !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterSector('ALL');
                    setFilterCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-[#003D7A] hover:underline dark:text-[#38BDF8]"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama komoditas usulan, prefix kode (misal 210, 3205, 6203), blok, atau nama petugas..."
              className="h-9 w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] focus:border-[#003D7A] focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
            />

            {/* Per-Questionnaire Filter Tabs (All 8 Questionnaires with counts) */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterSector('ALL')}
                className={`h-7 rounded border px-2.5 text-[11px] font-semibold whitespace-nowrap transition ${
                  filterSector === 'ALL'
                    ? 'border-[#0F172A] bg-[#0F172A] text-white dark:border-[#38BDF8] dark:bg-[#38BDF8] dark:text-[#0F172A]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#94A3B8]'
                }`}
              >
                Semua 8 Kuesioner ({proposalCountsBySector.ALL || 0})
              </button>
              {SECTOR_OPTIONS.map((sec) => {
                const count = proposalCountsBySector[sec.id] || 0;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setFilterSector(sec.id)}
                    className={`h-7 rounded border px-2.5 text-[11px] font-semibold whitespace-nowrap transition ${
                      filterSector === sec.id
                        ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                        : 'border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#94A3B8]'
                    }`}
                  >
                    {sec.subsectorNumber}·{sec.questionnaire.replace('SPDT26-', '')} ({count})
                  </button>
                );
              })}
            </div>

            {/* Category Filter Buttons (Flex-wrap) */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'Semua Kategori Blok' },
                  { id: 'KONSUMSI', label: 'Blok V/VI Konsumsi RT' },
                  { id: 'PRODUKSI', label: 'Blok III/IV Produksi' },
                  { id: 'BIAYA_PRODUKSI', label: 'Blok IV/V Biaya Produksi (A–F)' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`h-7 rounded border px-2.5 text-[11px] font-semibold whitespace-nowrap transition ${
                    filterCategory === cat.id
                      ? 'border-[#003D7A] bg-[#EFF6FF] text-[#003D7A] dark:border-[#38BDF8] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Proposals List */}
          {filteredProposals.length === 0 ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center dark:border-[#1E293B] dark:bg-[#111827]">
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Belum ada usulan kode komoditas pada filter kuesioner ini
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                Pilih kuesioner di formulir sebelah kiri (SPDT26-K, TP, TH, TPR, TRK, IKT, IKB, atau
                HTN) untuk mengajukan komoditas lapangan yang belum memiliki kode di Buku 5.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white dark:border-[#1E293B] dark:bg-[#111827]">
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {filteredProposals.map((item, idx) => {
                  const secObj = SECTOR_OPTIONS.find((s) => s.id === item.sector);
                  const printedPrefix = getPrintedPrefixForProposal(item);
                  const isReviewed = item.status === 'DITINJAU_PML';
                  const isCurrentlyEditing = editingProposal?.id === item.id;
                  const cleanNote = stripAutoPrefixNote(item.note || '');
                  const dateStr = new Date(item.createdAtMs).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col justify-between gap-3 p-4 transition sm:flex-row sm:items-start ${
                        isCurrentlyEditing
                          ? 'bg-amber-50/70 dark:bg-amber-950/25'
                          : 'hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        {/* Top status, questionnaire & printed prefix row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="tabular-code font-bold text-[#64748B]">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`tabular-code rounded px-2 py-0.5 text-[10px] font-extrabold ${
                              isReviewed
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                            }`}
                          >
                            {isReviewed ? 'DITINJAU PML' : 'BELUM ADA KODE'}
                          </span>
                          <span
                            title="Prefix Kode Cetakan Kuesioner (Kolom Diisi Pengawas)"
                            className="tabular-code rounded border border-[#93C5FD] bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-extrabold text-[#003D7A] dark:border-[#1E3A8A] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]"
                          >
                            Prefix: {printedPrefix}
                          </span>
                          <span className="text-[#CBD5E1] dark:text-[#334155]">·</span>
                          <span className="font-bold text-[#003D7A] dark:text-[#38BDF8]">
                            {secObj ? secObj.shortLabel : item.sector}
                          </span>
                          {secObj && (
                            <a
                              href={`${import.meta.env.BASE_URL}assets/aistudio/${secObj.pdfFileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-[#64748B] underline hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:text-[#38BDF8]"
                            >
                              PDF {secObj.questionnaire} ↗
                            </a>
                          )}
                        </div>

                        {/* Commodity Name & Unit */}
                        <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5">
                          <h3 className="text-sm font-extrabold text-[#0F172A] sm:text-base dark:text-[#F8FAFC]">
                            {item.name}
                          </h3>
                          <span className="tabular-code text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                            Satuan: {item.unit}
                          </span>
                        </div>

                        {/* Specific Block / Subgroup Location */}
                        <div className="mt-1 text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]">
                          Blok / Rincian:{' '}
                          <span className="tabular-code font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            [{item.groupCode}]
                          </span>{' '}
                          {item.groupLabel}
                        </div>

                        {/* Note if present */}
                        {cleanNote && (
                          <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                            Catatan: &ldquo;{cleanNote}&rdquo;
                          </p>
                        )}

                        {/* Submitter & Timestamp */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          <span>
                            Diajukan oleh:{' '}
                            <strong className="tabular-code text-[#334155] dark:text-[#CBD5E1]">
                              {item.officerCode}
                            </strong>{' '}
                            ({item.officerName})
                          </span>
                          <span>·</span>
                          <span className="tabular-code">{dateStr}</span>
                        </div>
                      </div>

                      {/* Action Buttons: Status Toggle, Edit, Salin, Hapus (with Confirmation Modal) */}
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-col sm:items-end">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(item)}
                          className="h-7 rounded border border-[#CBD5E1] bg-white px-2.5 text-[11px] font-semibold whitespace-nowrap text-[#334155] transition hover:border-[#003D7A] hover:text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
                        >
                          {isReviewed ? 'Tandai Belum Ada Kode' : 'Tandai Ditinjau PML'}
                        </button>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className={`h-7 rounded border px-2.5 text-[11px] font-bold transition ${
                              isCurrentlyEditing
                                ? 'border-amber-600 bg-amber-600 text-white'
                                : 'border-[#003D7A]/40 bg-[#EFF6FF] text-[#003D7A] hover:bg-[#DBEAFE] dark:border-[#38BDF8]/40 dark:bg-[#1E3A8A]/30 dark:text-[#38BDF8]'
                            }`}
                          >
                            {isCurrentlyEditing ? 'Sedang Diedit' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onCopyText(
                                `[USULAN ${secObj?.questionnaire || item.sector} | Prefix ${printedPrefix}] ${item.name} (${item.unit}) — ${item.groupLabel} | Pengaju: ${item.officerCode} ${item.officerName}`,
                                `Usulan ${item.name}`
                              )
                            }
                            className="h-7 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-[11px] font-semibold text-[#475569] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]"
                          >
                            Salin
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteItem(item)}
                            className="h-7 rounded border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal Window */}
      {pendingDeleteItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => !isDeleting && setPendingDeleteItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-proposal-modal-title"
        >
          <div
            className="w-full max-w-md rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-xl dark:border-[#1E293B] dark:bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3 dark:border-[#1E293B]">
              <div>
                <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                  KONFIRMASI HAPUS USULAN
                </span>
                <h3
                  id="delete-proposal-modal-title"
                  className="mt-1 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  Hapus Entrian Usulan Kode Komoditas?
                </h3>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDeleteItem(null)}
                className="rounded px-2 py-1 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 space-y-2 text-xs text-[#334155] dark:text-[#CBD5E1]">
              <p>
                Apakah Anda yakin ingin menghapus usulan komoditas berikut dari daftar pengajuan?
              </p>
              <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 dark:border-[#1E293B] dark:bg-[#0F172A]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                    {pendingDeleteItem.name}
                  </span>
                  <span className="tabular-code rounded bg-[#003D7A] px-2 py-0.5 text-[11px] font-bold text-white dark:bg-[#0284C7]">
                    Satuan: {pendingDeleteItem.unit}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                  <div>
                    Prefix Kode:{' '}
                    <strong className="tabular-code text-[#003D7A] dark:text-[#38BDF8]">
                      {getPrintedPrefixForProposal(pendingDeleteItem)}
                    </strong>{' '}
                    · Kuesioner:{' '}
                    <strong>
                      {SECTOR_OPTIONS.find((s) => s.id === pendingDeleteItem.sector)
                        ?.questionnaire || pendingDeleteItem.sector}
                    </strong>
                  </div>
                  <div className="mt-0.5">
                    Blok/Rincian: [{pendingDeleteItem.groupCode}] {pendingDeleteItem.groupLabel}
                  </div>
                  <div className="mt-0.5">
                    Pengaju: {pendingDeleteItem.officerCode} — {pendingDeleteItem.officerName}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Tindakan ini akan menghapus usulan dari daftar bersama di seluruh perangkat.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDeleteItem(null)}
                className="h-9 rounded-md border border-[#CBD5E1] bg-white px-4 text-xs font-bold text-[#334155] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-9 rounded-md bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Usulan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
