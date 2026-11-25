import React, { useState, useMemo, useEffect } from 'react';
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
  onToggleStatus: (item: ProposedCommodityItem) => Promise<void>;
  onDeleteProposal: (id: string) => Promise<void>;
  onCopyText: (text: string, label: string) => void;
  isFirebaseConnected: boolean;
}

export interface GroupOptionDef {
  groupCode: string;
  groupLabel: string;
  category: CategoryType;
}

export const SECTOR_OPTIONS: {
  id: ProposedSectorType;
  label: string;
  shortLabel: string;
  questionnaire: string;
  codeRange: string;
}[] = [
  {
    id: 'KONSUMSI',
    label: '01–11 Konsumsi Rumah Tangga (SPDT26-K)',
    shortLabel: 'Konsumsi RT (SPDT26-K)',
    questionnaire: 'SPDT26-K',
    codeRange: '01–11',
  },
  {
    id: 'TANAMAN_PANGAN',
    label: '21–22 Tanaman Pangan (SPDT26-TP)',
    shortLabel: 'Tanaman Pangan (SPDT26-TP)',
    questionnaire: 'SPDT26-TP',
    codeRange: '21–22',
  },
  {
    id: 'HORTIKULTURA',
    label: '31–32 Hortikultura (SPDT26-TH)',
    shortLabel: 'Hortikultura (SPDT26-TH)',
    questionnaire: 'SPDT26-TH',
    codeRange: '31–32',
  },
  {
    id: 'PERKEBUNAN',
    label: '41–42 Perkebunan (SPDT26-TPR)',
    shortLabel: 'Perkebunan (SPDT26-TPR)',
    questionnaire: 'SPDT26-TPR',
    codeRange: '41–42',
  },
  {
    id: 'PETERNAKAN',
    label: '51–52 Peternakan (SPDT26-TRK)',
    shortLabel: 'Peternakan (SPDT26-TRK)',
    questionnaire: 'SPDT26-TRK',
    codeRange: '51–52',
  },
  {
    id: 'PERIKANAN_TANGKAP',
    label: '61–62 Perikanan Tangkap (SPDT26-IKT)',
    shortLabel: 'Perikanan Tangkap (SPDT26-IKT)',
    questionnaire: 'SPDT26-IKT',
    codeRange: '61–62',
  },
  {
    id: 'PERIKANAN_BUDIDAYA',
    label: '71–72 Perikanan Budidaya (SPDT26-IKB)',
    shortLabel: 'Perikanan Budidaya (SPDT26-IKB)',
    questionnaire: 'SPDT26-IKB',
    codeRange: '71–72',
  },
  {
    id: 'KEHUTANAN',
    label: '81–82 Kehutanan (SPDT26-HTN)',
    shortLabel: 'Kehutanan (SPDT26-HTN)',
    questionnaire: 'SPDT26-HTN',
    codeRange: '81–82',
  },
];

const KONSUMSI_GROUP_OPTIONS: GroupOptionDef[] = [
  ...BLOK_7A_SUBGROUPS.map((s) => ({
    groupCode: s.code,
    groupLabel: `Blok V (${s.code}) ${s.label}`,
    category: 'KONSUMSI' as CategoryType,
  })),
  ...BLOK_7B_GROUPS.flatMap((g) =>
    g.subgroups.map((s) => ({
      groupCode: s.code,
      groupLabel: `Blok VI (${s.code}) ${s.label}`,
      category: 'KONSUMSI' as CategoryType,
    }))
  ),
];

