import React, { useState, useMemo, useEffect } from 'react';

interface Spdt26kCalculatorProps {
  onCopyText: (text: string, label: string) => void;
}

export interface Blok7ASubgroupDef {
  id: string;
  code: string;
  label: string;
  sourceRef: string;
  parentGroup: '01.1' | '01_OTHER' | '10';
}

export const BLOK_7A_SUBGROUPS: Blok7ASubgroupDef[] = [
  {
    id: '01.1.1',
    code: '01.1.1',
    label: 'Sereal dan Produk Sereal',
    sourceRef: 'Blok V.01.1.1 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.2',
    code: '01.1.2',
    label: 'Hewan Hidup, Daging, dan Bagian Lain Hewan Hasil Sembelih',
    sourceRef: 'Blok V.01.1.2 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.3',
    code: '01.1.3',
    label: 'Ikan dan Makanan Laut Lainnya',
    sourceRef: 'Blok V.01.1.3 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.4',
    code: '01.1.4',
    label: 'Susu, Produk Susu Lainnya, dan Telur',
    sourceRef: 'Blok V.01.1.4 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.5',
    code: '01.1.5',
    label: 'Minyak dan Lemak',
    sourceRef: 'Blok V.01.1.5 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.6',
    code: '01.1.6',
    label: 'Buah dan Kacang-Kacangan',
    sourceRef: 'Blok V.01.1.6 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.7',
    code: '01.1.7',
    label: 'Sayuran, Umbi-Umbian, Pisang Raja, dan Kacang-Kacangan',
    sourceRef: 'Blok V.01.1.7 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.8',
    code: '01.1.8',
    label: 'Gula, Kembang Gula, dan Makanan Pencuci Mulut',
    sourceRef: 'Blok V.01.1.8 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.1.9',
    code: '01.1.9',
    label: 'Makanan Siap Saji dan Makanan Olahan Lainnya',
    sourceRef: 'Blok V.01.1.9 kol (20)',
    parentGroup: '01.1',
  },
  {
    id: '01.2',
    code: '01.2',
    label: 'Minuman yang Tidak Beralkohol',
    sourceRef: 'Blok V.01.2 kol (20)',
    parentGroup: '01_OTHER',
  },
  {
    id: '01.3',
    code: '01.3',
    label: 'Minuman Beralkohol',
    sourceRef: 'Blok V.01.3 kol (20)',
    parentGroup: '01_OTHER',
  },
  {
    id: '01.4',
    code: '01.4',
    label: 'Rokok dan Tembakau',
    sourceRef: 'Blok V.01.4 kol (20)',
    parentGroup: '01_OTHER',
  },
  {
    id: '10.1',
    code: '10.1',
    label: 'Jasa Pelayanan Makanan dan Minuman',
    sourceRef: 'Blok V.10.1 kol (20)',
    parentGroup: '10',
  },
];

export interface Blok7BGroupDef {
  groupCode: string;
  groupTitle: string;
  subgroups: {
    id: string;
    code: string;
    label: string;
    sourceRef: string;
  }[];
}