const SECTOR_GROUP_MAP: Record<ProposedSectorType, GroupOptionDef[]> = {
  KONSUMSI: KONSUMSI_GROUP_OPTIONS,
  TANAMAN_PANGAN: [
    { groupCode: '2101', groupLabel: 'Produksi Padi & Palawija (2101)', category: 'PRODUKSI' },
    { groupCode: '2102', groupLabel: 'Produksi Ikutan Tanaman Pangan (2102)', category: 'PRODUKSI' },
    { groupCode: '2201', groupLabel: 'Biaya Bibit/Benih Tanaman Pangan (2201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '2202', groupLabel: 'Biaya Pupuk & Pestisida Tanaman Pangan (2202)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '2203', groupLabel: 'Biaya Sewa, Upah & Jasa Pertanian (2203)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '2204', groupLabel: 'Biaya Produksi Tanaman Pangan Lainnya (2204)', category: 'BIAYA_PRODUKSI' },
  ],
  HORTIKULTURA: [
    { groupCode: '3101', groupLabel: 'Produksi Sayuran & Buah Semusim (3101)', category: 'PRODUKSI' },
    { groupCode: '3102', groupLabel: 'Produksi Buah Tahunan & Tanaman Obat/Hias (3102)', category: 'PRODUKSI' },
    { groupCode: '3201', groupLabel: 'Biaya Bibit/Benih Hortikultura (3201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '3202', groupLabel: 'Biaya Pupuk & Pestisida Hortikultura (3202)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '3203', groupLabel: 'Biaya Sewa, Upah & Pengeluaran Hortikultura Lainnya (3203)', category: 'BIAYA_PRODUKSI' },
  ],
  PERKEBUNAN: [
    { groupCode: '4101', groupLabel: 'Produksi Tanaman Perkebunan Semusim (4101)', category: 'PRODUKSI' },
    { groupCode: '4102', groupLabel: 'Produksi Tanaman Perkebunan Tahunan (4102)', category: 'PRODUKSI' },
    { groupCode: '4201', groupLabel: 'Biaya Bibit/Benih Perkebunan (4201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '4202', groupLabel: 'Biaya Pupuk, Obat & Bahan Kimia Perkebunan (4202)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '4203', groupLabel: 'Biaya Upah, Sewa & Pengeluaran Perkebunan Lainnya (4203)', category: 'BIAYA_PRODUKSI' },
  ],
  PETERNAKAN: [
    { groupCode: '5101', groupLabel: 'Produksi Ternak Besar & Kecil (5101)', category: 'PRODUKSI' },
    { groupCode: '5102', groupLabel: 'Produksi Unggas & Hasil Ternak/Telur/Susu (5102)', category: 'PRODUKSI' },
    { groupCode: '5201', groupLabel: 'Biaya Bibit/Bakalan Ternak & Unggas (5201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '5202', groupLabel: 'Biaya Pakan & Obat-obatan Ternak (5202)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '5203', groupLabel: 'Biaya Kandang, Upah & Pengeluaran Peternakan Lainnya (5203)', category: 'BIAYA_PRODUKSI' },
  ],
  PERIKANAN_TANGKAP: [
    { groupCode: '6101', groupLabel: 'Produksi Penangkapan Ikan Perairan Umum/Daratan (6101)', category: 'PRODUKSI' },
    { groupCode: '6102', groupLabel: 'Produksi Penangkapan Ikan Laut (6102)', category: 'PRODUKSI' },
    { groupCode: '6201', groupLabel: 'Biaya Perbekalan, BBM, Es & Umpan Tangkap (6201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '6202', groupLabel: 'Biaya Pemeliharaan Perahu/Mesin/Alat Tangkap & Upah (6202)', category: 'BIAYA_PRODUKSI' },
  ],
  PERIKANAN_BUDIDAYA: [
    { groupCode: '7101', groupLabel: 'Produksi Budidaya Air Tawar/Payau/Laut (7101–7103)', category: 'PRODUKSI' },
    { groupCode: '7104', groupLabel: 'Produksi Budidaya Ikan Hias (7104)', category: 'PRODUKSI' },
    { groupCode: '7201', groupLabel: 'Biaya Benih, Pakan, Pupuk & Obat Budidaya Ikan (7201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '7202', groupLabel: 'Biaya Sewa Kolam/Tambak, Upah & Peralatan Budidaya (7202)', category: 'BIAYA_PRODUKSI' },
  ],
  KEHUTANAN: [
    { groupCode: '8101', groupLabel: 'Produksi Kayu & Hasil Hutan Bukan Kayu / Penangkaran (8101–8103)', category: 'PRODUKSI' },
    { groupCode: '8201', groupLabel: 'Biaya Bibit, Pupuk & Sarana Produksi Kehutanan (8201)', category: 'BIAYA_PRODUKSI' },
    { groupCode: '8202', groupLabel: 'Biaya Upah Tebang/Angkut & Pengeluaran Kehutanan Lainnya (8202)', category: 'BIAYA_PRODUKSI' },
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
  'PORSI',
  'BOTOL',
  'SACHET',
  'KALENG',
  'POHON',
  'PAKET',
];

/**
 * Renders the proposal list onto a high-DPI HTML5 Canvas for PNG & PDF export.
 */
function renderProposalsToCanvas(items: ProposedCommodityItem[]): HTMLCanvasElement {
  const scale = 2;
  const width = 1240;
  const rowHeight = 46;
  const headerHeight = 135;
  const tableHeaderHeight = 42;
  const footerHeight = 52;
  const rowsCount = Math.max(1, items.length);
  const height = headerHeight + tableHeaderHeight + rowsCount * rowHeight + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Top Institutional Banner
  ctx.fillStyle = '#003D7A';
  ctx.fillRect(0, 0, width, 96);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Montserrat, sans-serif';
  ctx.fillText('DAFTAR PENGAJUAN KOMODITAS BELUM BERKODE — SPDT NTP 2026', 28, 38);

  ctx.fillStyle = '#BAE6FD';
  ctx.font = '600 13px Montserrat, sans-serif';
  ctx.fillText(
    'Rekapitulasi Komoditas Lapangan yang Belum Tercantum di Buku 5 Master Komoditas',
    28,
    62
  );

  const nowStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillText(`Total Usulan: ${items.length} Komoditas  |  Dicetak: ${nowStr}`, 28, 84);

  // Subtitle Strip
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 96, width, 39);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 135);
  ctx.lineTo(width, 135);
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = '600 12px Montserrat, sans-serif';
  ctx.fillText(
    'Status: BELUM ADA KODE DI BUKU 5 MASTER KOMODITAS (Diajukan oleh PCL / PML Lapangan)',
    28,
    120
  );

  // Table Columns Definition
  const cols = [
    { title: 'NO', x: 20, w: 40 },
    { title: 'STATUS KODE', x: 65, w: 135 },
    { title: 'NAMA KOMODITAS DIAJUKAN', x: 208, w: 235 },
    { title: 'SATUAN', x: 450, w: 80 },
    { title: 'KUESIONER / SUBSEKTOR', x: 538, w: 185 },
    { title: 'KELOMPOK / SUBKELOMPOK', x: 730, w: 245 },
    { title: 'PETUGAS & CATATAN', x: 982, w: 240 },
  ];

  // Table Header
  const thY = headerHeight;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, thY, width, tableHeaderHeight);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 11px Montserrat, sans-serif';
  cols.forEach((c) => {
    ctx.fillText(c.title, c.x, thY + 25);
  });

  const truncate = (str: string, maxChars: number) =>
    str.length > maxChars ? str.slice(0, maxChars - 1) + '…' : str;

  if (items.length === 0) {
    const rY = thY + tableHeaderHeight;
    ctx.fillStyle = '#64748B';
    ctx.font = '500 13px Montserrat, sans-serif';
    ctx.fillText('Belum ada komoditas yang diajukan.', 28, rY + 28);
  } else {
    items.forEach((item, idx) => {
      const rY = thY + tableHeaderHeight + idx * rowHeight;
      ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      ctx.fillRect(0, rY, width, rowHeight);

      // Row bottom border
      ctx.strokeStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(0, rY + rowHeight);
      ctx.lineTo(width, rY + rowHeight);
      ctx.stroke();

      // 1. No
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(String(idx + 1).padStart(2, '0'), cols[0].x, rY + 27);

      // 2. Status Badge
      const isReviewed = item.status === 'DITINJAU_PML';
      ctx.fillStyle = isReviewed ? '#FEF3C7' : '#FFE4E6';
      ctx.fillRect(cols[1].x, rY + 12, 122, 22);
      ctx.fillStyle = isReviewed ? '#92400E' : '#BE123C';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(isReviewed ? 'DITINJAU PML' : 'BELUM ADA KODE', cols[1].x + 8, rY + 27);

      // 3. Commodity Name
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Montserrat, sans-serif';
      ctx.fillText(truncate(item.name, 30), cols[2].x, rY + 27);

      // 4. Unit
      ctx.fillStyle = '#003D7A';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(truncate(item.unit, 10), cols[3].x, rY + 27);

      // 5. Sector
      const secObj = SECTOR_OPTIONS.find((s) => s.id === item.sector);
      ctx.fillStyle = '#334155';
      ctx.font = '600 11px Montserrat, sans-serif';
      ctx.fillText(
        truncate(secObj ? secObj.shortLabel : item.sector, 26),
        cols[4].x,
        rY + 27
      );

      // 6. Group / Subgroup
      ctx.fillStyle = '#0F172A';
      ctx.font = '600 11px Montserrat, sans-serif';
      ctx.fillText(
        truncate(`[${item.groupCode}] ${item.groupLabel}`, 34),
        cols[5].x,
        rY + 27
      );

      // 7. Officer & Note
      ctx.fillStyle = '#334155';
      ctx.font = '600 11px Montserrat, sans-serif';
      const officerText = `${item.officerCode} - ${item.officerName}`;
      ctx.fillText(truncate(officerText, 32), cols[6].x, rY + 20);
      ctx.fillStyle = '#64748B';
      ctx.font = '500 10px Montserrat, sans-serif';
      ctx.fillText(truncate(item.note || '-', 36), cols[6].x, rY + 35);
    });
  }

  // Footer
  const fY = height - footerHeight;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, fY, width, footerHeight);
  ctx.fillStyle = '#64748B';
  ctx.font = '600 11px Montserrat, sans-serif';
  ctx.fillText(
    'Portal Master Komoditas & Pemeriksaan PML SPDT NTP 2026 — Database Murni Buku 5 & Rekap Pengajuan Lapangan',
    28,
    fY + 30
  );

  return canvas;
}

/**
 * Generates a valid binary PDF 1.4 Blob containing the rendered high-DPI canvas image,
 * allowing direct 1-click `.pdf` file download without `window.open` popup blockers.
 */
function generatePdfBlobFromCanvas(canvas: HTMLCanvasElement): Blob {
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const base64 = jpegDataUrl.split(',')[1];
  const binaryImg = atob(base64);
  const imgLength = binaryImg.length;

  const imgW = canvas.width;
  const imgH = canvas.height;

  // Landscape A4 width = 842 pt, scale height proportionally
  const pdfPageW = 842;
  const pdfPageH = Math.max(595, Math.round((imgH / imgW) * pdfPageW));

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

  // Object 2: Pages
  offsets[2] = currentOffset;
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page
  offsets[3] = currentOffset;
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPageW} ${pdfPageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // Object 4: Image XObject
  offsets[4] = currentOffset;
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLength} >>\nstream\n`
  );
  const imgBytes = new Uint8Array(imgLength);
  for (let i = 0; i < imgLength; i++) {
    imgBytes[i] = binaryImg.charCodeAt(i);
  }
  pushBytes(imgBytes);
  pushStr('\nendstream\nendobj\n');

  // Object 5: Content Stream
  const contentStream = `q\n${pdfPageW} 0 0 ${pdfPageH} 0 0 cm\n/Im0 Do\nQ\n`;
  offsets[5] = currentOffset;
  pushStr(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
  );

  // XRef Table
  const xrefOffset = currentOffset;
  pushStr('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
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
  onToggleStatus,
  onDeleteProposal,
  onCopyText,
  isFirebaseConnected,
}) => {
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
      setName(initialDraftName);
      if (onClearDraftName) onClearDraftName();
    }
  }, [initialDraftName, onClearDraftName]);

  const availableGroups = useMemo(() => SECTOR_GROUP_MAP[sector] || [], [sector]);

  useEffect(() => {
    setSelectedGroupIdx(0);
  }, [sector]);

  const currentGroup = availableGroups[selectedGroupIdx] || availableGroups[0];

  // Live Buku 5 Duplicate / Similarity Checker
  const matchingBuku5Items = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) return [];

    return commodities
      .filter((c) => {
        const cName = c.name.toLowerCase();
        return cName.includes(q) || tokens.every((t) => cName.includes(t));
      })
      .slice(0, 6);
  }, [name, commodities]);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return proposals.filter((item) => {
      if (filterSector !== 'ALL' && item.sector !== filterSector) return false;
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.groupCode.toLowerCase().includes(q) ||
        item.groupLabel.toLowerCase().includes(q) ||
        item.officerName.toLowerCase().includes(q) ||
        item.officerCode.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q)
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

    setIsSubmitting(true);
    try {
      await onAddProposal({
        name: trimmedName.slice(0, 160),
        unit: trimmedUnit.slice(0, 40),
        sector,
        category: currentGroup.category,
        groupCode: currentGroup.groupCode.slice(0, 40),
        groupLabel: currentGroup.groupLabel.slice(0, 160),
        officerCode: finalOfficerCode.slice(0, 16),
        officerName: finalOfficerName.slice(0, 120),
        note: note.trim().slice(0, 400),
        status: 'BELUM_ADA_KODE',
      });
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
  // EXPORT HANDLERS: CSV, PNG, PDF
  // ============================================================================
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Status Kode',
      'Nama Komoditas Diajukan',
      'Satuan',
      'Subsektor / Kuesioner',
      'Kategori',
      'Kode Kelompok',
      'Nama Kelompok / Subkelompok',
      'Kode Petugas',
      'Nama Petugas Pengaju',
      'Catatan Lapangan',
      'Waktu Pengajuan',
    ];

    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredProposals.map((item, idx) => {
      const secObj = SECTOR_OPTIONS.find((s) => s.id === item.sector);
      const dateStr = new Date(item.createdAtMs).toLocaleString('id-ID');
      return [
        String(idx + 1),
        item.status === 'DITINJAU_PML' ? 'DITINJAU PML' : 'BELUM ADA KODE',
        item.name,
        item.unit,
        secObj ? secObj.label : item.sector,
        item.category,
        item.groupCode,
        item.groupLabel,
        item.officerCode,
        item.officerName,
        item.note,
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
    link.download = 'daftar_pengajuan_komoditas_belum_berkode_spdt2026.csv';
    link.click();
    URL.revokeObjectURL(url);
    onCopyText('CSV Diunduh', `${filteredProposals.length} komoditas diekspor ke CSV`);
  };

  const handleExportPng = () => {
    const canvas = renderProposalsToCanvas(filteredProposals);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'daftar_pengajuan_komoditas_belum_berkode_spdt2026.png';
      link.click();
      URL.revokeObjectURL(url);
      onCopyText('PNG Diunduh', `${filteredProposals.length} komoditas diekspor ke Gambar PNG`);
    }, 'image/png');
  };

  const handleExportPdf = () => {
    const canvas = renderProposalsToCanvas(filteredProposals);
    const pdfBlob = generatePdfBlobFromCanvas(canvas);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'daftar_pengajuan_komoditas_belum_berkode_spdt2026.pdf';
    link.click();
    URL.revokeObjectURL(url);
    onCopyText('PDF Diunduh', `${filteredProposals.length} komoditas diekspor ke Dokumen PDF`);
  };

  return (
    <div className="space-y-5 pt-4">
      {/* Top Info & Export Bar */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E293B] dark:bg-[#111827]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
              <span>PENGAJUAN KOMODITAS BELUM BERKODE</span>
              <span>·</span>
              <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                {isFirebaseConnected
                  ? 'Sinkronisasi Real-Time Online Aktif'
                  : 'Mode Penyimpanan Lokal'}
              </span>
            </div>
            <h1 className="mt-1 text-base font-bold text-[#0F172A] sm:text-lg dark:text-[#F8FAFC]">
              Daftar Usulan Komoditas Baru (Belum Ada Kode di Buku 5)
            </h1>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Petugas PCL/PML dapat langsung mengentri temuan komoditas lapangan yang belum
              tercantum di Buku 5 Master Komoditas <strong>tanpa perlu login Admin</strong>.
              Database utama Buku 5 (2.986 item) tetap murni, sedangkan komoditas usulan tertampung
              di daftar ini.
            </p>
          </div>

          {/* 3 Export Buttons: CSV, PNG, PDF */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-bold whitespace-nowrap text-[#0F172A] transition hover:border-[#003D7A] hover:text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]"
            >
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#003D7A] bg-white px-3 text-xs font-bold whitespace-nowrap text-[#003D7A] transition hover:bg-[#EFF6FF] dark:border-[#38BDF8] dark:bg-[#0F172A] dark:text-[#38BDF8] dark:hover:bg-[#1E3A8A]/40"
            >
              <span>Ekspor PNG</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#003D7A] px-3.5 text-xs font-bold whitespace-nowrap text-white transition hover:bg-[#002D5A] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
            >
              <span>Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Form on Left (5 cols), Real-Time Table on Right (7 cols) */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* LEFT COLUMN: Open Entry Form (No Admin Login Required) */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-5 dark:border-[#1E293B] dark:bg-[#111827]"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Form Pengajuan Komoditas Belum Berkode
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Terbuka untuk seluruh PCL & PML tanpa login pengelola
              </p>
            </div>
            <span className="tabular-code rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              BELUM ADA KODE
            </span>
          </div>

          {formError && (
            <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
              {formError}
            </div>
          )}

          <div className="mt-4 space-y-3.5">
            {/* 1. Nama Komoditas */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                1. Nama Komoditas yang Diajukan *
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: DAUN KRATOM / BUAH TIN / PUPUK HAYATI CAIR..."
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
                    Pastikan komoditas yang Anda ajukan bukan salah satu dari kode resmi Buku 5
                    berikut:
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {matchingBuku5Items.map((m) => (
                      <div
                        key={m.code}
                        className="flex items-center justify-between gap-2 rounded border border-amber-200 bg-white px-2.5 py-1.5 dark:border-amber-900 dark:bg-[#111827]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="tabular-code font-bold text-[#003D7A] dark:text-[#38BDF8]">
                              {m.code}
                            </span>
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
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Satuan Standar */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                2. Satuan Standar Lapangan *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Contoh: KG, IKAT, BUNGKUS, LITER..."
                className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-bold uppercase text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {COMMON_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`tabular-code rounded border px-2 py-0.5 text-[10px] font-bold transition ${
                      unit.toUpperCase() === u
                        ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Subsektor / Kuesioner */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                3. Kuesioner / Subsektor (01–11 s.d. 81–82) *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as ProposedSectorType)}
                className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              >
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Kelompok / Subkelompok Spesifik */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                4. Kelompok / Subkelompok di Kuesioner *
              </label>
              <select
                value={selectedGroupIdx}
                onChange={(e) => setSelectedGroupIdx(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              >
                {availableGroups.map((g, idx) => (
                  <option key={g.groupCode + idx} value={idx}>
                    [{g.groupCode}] {g.groupLabel} ({g.category.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {currentGroup && (
                <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Kategori teridentifikasi:{' '}
                  <strong className="text-[#003D7A] dark:text-[#38BDF8]">
                    {currentGroup.category.replace('_', ' ')}
                  </strong>{' '}
                  · Kode Kelompok: <strong className="tabular-code">{currentGroup.groupCode}</strong>
                </div>
              )}
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
                6. Catatan / Keterangan Lapangan (Opsional)
              </label>
              <textarea
                rows={2}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Ditemukan pada sampel RT perkebunan di Blok V.1, belum ada di Buku 5..."
                className="mt-1 w-full rounded-md border border-[#CBD5E1] bg-white p-2.5 text-xs font-medium text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 w-full items-center justify-center rounded-md bg-[#003D7A] px-4 text-xs font-bold text-white transition hover:bg-[#002D5A] disabled:opacity-50 dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
            >
              {isSubmitting
                ? 'Menyimpan ke Daftar Pengajuan...'
                : '+ Simpan ke Daftar Pengajuan Komoditas (Belum Ada Kode)'}
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Real-Time Proposed Commodities List */}
        <div className="space-y-4 lg:col-span-7">
          {/* Filter & Search Bar (Flex-wrap, zero horizontal scrollbar) */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 dark:border-[#1E293B] dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Daftar Komoditas Belum Ada Kode ({filteredProposals.length} dari {proposals.length})
              </span>
              { (filterSector !== 'ALL' || filterCategory !== 'ALL' || searchQuery) && (
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
              placeholder="Cari nama komoditas usulan, kode kelompok (misal 01.1.7), atau nama petugas..."
              className="h-9 w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] focus:border-[#003D7A] focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
            />

            {/* Category Filter Buttons (Flex-wrap) */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'Semua Kategori' },
                  { id: 'KONSUMSI', label: 'Konsumsi RT' },
                  { id: 'PRODUKSI', label: 'Produksi' },
                  { id: 'BIAYA_PRODUKSI', label: 'Biaya Produksi' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`h-7 rounded border px-2.5 text-[11px] font-semibold whitespace-nowrap transition ${
                    filterCategory === cat.id
                      ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Subsector Filter Buttons (Flex-wrap) */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterSector('ALL')}
                className={`h-7 rounded border px-2.5 text-[11px] font-semibold whitespace-nowrap transition ${
                  filterSector === 'ALL'
                    ? 'border-[#0F172A] bg-[#0F172A] text-white dark:border-[#38BDF8] dark:bg-[#38BDF8] dark:text-[#0F172A]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#94A3B8]'
                }`}
              >
                Semua Subsektor
              </button>
              {SECTOR_OPTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setFilterSector(sec.id)}
                  className={`h-7 rounded border px-2.5 text-[11px] font-semibold whitespace-nowrap transition ${
                    filterSector === sec.id
                      ? 'border-[#0F172A] bg-[#0F172A] text-white dark:border-[#38BDF8] dark:bg-[#38BDF8] dark:text-[#0F172A]'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#94A3B8]'
                  }`}
                >
                  {sec.codeRange} {sec.questionnaire}
                </button>
              ))}
            </div>
          </div>

          {/* Proposals List */}
          {filteredProposals.length === 0 ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center dark:border-[#1E293B] dark:bg-[#111827]">
              <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Belum ada pengajuan komoditas tanpa kode pada filter ini
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                Gunakan formulir di sebelah kiri untuk mengentri komoditas lapangan yang belum
                memiliki kode di Buku 5 Master Komoditas.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white dark:border-[#1E293B] dark:bg-[#111827]">
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {filteredProposals.map((item, idx) => {
                  const secObj = SECTOR_OPTIONS.find((s) => s.id === item.sector);
                  const isReviewed = item.status === 'DITINJAU_PML';
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
                      className="flex flex-col justify-between gap-3 p-4 transition hover:bg-[#F8FAFC] sm:flex-row sm:items-start dark:hover:bg-[#0F172A]/60"
                    >
                      <div className="min-w-0 flex-1">
                        {/* Top status & location row */}
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
                          <span className="text-[#CBD5E1] dark:text-[#334155]">·</span>
                          <span className="font-bold text-[#003D7A] dark:text-[#38BDF8]">
                            {secObj ? secObj.shortLabel : item.sector}
                          </span>
                          <span className="text-[#CBD5E1] dark:text-[#334155]">·</span>
                          <span className="font-semibold text-[#475569] dark:text-[#94A3B8]">
                            {item.category.replace('_', ' ')}
                          </span>
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

                        {/* Specific Group / Subgroup Location */}
                        <div className="mt-1 text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]">
                          Kelompok Kuesioner:{' '}
                          <span className="tabular-code font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            [{item.groupCode}]
                          </span>{' '}
                          {item.groupLabel}
                        </div>

                        {/* Note if present */}
                        {item.note && (
                          <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                            Catatan: &ldquo;{item.note}&rdquo;
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

                      {/* Action Buttons */}
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-col sm:items-end">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(item)}
                          className="h-7 rounded border border-[#CBD5E1] bg-white px-2.5 text-[11px] font-semibold whitespace-nowrap text-[#334155] transition hover:border-[#003D7A] hover:text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
                        >
                          {isReviewed ? 'Tandai Belum Ada Kode' : 'Tandai Ditinjau PML'}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onCopyText(
                                `[BELUM ADA KODE] ${item.name} (${item.unit}) - ${secObj?.shortLabel || item.sector} | Kelompok [${item.groupCode}] ${item.groupLabel} | Pengaju: ${item.officerCode} ${item.officerName}`,
                                `Usulan ${item.name}`
                              )
                            }
                            className="h-7 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-[11px] font-semibold text-[#475569] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8]"
                          >
                            Salin
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProposal(item.id)}
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
    </div>
  );
};