export const BLOK_7B_GROUPS: Blok7BGroupDef[] = [
  {
    groupCode: '02',
    groupTitle: '02. Pakaian dan Alas Kaki',
    subgroups: [
      { id: '02.1', code: '02.1', label: 'Pakaian', sourceRef: 'Blok VI.02.1 kol (6) & (7)' },
      { id: '02.2', code: '02.2', label: 'Alas Kaki', sourceRef: 'Blok VI.02.2 kol (6) & (7)' },
    ],
  },
  {
    groupCode: '03',
    groupTitle: '03. Perumahan, Air, Listrik, dan Bahan Bakar Rumah Tangga',
    subgroups: [
      {
        id: '03.1',
        code: '03.1',
        label: 'Sewa Dan Kontrak Rumah',
        sourceRef: 'Blok VI.03.1 kol (6) & (7)',
      },
      {
        id: '03.2',
        code: '03.2',
        label: 'Pemeliharaan, Perbaikan, dan Keamanan Tempat Tinggal/Perumahan',
        sourceRef: 'Blok VI.03.2 kol (6) & (7)',
      },
      {
        id: '03.3',
        code: '03.3',
        label: 'Penyediaan Air dan Layanan Perumahan Lainnya',
        sourceRef: 'Blok VI.03.3 kol (6) & (7)',
      },
      {
        id: '03.4',
        code: '03.4',
        label: 'Listrik dan Bahan Bakar Rumah Tangga',
        sourceRef: 'Blok VI.03.4 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '04',
    groupTitle: '04. Perlengkapan, Peralatan & Pemeliharaan Rutin Rumah Tangga',
    subgroups: [
      {
        id: '04.1',
        code: '04.1',
        label: 'Furnitur, Perlengkapan & Karpet',
        sourceRef: 'Blok VI.04.1 kol (6) & (7)',
      },
      {
        id: '04.2',
        code: '04.2',
        label: 'Tekstil Rumah Tangga',
        sourceRef: 'Blok VI.04.2 kol (6) & (7)',
      },
      {
        id: '04.3',
        code: '04.3',
        label: 'Peralatan Rumah Tangga',
        sourceRef: 'Blok VI.04.3 kol (6) & (7)',
      },
      {
        id: '04.4',
        code: '04.4',
        label: 'Barang Pecah Belah dan Peralatan Makan Minum',
        sourceRef: 'Blok VI.04.4 kol (6) & (7)',
      },
      {
        id: '04.5',
        code: '04.5',
        label: 'Peralatan dan Perlengkapan Perumahan dan Kebun',
        sourceRef: 'Blok VI.04.5 kol (6) & (7)',
      },
      {
        id: '04.6',
        code: '04.6',
        label: 'Barang dan Layanan untuk Pemeliharaan Rumah Tangga Rutin',
        sourceRef: 'Blok VI.04.6 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '05',
    groupTitle: '05. Kesehatan',
    subgroups: [
      {
        id: '05.1',
        code: '05.1',
        label: 'Obat-Obatan & Produk Kesehatan',
        sourceRef: 'Blok VI.05.1 kol (6) & (7)',
      },
      {
        id: '05.2',
        code: '05.2',
        label: 'Jasa Rawat Jalan',
        sourceRef: 'Blok VI.05.2 kol (6) & (7)',
      },
      {
        id: '05.3',
        code: '05.3',
        label: 'Layanan Rawat Inap',
        sourceRef: 'Blok VI.05.3 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '06',
    groupTitle: '06. Transportasi',
    subgroups: [
      {
        id: '06.1',
        code: '06.1',
        label: 'Pembelian Kendaraan',
        sourceRef: 'Blok VI.06.1 kol (6) & (7)',
      },
      {
        id: '06.2',
        code: '06.2',
        label: 'Pengoperasian Peralatan Transportasi Pribadi',
        sourceRef: 'Blok VI.06.2 kol (6) & (7)',
      },
      {
        id: '06.3',
        code: '06.3',
        label: 'Jasa Angkutan Penumpang',
        sourceRef: 'Blok VI.06.3 kol (6) & (7)',
      },
      {
        id: '06.4',
        code: '06.4',
        label: 'Jasa Pengiriman Barang',
        sourceRef: 'Blok VI.06.4 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '07',
    groupTitle: '07. Informasi, Komunikasi, dan Jasa Keuangan',
    subgroups: [
      {
        id: '07.1',
        code: '07.1',
        label: 'Peralatan Informasi dan Komunikasi',
        sourceRef: 'Blok VI.07.1 kol (6) & (7)',
      },
      {
        id: '07.2',
        code: '07.2',
        label: 'Layanan Informasi dan Komunikasi',
        sourceRef: 'Blok VI.07.2 kol (6) & (7)',
      },
      {
        id: '07.4',
        code: '07.4',
        label: 'Jasa Keuangan',
        sourceRef: 'Blok VI.07.4 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '08',
    groupTitle: '08. Rekreasi, Olahraga, dan Budaya',
    subgroups: [
      {
        id: '08.1',
        code: '08.1',
        label: 'Barang Rekreasi Tahan Lama',
        sourceRef: 'Blok VI.08.1 kol (6) & (7)',
      },
      {
        id: '08.2',
        code: '08.2',
        label: 'Barang Rekreasi Lainnya dan Olahraga',
        sourceRef: 'Blok VI.08.2 kol (6) & (7)',
      },
      {
        id: '08.3',
        code: '08.3',
        label: 'Layanan Rekreasi dan Olahraga',
        sourceRef: 'Blok VI.08.3 kol (6) & (7)',
      },
      {
        id: '08.4',
        code: '08.4',
        label: 'Perlengkapan Kebudayaan',
        sourceRef: 'Blok VI.08.4 kol (6) & (7)',
      },
      {
        id: '08.5',
        code: '08.5',
        label: 'Layanan Kebudayaan',
        sourceRef: 'Blok VI.08.5 kol (6) & (7)',
      },
      {
        id: '08.6',
        code: '08.6',
        label: 'Koran, Buku, dan Perlengkapan Sekolah',
        sourceRef: 'Blok VI.08.6 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '09',
    groupTitle: '09. Pendidikan',
    subgroups: [
      {
        id: '09.1',
        code: '09.1',
        label: 'Pendidikan Dasar dan Anak Usia Dini',
        sourceRef: 'Blok VI.09.1 kol (6) & (7)',
      },
      {
        id: '09.2',
        code: '09.2',
        label: 'Pendidikan Menengah',
        sourceRef: 'Blok VI.09.2 kol (6) & (7)',
      },
      {
        id: '09.3',
        code: '09.3',
        label: 'Pendidikan Tinggi',
        sourceRef: 'Blok VI.09.3 kol (6) & (7)',
      },
      {
        id: '09.4',
        code: '09.4',
        label: 'Pendidikan Lainnya',
        sourceRef: 'Blok VI.09.4 kol (6) & (7)',
      },
    ],
  },
  {
    groupCode: '11',
    groupTitle: '11. Perawatan Pribadi dan Jasa Lainnya',
    subgroups: [
      {
        id: '11.1',
        code: '11.1',
        label: 'Perawatan Pribadi',
        sourceRef: 'Blok VI.11.1 kol (6) & (7)',
      },
      {
        id: '11.2',
        code: '11.2',
        label: 'Perawatan Pribadi Lainnya',
        sourceRef: 'Blok VI.11.2 kol (6) & (7)',
      },
      {
        id: '11.4',
        code: '11.4',
        label: 'Jasa Lainnya',
        sourceRef: 'Blok VI.11.4 kol (6) & (7)',
      },
    ],
  },
];

export const BLOK_4_SUBSECTORS = [
  { code: 1, name: 'Tanaman Pangan' },
  { code: 2, name: 'Hortikultura' },
  { code: 4, name: 'Perkebunan' },
  { code: 8, name: 'Peternakan' },
  { code: 16, name: 'Perikanan Tangkap' },
  { code: 32, name: 'Perikanan Budidaya' },
  { code: 64, name: 'Kehutanan' },
] as const;

/**
 * Evaluates a quick sum/subtraction expression safely (e.g. "15000+12000+18000" or "1.5+2+0.75").
 * Supports comma as decimal separator (e.g. "1,5+2,25").
 */
export function evaluateQuickExpression(raw: string, allowDecimal = false): {
  total: number;
  termCount: number;
  hasOperators: boolean;
} {
  if (!raw || !raw.trim()) {
    return { total: 0, termCount: 0, hasOperators: false };
  }
  const normalized = raw.trim().replace(/\s+/g, '');
  const hasOperators = /[+-]/.test(normalized.slice(1));

  // Split into signed terms by + or -
  const tokens = normalized.match(/[+-]?[^+-]+/g) || [];
  let sum = 0;
  let validTerms = 0;

  for (const token of tokens) {
    let cleaned = token;
    if (allowDecimal) {
      // Allow comma or dot as decimal separator
      cleaned = cleaned.replace(',', '.');
    } else {
      // Integer Rupiah / 000 Rp: strip thousand separators (dots or commas)
      cleaned = cleaned.replace(/[.,]/g, '');
    }
    const parsed = parseFloat(cleaned);
    if (!Number.isNaN(parsed)) {
      sum += parsed;
      validTerms++;
    }
  }

  return {
    total: allowDecimal ? Number(sum.toFixed(2)) : Math.round(sum),
    termCount: validTerms,
    hasOperators,
  };
}

const STORAGE_KEY_SPDT26K = 'spdt_ntp_2026_calc_spdt26k_v1';

interface DailyDayEntry {
  qty: string;
  val: string;
}

type Spdt26kSubView = 'BLOK_VII_A' | 'BLOK_VII_B' | 'BLOK_V_VI_ROW' | 'BLOK_IV_KODE';

export const Spdt26kCalculator: React.FC<Spdt26kCalculatorProps> = ({ onCopyText }) => {
  const [subView, setSubView] = useState<Spdt26kSubView>('BLOK_VII_A');

  // 1. State for Blok VII.A (Makanan Seminggu - Dalam Rupiah)
  const [blok7AInputs, setBlok7AInputs] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPDT26K);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blok7AInputs) return parsed.blok7AInputs;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [pcl7AWritten, setPcl7AWritten] = useState<{
    sub01_1: string;
    tot01: string;
    tot10: string;
    jumlahA: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPDT26K);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pcl7AWritten) return parsed.pcl7AWritten;
      }
    } catch {
      // ignore
    }
    return { sub01_1: '', tot01: '', tot10: '', jumlahA: '' };
  });

  // 2. State for Blok VII.B (Bukan Makanan - Dalam Ribuan Rupiah 000 Rp)
  const [blok7BMonthInputs, setBlok7BMonthInputs] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPDT26K);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blok7BMonthInputs) return parsed.blok7BMonthInputs;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [blok7BYearInputs, setBlok7BYearInputs] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPDT26K);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blok7BYearInputs) return parsed.blok7BYearInputs;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [pcl7BWritten, setPcl7BWritten] = useState<{
    jumlahBMonth: string;
    jumlahBYear: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPDT26K);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pcl7BWritten) return parsed.pcl7BWritten;
      }
    } catch {
      // ignore
    }
    return { jumlahBMonth: '', jumlahBYear: '' };
  });

  // 3. State for Blok V H-1..H-7 Daily Row Calculator
  const [dailyItemName, setDailyItemName] = useState('Beras (0111001)');
  const [targetSubgroup7A, setTargetSubgroup7A] = useState('01.1.1');
  const [days, setDays] = useState<DailyDayEntry[]>([
    { qty: '2', val: '28000' },
    { qty: '0', val: '0' },
    { qty: '1,5', val: '21000' },
    { qty: '0', val: '0' },
    { qty: '2', val: '28000' },
    { qty: '0', val: '0' },
    { qty: '1', val: '14000' },
  ]);
  const [pclCol19Qty, setPclCol19Qty] = useState('');
  const [pclCol20Val, setPclCol20Val] = useState('');

  // Blok VI Converter (Rupiah penuh -> 000 Rp)
  const [rawRupiahMonth, setRawRupiahMonth] = useState('150000');
  const [freqMonthsInYear, setFreqMonthsInYear] = useState('12');
  const [rawRupiahYearExtra, setRawRupiahYearExtra] = useState('0');
  const [targetSubgroup7B, setTargetSubgroup7B] = useState('03.4');

  // 4. State for Blok IV Kolom (10) Subsektor Code Calculator & Decoder
  const [selectedSubsectorMask, setSelectedSubsectorMask] = useState<number>(5); // Default: 1 (Tanaman Pangan) + 4 (Perkebunan) = 5
  const [pclCol10Input, setPclCol10Input] = useState<string>('5');

  // Persist Blok VII worksheet in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SPDT26K,
        JSON.stringify({
          blok7AInputs,
          pcl7AWritten,
          blok7BMonthInputs,
          blok7BYearInputs,
          pcl7BWritten,
        })
      );
    } catch {
      // ignore
    }
  }, [blok7AInputs, pcl7AWritten, blok7BMonthInputs, blok7BYearInputs, pcl7BWritten]);

  const formatNum = (n: number) => new Intl.NumberFormat('id-ID').format(n);

  // ============================================================================
  // COMPUTED TOTALS FOR BLOK VII.A
  // ============================================================================
  const blok7AComputed = useMemo(() => {
    const evalMap: Record<
      string,
      { total: number; termCount: number; hasOperators: boolean }
    > = {};

    BLOK_7A_SUBGROUPS.forEach((sg) => {
      evalMap[sg.id] = evaluateQuickExpression(blok7AInputs[sg.id] || '', false);
    });

    const sub01_1 = BLOK_7A_SUBGROUPS.filter((s) => s.parentGroup === '01.1').reduce(
      (acc, s) => acc + (evalMap[s.id]?.total || 0),
      0
    );

    const sub01_2 = evalMap['01.2']?.total || 0;
    const sub01_3 = evalMap['01.3']?.total || 0;
    const sub01_4 = evalMap['01.4']?.total || 0;

    const total01 = sub01_1 + sub01_2 + sub01_3 + sub01_4;
    const total10 = evalMap['10.1']?.total || 0;
    const jumlahA = total01 + total10;

    return {
      evalMap,
      sub01_1,
      total01,
      total10,
      jumlahA,
      // Estimasi setahun (52 minggu)
      estimasiSetahun52: jumlahA * 52,
    };
  }, [blok7AInputs]);

  // ============================================================================
  // COMPUTED TOTALS FOR BLOK VII.B
  // ============================================================================
  const blok7BComputed = useMemo(() => {
    const monthEval: Record<
      string,
      { total: number; termCount: number; hasOperators: boolean }
    > = {};
    const yearEval: Record<
      string,
      { total: number; termCount: number; hasOperators: boolean }
    > = {};
    const groupTotals: Record<string, { month: number; year: number }> = {};

    let jumlahBMonth = 0;
    let jumlahBYear = 0;
    const inconsistentSubgroups: string[] = [];

    BLOK_7B_GROUPS.forEach((grp) => {
      let gMonth = 0;
      let gYear = 0;
      grp.subgroups.forEach((sg) => {
        const m = evaluateQuickExpression(blok7BMonthInputs[sg.id] || '', false);
        const y = evaluateQuickExpression(blok7BYearInputs[sg.id] || '', false);
        monthEval[sg.id] = m;
        yearEval[sg.id] = y;
        gMonth += m.total;
        gYear += y.total;

        // Check consistency: Setahun (Oktober 2025 - September 2026) cannot be smaller than Sebulan (September 2026)
        if (m.total > 0 && y.total < m.total) {
          inconsistentSubgroups.push(`${sg.code} ${sg.label}`);
        }
      });
      groupTotals[grp.groupCode] = { month: gMonth, year: gYear };
      jumlahBMonth += gMonth;
      jumlahBYear += gYear;
    });

    return {
      monthEval,
      yearEval,
      groupTotals,
      jumlahBMonth,
      jumlahBYear,
      inconsistentSubgroups,
    };
  }, [blok7BMonthInputs, blok7BYearInputs]);

  // ============================================================================
  // COMPUTED TOTALS FOR BLOK V H-1..H-7 & BLOK VI CONVERTER
  // ============================================================================
  const dailyComputed = useMemo(() => {
    let totalQty = 0;
    let totalVal = 0;

    const perDay = days.map((d) => {
      const q = evaluateQuickExpression(d.qty, true).total;
      const v = evaluateQuickExpression(d.val, false).total;
      totalQty += q;
      totalVal += v;
      return { q, v };
    });

    const col19 = Number(totalQty.toFixed(2));
    const col20 = Math.round(totalVal);

    const pcl19Num = pclCol19Qty.trim()
      ? evaluateQuickExpression(pclCol19Qty, true).total
      : null;
    const pcl20Num = pclCol20Val.trim()
      ? evaluateQuickExpression(pclCol20Val, false).total
      : null;

    const diff19 = pcl19Num !== null ? Number((col19 - pcl19Num).toFixed(2)) : 0;
    const diff20 = pcl20Num !== null ? col20 - pcl20Num : 0;

    return {
      perDay,
      col19,
      col20,
      pcl19Num,
      pcl20Num,
      diff19,
      diff20,
    };
  }, [days, pclCol19Qty, pclCol20Val]);

  const blok6ConverterComputed = useMemo(() => {
    const monthRp = evaluateQuickExpression(rawRupiahMonth, false).total;
    const freq = Math.max(0, Math.min(12, parseInt(freqMonthsInYear || '0', 10) || 0));
    const extraYearRp = evaluateQuickExpression(rawRupiahYearExtra, false).total;
    const totalYearRp = monthRp * freq + extraYearRp;

    // Dalam Ribuan Rupiah (000 Rp) dibulatkan ke ribuan terdekat
    const col6MonthRibuan = Math.round(monthRp / 1000);
    const col7YearRibuan = Math.round(totalYearRp / 1000);

    return {
      monthRp,
      freq,
      extraYearRp,
      totalYearRp,
      col6MonthRibuan,
      col7YearRibuan,
    };
  }, [rawRupiahMonth, freqMonthsInYear, rawRupiahYearExtra]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleSendDailyToBlok7A = (mode: 'ADD' | 'REPLACE') => {
    if (dailyComputed.col20 <= 0) return;
    setBlok7AInputs((prev) => {
      const current = (prev[targetSubgroup7A] || '').trim();
      const nextVal =
        mode === 'ADD' && current && current !== '0'
          ? `${current}+${dailyComputed.col20}`
          : String(dailyComputed.col20);
      return { ...prev, [targetSubgroup7A]: nextVal };
    });
    onCopyText(
      String(dailyComputed.col20),
      `Rp ${formatNum(dailyComputed.col20)} dimasukkan ke Blok VII.A (${targetSubgroup7A})`
    );
  };

  const handleSendBlok6ToBlok7B = (mode: 'ADD' | 'REPLACE') => {
    setBlok7BMonthInputs((prev) => {
      const cur = (prev[targetSubgroup7B] || '').trim();
      const val = blok6ConverterComputed.col6MonthRibuan;
      if (val <= 0) return prev;
      const next = mode === 'ADD' && cur && cur !== '0' ? `${cur}+${val}` : String(val);
      return { ...prev, [targetSubgroup7B]: next };
    });
    setBlok7BYearInputs((prev) => {
      const cur = (prev[targetSubgroup7B] || '').trim();
      const val = blok6ConverterComputed.col7YearRibuan;
      if (val <= 0) return prev;
      const next = mode === 'ADD' && cur && cur !== '0' ? `${cur}+${val}` : String(val);
      return { ...prev, [targetSubgroup7B]: next };
    });
    onCopyText(
      `${blok6ConverterComputed.col6MonthRibuan} / ${blok6ConverterComputed.col7YearRibuan}`,
      `Nilai 000 Rp dimasukkan ke Blok VII.B (${targetSubgroup7B})`
    );
  };

  const handleToggleSubsectorBit = (bit: number) => {
    const nextMask =
      (selectedSubsectorMask & bit) !== 0
        ? selectedSubsectorMask & ~bit
        : selectedSubsectorMask | bit;
    setSelectedSubsectorMask(nextMask);
    setPclCol10Input(String(nextMask));
  };

  const handleDecodeCol10Input = (val: string) => {
    setPclCol10Input(val);
    const num = parseInt(val.trim(), 10);
    if (!Number.isNaN(num) && num >= 0 && num <= 127) {
      setSelectedSubsectorMask(num);
    }
  };

  const renderDiffBadge = (systemTotal: number, pclRaw: string, unitPrefix = 'Rp ') => {
    if (!pclRaw.trim()) return null;
    const pclVal = evaluateQuickExpression(pclRaw, false).total;
    const diff = systemTotal - pclVal;
    if (diff === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
          ✓ COCOK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
        ✕ SELISIH {diff > 0 ? '+' : '-'}
        {unitPrefix}
        {formatNum(Math.abs(diff))} (Sistem: {formatNum(systemTotal)})
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Banner & Sub-Menu Selector (Zero horizontal scrollbar, flex-wrap) */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E293B] dark:bg-[#111827]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4 dark:border-[#1E293B]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-code text-xs font-bold tracking-wider uppercase text-[#003D7A] dark:text-[#38BDF8]">
                SPDT26-K · KONSUMSI RUMAH TANGGA
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">·</span>
              <a
                href="./assets/aistudio/Kues_SPDT_NTP_2026__Konsumsi__d572b96b.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#003D7A] underline-offset-2 hover:underline dark:text-[#38BDF8]"
              >
                Buka PDF Kuesioner SPDT26-K (48 Hal) ↗
              </a>
            </div>
            <h2 className="mt-1 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Kalkulator Pemeriksaan & Rekap Kuesioner Konsumsi (SPDT26-K)
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Mendukung input penjumlahan cepat (ketik{' '}
              <code className="tabular-code rounded bg-[#F1F5F9] px-1.5 py-0.5 font-semibold text-[#0F172A] dark:bg-[#1E293B] dark:text-[#E2E8F0]">
                15000+12000+18000
              </code>{' '}
              langsung terjumlah), rekap otomatis Blok VII.A & VII.B, serta deteksi selisih angka
              tertulis PCL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBlok7AInputs({});
                setPcl7AWritten({ sub01_1: '', tot01: '', tot10: '', jumlahA: '' });
                setBlok7BMonthInputs({});
                setBlok7BYearInputs({});
                setPcl7BWritten({ jumlahBMonth: '', jumlahBYear: '' });
              }}
              className="h-8 rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#475569] transition hover:border-rose-300 hover:text-rose-700 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#94A3B8] dark:hover:text-rose-400"
            >
              Reset Lembar Kerja
            </button>
          </div>
        </div>

        {/* Sub-view Switcher Buttons (Flex-wrap, no horizontal scrollbar) */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(
            [
              {
                id: 'BLOK_VII_A',
                label: '1. Rekap Blok VII.A (Makanan Seminggu - Rp)',
                badge:
                  blok7AComputed.jumlahA > 0
                    ? `Rp ${formatNum(blok7AComputed.jumlahA)}`
                    : undefined,
              },
              {
                id: 'BLOK_VII_B',
                label: '2. Rekap Blok VII.B (Bukan Makanan - 000 Rp)',
                badge:
                  blok7BComputed.jumlahBYear > 0
                    ? `${formatNum(blok7BComputed.jumlahBYear)} (000 Rp)`
                    : undefined,
              },
              {
                id: 'BLOK_V_VI_ROW',
                label: '3. Kalkulator Harian Blok V (H-1..H-7) & Blok VI',
              },
              {
                id: 'BLOK_IV_KODE',
                label: '4. Kode Subsektor Blok IV Kol (10)',
              },
            ] as { id: Spdt26kSubView; label: string; badge?: string }[]
          ).map((tab) => {
            const active = subView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubView(tab.id)}
                className={`flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A] dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`tabular-code rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E2E8F0] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#38BDF8]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SUB-VIEW 1: BLOK VII.A RINGKASAN PENGELUARAN MAKANAN (HAL. 46)
         ===================================================================== */}
      {subView === 'BLOK_VII_A' && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3.5 dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                VII.A. Bahan Makanan, Makanan Jadi, Minuman, Rokok, dan Tembakau (Halaman 46)
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                Satuan: <strong>Dalam Rupiah Penuh (Seminggu)</strong> · Ketik nilai subkelompok
                atau penjumlahan baris komoditas (contoh: <code>45000+15000+8000</code>).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const summary = [
                  `RINGKASAN BLOK VII.A SPDT26-K (SEMINGGU - RP)`,
                  `01. Makanan, Minuman, dan Tembakau: Rp ${formatNum(blok7AComputed.total01)}`,
                  `  01.1 Makanan: Rp ${formatNum(blok7AComputed.sub01_1)}`,
                  ...BLOK_7A_SUBGROUPS.map(
                    (s) =>
                      `    ${s.code} ${s.label}: Rp ${formatNum(blok7AComputed.evalMap[s.id]?.total || 0)}`
                  ),
                  `10. Penyediaan Makanan & Minuman/Restoran: Rp ${formatNum(blok7AComputed.total10)}`,
                  `JUMLAH A (01 + 10): Rp ${formatNum(blok7AComputed.jumlahA)}`,
                ].join('\n');
                onCopyText(summary, 'Ringkasan Blok VII.A');
              }}
              className="h-8 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A] transition hover:border-[#003D7A] hover:text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]"
            >
              Salin Rekap VII.A
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Group Header 01 & 01.1 */}
            <div className="rounded-md bg-[#F1F5F9] px-3.5 py-2 text-xs font-bold text-[#0F172A] dark:bg-[#0F172A] dark:text-[#F8FAFC]">
              01. Makanan, Minuman, dan Tembakau → 01.1 Makanan (Subkelompok 01.1.1 s.d. 01.1.9)
            </div>

            {BLOK_7A_SUBGROUPS.filter((s) => s.parentGroup === '01.1').map((sg) => {
              const ev = blok7AComputed.evalMap[sg.id];
              return (
                <div
                  key={sg.id}
                  className="grid grid-cols-1 items-center gap-2 rounded-md border border-[#E2E8F0] p-3 sm:grid-cols-12 dark:border-[#1E293B]"
                >
                  <div className="sm:col-span-5">
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      <span className="tabular-code mr-1.5 text-[#003D7A] dark:text-[#38BDF8]">
                        {sg.code}
                      </span>
                      {sg.label}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      [dari {sg.sourceRef}]
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      inputMode="text"
                      value={blok7AInputs[sg.id] || ''}
                      onChange={(e) =>
                        setBlok7AInputs((prev) => ({ ...prev, [sg.id]: e.target.value }))
                      }
                      placeholder="Ketik nilai / 25000+14000..."
                      className="tabular-code h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:col-span-3 sm:justify-end sm:gap-2">
                    <span className="text-[11px] text-[#64748B] sm:hidden dark:text-[#94A3B8]">
                      Hasil Kolom (2):
                    </span>
                    <div className="text-right">
                      <div className="tabular-code text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        Rp {formatNum(ev?.total || 0)}
                      </div>
                      {ev?.hasOperators && (
                        <div className="tabular-code text-[10px] font-semibold text-[#003D7A] dark:text-[#38BDF8]">
                          {ev.termCount} item dijumlahkan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Subtotal 01.1 Makanan */}
            <div className="rounded-md border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Subtotal 01.1 Makanan (01.1.1 s.d. 01.1.9)
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Otomatis dijumlahkan dari 9 subkelompok makanan di atas
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <input
                    type="text"
                    value={pcl7AWritten.sub01_1}
                    onChange={(e) =>
                      setPcl7AWritten((prev) => ({ ...prev, sub01_1: e.target.value }))
                    }
                    placeholder="Cek angka PCL (opsional)"
                    className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none sm:w-44 dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8]"
                  />
                  <span className="tabular-code text-base font-bold text-[#003D7A] dark:text-[#38BDF8]">
                    Rp {formatNum(blok7AComputed.sub01_1)}
                  </span>
                </div>
              </div>
              {pcl7AWritten.sub01_1 && (
                <div className="mt-2">
                  {renderDiffBadge(blok7AComputed.sub01_1, pcl7AWritten.sub01_1)}
                </div>
              )}
            </div>

            {/* Subgroups 01.2, 01.3, 01.4 */}
            {BLOK_7A_SUBGROUPS.filter((s) => s.parentGroup === '01_OTHER').map((sg) => {
              const ev = blok7AComputed.evalMap[sg.id];
              return (
                <div
                  key={sg.id}
                  className="grid grid-cols-1 items-center gap-2 rounded-md border border-[#E2E8F0] p-3 sm:grid-cols-12 dark:border-[#1E293B]"
                >
                  <div className="sm:col-span-5">
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      <span className="tabular-code mr-1.5 text-[#003D7A] dark:text-[#38BDF8]">
                        {sg.code}
                      </span>
                      {sg.label}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      [dari {sg.sourceRef}]
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={blok7AInputs[sg.id] || ''}
                      onChange={(e) =>
                        setBlok7AInputs((prev) => ({ ...prev, [sg.id]: e.target.value }))
                      }
                      placeholder="Ketik nilai / 34000+70000..."
                      className="tabular-code h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:col-span-3 sm:justify-end">
                    <span className="text-[11px] text-[#64748B] sm:hidden dark:text-[#94A3B8]">
                      Hasil Kolom (2):
                    </span>
                    <div className="text-right">
                      <div className="tabular-code text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        Rp {formatNum(ev?.total || 0)}
                      </div>
                      {ev?.hasOperators && (
                        <div className="tabular-code text-[10px] font-semibold text-[#003D7A] dark:text-[#38BDF8]">
                          {ev.termCount} item dijumlahkan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total 01. Makanan, Minuman, dan Tembakau */}
            <div className="rounded-md border border-[#003D7A]/30 bg-[#EFF6FF]/60 p-3.5 dark:border-[#0284C7]/40 dark:bg-[#0F2952]/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                    Total 01. Makanan, Minuman, dan Tembakau (01.1 + 01.2 + 01.3 + 01.4)
                  </div>
                  <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Diisikan pada baris &ldquo;01. Makanan, Minuman, dan Tembakau&rdquo; Blok VII.A
                    Kolom (2)
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <input
                    type="text"
                    value={pcl7AWritten.tot01}
                    onChange={(e) =>
                      setPcl7AWritten((prev) => ({ ...prev, tot01: e.target.value }))
                    }
                    placeholder="Angka tertulis PCL (01)"
                    className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none sm:w-44 dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8]"
                  />
                  <span className="tabular-code text-base font-bold text-[#003D7A] dark:text-[#38BDF8]">
                    Rp {formatNum(blok7AComputed.total01)}
                  </span>
                </div>
              </div>
              {pcl7AWritten.tot01 && (
                <div className="mt-2">
                  {renderDiffBadge(blok7AComputed.total01, pcl7AWritten.tot01)}
                </div>
              )}
            </div>

            {/* Kelompok 10: Penyediaan Makanan dan Minuman/Restoran */}
            <div className="mt-4 rounded-md bg-[#F1F5F9] px-3.5 py-2 text-xs font-bold text-[#0F172A] dark:bg-[#0F172A] dark:text-[#F8FAFC]">
              10. Penyediaan Makanan dan Minuman/Restoran
            </div>

            {BLOK_7A_SUBGROUPS.filter((s) => s.parentGroup === '10').map((sg) => {
              const ev = blok7AComputed.evalMap[sg.id];
              return (
                <div
                  key={sg.id}
                  className="grid grid-cols-1 items-center gap-2 rounded-md border border-[#E2E8F0] p-3 sm:grid-cols-12 dark:border-[#1E293B]"
                >
                  <div className="sm:col-span-5">
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      <span className="tabular-code mr-1.5 text-[#003D7A] dark:text-[#38BDF8]">
                        {sg.code}
                      </span>
                      {sg.label}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      [dari {sg.sourceRef}] → Otomatis menjadi nilai Kelompok 10
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={blok7AInputs[sg.id] || ''}
                      onChange={(e) =>
                        setBlok7AInputs((prev) => ({ ...prev, [sg.id]: e.target.value }))
                      }
                      placeholder="Ketik nilai / 15000+20000..."
                      className="tabular-code h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:col-span-3 sm:justify-end">
                    <span className="text-[11px] text-[#64748B] sm:hidden dark:text-[#94A3B8]">
                      Hasil Kolom (2):
                    </span>
                    <div className="text-right">
                      <div className="tabular-code text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        Rp {formatNum(ev?.total || 0)}
                      </div>
                      {ev?.hasOperators && (
                        <div className="tabular-code text-[10px] font-semibold text-[#003D7A] dark:text-[#38BDF8]">
                          {ev.termCount} item dijumlahkan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* GRAND TOTAL: JUMLAH A (01 + 10) */}
            <div className="mt-4 rounded-lg border-2 border-[#003D7A] bg-[#F8FAFC] p-4 dark:border-[#38BDF8] dark:bg-[#0F172A]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold tracking-wider uppercase text-[#003D7A] dark:text-[#38BDF8]">
                    HASIL AKHIR BLOK VII.A (HALAMAN 46)
                  </div>
                  <div className="mt-0.5 text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                    Jumlah A (01 + 10) — Seminggu
                  </div>
                  <div className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Estimasi Setahun (× 52 minggu):{' '}
                    <strong className="tabular-code text-[#0F172A] dark:text-[#F8FAFC]">
                      Rp {formatNum(blok7AComputed.estimasiSetahun52)}
                    </strong>
                  </div>
                </div>

                <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <div className="w-full sm:w-auto">
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Jumlah A Tertulis PCL:
                    </label>
                    <input
                      type="text"
                      value={pcl7AWritten.jumlahA}
                      onChange={(e) =>
                        setPcl7AWritten((prev) => ({ ...prev, jumlahA: e.target.value }))
                      }
                      placeholder="Ketik Jumlah A PCL..."
                      className="tabular-code mt-1 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#003D7A] focus:outline-none sm:w-48 dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Total Hitungan Sistem:
                    </div>
                    <div className="tabular-code mt-0.5 text-xl font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                      Rp {formatNum(blok7AComputed.jumlahA)}
                    </div>
                  </div>
                </div>
              </div>

              {pcl7AWritten.jumlahA && (
                <div className="mt-3 border-t border-[#E2E8F0] pt-2.5 dark:border-[#1E293B]">
                  {renderDiffBadge(blok7AComputed.jumlahA, pcl7AWritten.jumlahA)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 2: BLOK VII.B RINGKASAN PENGELUARAN BUKAN MAKANAN (HAL. 46-48)
         ===================================================================== */}
      {subView === 'BLOK_VII_B' && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3.5 dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                VII.B. Bukan Makanan — Sebulan & Setahun (Halaman 46–48)
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                Satuan: <strong>Dalam Ribuan Rupiah (000 Rp)</strong> · Contoh: Rp 150.000 diketik{' '}
                <code className="tabular-code font-bold">150</code>. Mendukung penjumlahan cepat{' '}
                <code className="tabular-code font-bold">120+45+30</code> dan tombol{' '}
                <code className="tabular-code font-bold">×12</code> untuk pengeluaran rutin bulanan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const lines = [
                  `RINGKASAN BLOK VII.B SPDT26-K (DALAM RIBUAN RUPIAH / 000 RP)`,
                  ...BLOK_7B_GROUPS.map((g) => {
                    const gt = blok7BComputed.groupTotals[g.groupCode];
                    return `${g.groupTitle}: Sebulan=${formatNum(gt?.month || 0)} | Setahun=${formatNum(gt?.year || 0)}`;
                  }),
                  `JUMLAH B (02+03+04+05+06+07+08+09+11):`,
                  `  Kolom (2) Sebulan: ${formatNum(blok7BComputed.jumlahBMonth)} (000 Rp) [= Rp ${formatNum(blok7BComputed.jumlahBMonth * 1000)}]`,
                  `  Kolom (3) Setahun: ${formatNum(blok7BComputed.jumlahBYear)} (000 Rp) [= Rp ${formatNum(blok7BComputed.jumlahBYear * 1000)}]`,
                ];
                onCopyText(lines.join('\n'), 'Ringkasan Blok VII.B');
              }}
              className="h-8 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A] transition hover:border-[#003D7A] hover:text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
            >
              Salin Rekap VII.B
            </button>
          </div>

          {/* Warning if any Setahun < Sebulan */}
          {blok7BComputed.inconsistentSubgroups.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              <div className="font-bold">
                ⚠ Peringatan Konsistensi Buku 6 PML (Nilai Setahun &lt; Nilai Sebulan):
              </div>
              <p className="mt-0.5">
                Periode Setahun (Oktober 2025 – September 2026) mencakup bulan September 2026,
                sehingga <strong>Kolom (3) Setahun minimal sama atau lebih besar dari Kolom (2) Sebulan</strong> pada:{' '}
                <span className="font-semibold">
                  {blok7BComputed.inconsistentSubgroups.join(', ')}
                </span>
                .
              </p>
            </div>
          )}

          <div className="mt-4 space-y-5">
            {BLOK_7B_GROUPS.map((grp) => {
              const gt = blok7BComputed.groupTotals[grp.groupCode] || { month: 0, year: 0 };
              return (
                <div
                  key={grp.groupCode}
                  className="overflow-hidden rounded-lg border border-[#E2E8F0] dark:border-[#1E293B]"
                >
                  {/* Group Header with Auto Subtotal */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F1F5F9] px-4 py-2.5 dark:bg-[#0F172A]">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {grp.groupTitle}
                    </span>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        Sebulan (Kol 2):{' '}
                        <strong className="tabular-code text-[#003D7A] dark:text-[#38BDF8]">
                          {formatNum(gt.month)}
                        </strong>
                      </span>
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        Setahun (Kol 3):{' '}
                        <strong className="tabular-code text-[#003D7A] dark:text-[#38BDF8]">
                          {formatNum(gt.year)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                    {grp.subgroups.map((sg) => {
                      const mEv = blok7BComputed.monthEval[sg.id];
                      const yEv = blok7BComputed.yearEval[sg.id];
                      const isInvalidYear = mEv && yEv && mEv.total > 0 && yEv.total < mEv.total;

                      return (
                        <div
                          key={sg.id}
                          className="grid grid-cols-1 items-center gap-2.5 p-3 sm:grid-cols-12"
                        >
                          <div className="sm:col-span-5">
                            <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                              <span className="tabular-code mr-1.5 text-[#003D7A] dark:text-[#38BDF8]">
                                {sg.code}
                              </span>
                              {sg.label}
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              [{sg.sourceRef}]
                            </div>
                          </div>

                          {/* Kolom (2) Sebulan (000 Rp) */}
                          <div className="sm:col-span-3">
                            <label className="mb-0.5 block text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                              Sebulan Kol (2) (000 Rp)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={blok7BMonthInputs[sg.id] || ''}
                                onChange={(e) =>
                                  setBlok7BMonthInputs((prev) => ({
                                    ...prev,
                                    [sg.id]: e.target.value,
                                  }))
                                }
                                placeholder="0 / 50+25"
                                className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                              />
                              {mEv?.hasOperators && (
                                <span className="tabular-code shrink-0 text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                                  ={formatNum(mEv.total)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Kolom (3) Setahun (000 Rp) + Quick x12 button */}
                          <div className="sm:col-span-4">
                            <div className="mb-0.5 flex items-center justify-between">
                              <label className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                Setahun Kol (3) (000 Rp)
                              </label>
                              {mEv && mEv.total > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setBlok7BYearInputs((prev) => ({
                                      ...prev,
                                      [sg.id]: String(mEv.total * 12),
                                    }))
                                  }
                                  className="tabular-code rounded bg-[#EFF6FF] px-1.5 py-0.2 text-[10px] font-bold text-[#003D7A] hover:bg-[#DBEAFE] dark:bg-[#1E3A8A]/50 dark:text-[#38BDF8]"
                                  title="Kalikan nilai Sebulan × 12 bulan"
                                >
                                  Isi ×12 ({formatNum(mEv.total * 12)})
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={blok7BYearInputs[sg.id] || ''}
                                onChange={(e) =>
                                  setBlok7BYearInputs((prev) => ({
                                    ...prev,
                                    [sg.id]: e.target.value,
                                  }))
                                }
                                placeholder="0 / 600+150"
                                className={`tabular-code h-8 w-full rounded border px-2.5 text-xs font-semibold focus:outline-none ${
                                  isInvalidYear
                                    ? 'border-amber-500 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                                    : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]'
                                }`}
                              />
                              {yEv?.hasOperators && (
                                <span className="tabular-code shrink-0 text-xs font-bold text-[#003D7A] dark:text-[#38BDF8]">
                                  ={formatNum(yEv.total)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* GRAND TOTAL: JUMLAH B (02+03+04+05+06+07+08+09+11) */}
            <div className="rounded-lg border-2 border-[#003D7A] bg-[#F8FAFC] p-4 dark:border-[#38BDF8] dark:bg-[#0F172A]">
              <div className="text-xs font-bold tracking-wider uppercase text-[#003D7A] dark:text-[#38BDF8]">
                HASIL AKHIR BLOK VII.B (HALAMAN 48) — DALAM RIBUAN RUPIAH (000 RP)
              </div>
              <div className="mt-0.5 text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                Jumlah B (02 + 03 + 04 + 05 + 06 + 07 + 08 + 09 + 11)
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Kolom (2) Sebulan */}
                <div className="rounded-md border border-[#CBD5E1] bg-white p-3.5 dark:border-[#334155] dark:bg-[#111827]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#475569] dark:text-[#94A3B8]">
                      Kolom (2) Sebulan (000 Rp)
                    </span>
                    <span className="tabular-code text-lg font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                      {formatNum(blok7BComputed.jumlahBMonth)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Setara Rupiah Penuh: Rp {formatNum(blok7BComputed.jumlahBMonth * 1000)}
                  </div>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={pcl7BWritten.jumlahBMonth}
                      onChange={(e) =>
                        setPcl7BWritten((prev) => ({ ...prev, jumlahBMonth: e.target.value }))
                      }
                      placeholder="Cek Jumlah B Sebulan tertulis PCL..."
                      className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    />
                    {pcl7BWritten.jumlahBMonth && (
                      <div className="mt-1.5">
                        {renderDiffBadge(
                          blok7BComputed.jumlahBMonth,
                          pcl7BWritten.jumlahBMonth,
                          ''
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom (3) Setahun */}
                <div className="rounded-md border border-[#CBD5E1] bg-white p-3.5 dark:border-[#334155] dark:bg-[#111827]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#475569] dark:text-[#94A3B8]">
                      Kolom (3) Setahun (000 Rp)
                    </span>
                    <span className="tabular-code text-lg font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                      {formatNum(blok7BComputed.jumlahBYear)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Setara Rupiah Penuh: Rp {formatNum(blok7BComputed.jumlahBYear * 1000)}
                  </div>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={pcl7BWritten.jumlahBYear}
                      onChange={(e) =>
                        setPcl7BWritten((prev) => ({ ...prev, jumlahBYear: e.target.value }))
                      }
                      placeholder="Cek Jumlah B Setahun tertulis PCL..."
                      className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    />
                    {pcl7BWritten.jumlahBYear && (
                      <div className="mt-1.5">
                        {renderDiffBadge(blok7BComputed.jumlahBYear, pcl7BWritten.jumlahBYear, '')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 3: KALKULATOR HARIAN BLOK V (H-1..H-7) & KONVERTER BLOK VI
         ===================================================================== */}
      {subView === 'BLOK_V_VI_ROW' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left 7 Cols: Blok V H-1 s.d. H-7 Calculator */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-7 dark:border-[#1E293B] dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 dark:border-[#1E293B]">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Kalkulator Baris Harian Blok V (H-1 s.d. H-7 → Kolom 19 & 20)
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Menjumlahkan konsumsi seminggu terakhir dari Pembelian (Hal. 4–29 SPDT26-K).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDays(Array.from({ length: 7 }, () => ({ qty: '0', val: '0' })));
                  setPclCol19Qty('');
                  setPclCol20Val('');
                }}
                className="text-xs font-semibold text-[#64748B] hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:text-[#38BDF8]"
              >
                Kosongkan H-1..H-7
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Nama / Catatan Komoditas
                </label>
                <input
                  type="text"
                  value={dailyItemName}
                  onChange={(e) => setDailyItemName(e.target.value)}
                  className="mt-1 h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Target Subkelompok Blok VII.A
                </label>
                <select
                  value={targetSubgroup7A}
                  onChange={(e) => setTargetSubgroup7A(e.target.value)}
                  className="mt-1 h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {BLOK_7A_SUBGROUPS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7 Days Grid */}
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                <div className="col-span-3">Hari (Kolom)</div>
                <div className="col-span-4">Jumlah / Kuantitas</div>
                <div className="col-span-5">Nilai Pengeluaran (Rp)</div>
              </div>

              {days.map((d, idx) => {
                const colQtyNum = 5 + idx * 2;
                const colValNum = 6 + idx * 2;
                return (
                  <div key={idx} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-3 text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]">
                      H-{idx + 1}{' '}
                      <span className="tabular-code text-[10px] text-[#64748B]">
                        ({colQtyNum},{colValNum})
                      </span>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={d.qty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDays((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, qty: val } : item))
                          );
                        }}
                        placeholder="0"
                        className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={d.val}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDays((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, val: val } : item))
                          );
                        }}
                        placeholder="0"
                        className="tabular-code h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result Box Kolom (19) & Kolom (20) */}
            <div className="mt-4 rounded-md border border-[#003D7A]/30 bg-[#F8FAFC] p-3.5 dark:border-[#38BDF8]/30 dark:bg-[#0F172A]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Kolom (19) Total Jumlah
                  </div>
                  <div className="tabular-code text-lg font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                    {dailyComputed.col19}
                  </div>
                  <input
                    type="text"
                    value={pclCol19Qty}
                    onChange={(e) => setPclCol19Qty(e.target.value)}
                    placeholder="Cek Kol (19) tertulis PCL..."
                    className="tabular-code mt-1.5 h-7 w-full rounded border border-[#CBD5E1] bg-white px-2 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                  />
                  {dailyComputed.pcl19Num !== null && (
                    <div className="mt-1 text-[11px] font-bold">
                      {Math.abs(dailyComputed.diff19) < 0.001 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          ✓ Kolom (19) Cocok
                        </span>
                      ) : (
                        <span className="text-rose-700 dark:text-rose-400">
                          ✕ Selisih Kuantitas: {dailyComputed.diff19 > 0 ? '+' : ''}
                          {dailyComputed.diff19}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Kolom (20) Jumlah Nilai (Rp)
                  </div>
                  <div className="tabular-code text-lg font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                    Rp {formatNum(dailyComputed.col20)}
                  </div>
                  <input
                    type="text"
                    value={pclCol20Val}
                    onChange={(e) => setPclCol20Val(e.target.value)}
                    placeholder="Cek Kol (20) tertulis PCL..."
                    className="tabular-code mt-1.5 h-7 w-full rounded border border-[#CBD5E1] bg-white px-2 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                  />
                  {dailyComputed.pcl20Num !== null && (
                    <div className="mt-1 text-[11px] font-bold">
                      {dailyComputed.diff20 === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          ✓ Kolom (20) Cocok
                        </span>
                      ) : (
                        <span className="text-rose-700 dark:text-rose-400">
                          ✕ Selisih Rp {formatNum(Math.abs(dailyComputed.diff20))}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => handleSendDailyToBlok7A('ADD')}
                  className="h-8 rounded bg-[#003D7A] px-3 text-xs font-semibold text-white transition hover:bg-[#002D5A] dark:bg-[#0284C7]"
                >
                  + Tambahkan ke Subkelompok {targetSubgroup7A} (Blok VII.A)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendDailyToBlok7A('REPLACE')}
                  className="h-8 rounded border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#334155] transition hover:text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#CBD5E1]"
                >
                  Ganti Nilai {targetSubgroup7A}
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Konverter Blok VI (Ribuan Rupiah / 000 Rp) */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 lg:col-span-5 dark:border-[#1E293B] dark:bg-[#111827]">
            <h3 className="border-b border-[#E2E8F0] pb-3 text-sm font-bold text-[#0F172A] dark:border-[#1E293B] dark:text-[#F8FAFC]">
              Konverter Blok VI (Bukan Makanan — Dalam Ribuan Rupiah `000 Rp`)
            </h3>
            <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Pada Blok VI (Hal. 30–45), nilai pengeluaran wajib ditulis{' '}
              <strong>Dalam Ribuan Rupiah (000 Rp)</strong>. Gunakan alat ini untuk mengonversi
              pengeluaran bulanan/tahunan ke format kotak Blok VI.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Target Subkelompok Blok VII.B
                </label>
                <select
                  value={targetSubgroup7B}
                  onChange={(e) => setTargetSubgroup7B(e.target.value)}
                  className="mt-1 h-8 w-full rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {BLOK_7B_GROUPS.flatMap((g) => g.subgroups).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Nilai Pengeluaran Sebulan — September 2026 (Rupiah Penuh)
                </label>
                <input
                  type="text"
                  value={rawRupiahMonth}
                  onChange={(e) => setRawRupiahMonth(e.target.value)}
                  placeholder="Contoh: 150000 atau 85000+65000"
                  className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Frekuensi Bulan Setahun (1–12)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={freqMonthsInYear}
                    onChange={(e) => setFreqMonthsInYear(e.target.value)}
                    className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Tambahan Lain Setahun (Rp Penuh)
                  </label>
                  <input
                    type="text"
                    value={rawRupiahYearExtra}
                    onChange={(e) => setRawRupiahYearExtra(e.target.value)}
                    placeholder="0"
                    className="tabular-code mt-1 h-9 w-full rounded border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Hasil Penulisan di Kuesioner Blok VI (Dalam 000 Rp):
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <div className="rounded border border-[#E2E8F0] bg-white p-2.5 dark:border-[#1E293B] dark:bg-[#111827]">
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Kolom (6) Sebulan (000 Rp)
                    </div>
                    <div className="tabular-code mt-0.5 text-lg font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                      {formatNum(blok6ConverterComputed.col6MonthRibuan)}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      (Rp {formatNum(blok6ConverterComputed.monthRp)})
                    </div>
                  </div>
                  <div className="rounded border border-[#E2E8F0] bg-white p-2.5 dark:border-[#1E293B] dark:bg-[#111827]">
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Kolom (7) Setahun (000 Rp)
                    </div>
                    <div className="tabular-code mt-0.5 text-lg font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                      {formatNum(blok6ConverterComputed.col7YearRibuan)}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      (Rp {formatNum(blok6ConverterComputed.totalYearRp)})
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendBlok6ToBlok7B('ADD')}
                    className="h-8 rounded bg-[#003D7A] px-3 text-xs font-semibold text-white transition hover:bg-[#002D5A] dark:bg-[#0284C7]"
                  >
                    + Tambahkan ke {targetSubgroup7B} (Blok VII.B)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendBlok6ToBlok7B('REPLACE')}
                    className="h-8 rounded border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#334155] dark:border-[#334155] dark:bg-[#111827] dark:text-[#CBD5E1]"
                  >
                    Ganti Nilai {targetSubgroup7B}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 4: KALKULATOR & DECODER KODE SUBSEKTOR BLOK IV KOLOM (10)
         ===================================================================== */}
      {subView === 'BLOK_IV_KODE' && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-6 dark:border-[#1E293B] dark:bg-[#111827]">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Kalkulator & Pengurai Kode Subsektor Blok IV Kolom (10) (Halaman 3 SPDT26-K)
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
            Aturan Blok IV Kolom (10):{' '}
            <em>
              &ldquo;Jika Kol (8) Berkode 1, Subsektor yang Diusahakan (Kode). Pilihan lebih dari
              satu (jumlahkan kode)&rdquo;
            </em>
            . Centang subsektor di bawah atau ketik angka kode tertulis PCL untuk menguraikan
            kombinasinya.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-12">
            <div className="space-y-2 md:col-span-7">
              {BLOK_4_SUBSECTORS.map((sub) => {
                const checked = (selectedSubsectorMask & sub.code) !== 0;
                return (
                  <label
                    key={sub.code}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition ${
                      checked
                        ? 'border-[#003D7A] bg-[#EFF6FF]/70 dark:border-[#38BDF8] dark:bg-[#1E3A8A]/30'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] dark:border-[#1E293B] dark:bg-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleSubsectorBit(sub.code)}
                        className="h-4 w-4 rounded border-[#CBD5E1] text-[#003D7A]"
                      />
                      <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {sub.name}
                      </span>
                    </div>
                    <span className="tabular-code rounded bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-extrabold text-[#003D7A] dark:bg-[#1E293B] dark:text-[#38BDF8]">
                      Kode {sub.code}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-4 md:col-span-5 dark:border-[#334155] dark:bg-[#0F172A]">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8]">
                  HASIL KODE BLOK IV KOLOM (10)
                </div>
                <div className="tabular-code mt-2 text-3xl font-extrabold text-[#003D7A] dark:text-[#38BDF8]">
                  {selectedSubsectorMask}
                </div>

                <div className="mt-2 text-xs text-[#475569] dark:text-[#94A3B8]">
                  Rumus Penjumlahan:{' '}
                  <strong className="tabular-code text-[#0F172A] dark:text-[#F8FAFC]">
                    {BLOK_4_SUBSECTORS.filter((s) => (selectedSubsectorMask & s.code) !== 0)
                      .map((s) => s.code)
                      .join(' + ') || '0'}
                  </strong>
                </div>

                <div className="mt-4 border-t border-[#E2E8F0] pt-3 dark:border-[#1E293B]">
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Subsektor Terkandung:
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-[#334155] dark:text-[#CBD5E1]">
                    {BLOK_4_SUBSECTORS.filter((s) => (selectedSubsectorMask & s.code) !== 0).map(
                      (s) => (
                        <li key={s.code} className="flex items-center gap-2">
                          <span className="tabular-code font-bold text-[#003D7A] dark:text-[#38BDF8]">
                            [{s.code}]
                          </span>
                          <span>{s.name}</span>
                        </li>
                      )
                    )}
                    {selectedSubsectorMask === 0 && (
                      <li className="text-[#64748B]">Belum ada subsektor dipilih.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-5 border-t border-[#E2E8F0] pt-3.5 dark:border-[#1E293B]">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Uji / Decode Kode Tertulis PCL (1 – 127):
                </label>
                <input
                  type="number"
                  min={1}
                  max={127}
                  value={pclCol10Input}
                  onChange={(e) => handleDecodeCol10Input(e.target.value)}
                  placeholder="Ketik kode Kol (10)..."
                  className="tabular-code mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F8FAFC]"
                />
                {(() => {
                  const n = parseInt(pclCol10Input.trim(), 10);
                  if (Number.isNaN(n)) return null;
                  if (n < 1 || n > 127) {
                    return (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                        ✕ Kode {n} tidak valid! Jumlah maksimal seluruh 7 subsektor adalah 127.
                      </p>
                    );
                  }
                  return (
                    <p className="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                      ✓ Kode {n} valid dan telah diuraikan ke daftar subsektor di atas.
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
