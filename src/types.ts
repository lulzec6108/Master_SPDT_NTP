export type CategoryType = 'KONSUMSI' | 'PRODUKSI' | 'BIAYA_PRODUKSI';

export type SectorId =
  | 'ALL'
  | '1_KONSUMSI'
  | '2_TP'
  | '3_TH'
  | '4_TPR'
  | '5_TRK'
  | '6_IKT'
  | '7_IKB'
  | '8_HTN';

export interface CommodityItem {
  code: string; // 7-digit code e.g. "0111001" or "2101001"
  name: string;
  unit: string; // Satuan Produksi / Satuan Konsumsi
  plantUnit?: string; // Optional Satuan Tanam ("M2", "POHON", "RUMPUN")
  sectorId: Exclude<SectorId, 'ALL'>;
  sectorName: string;
  questionnaireCode: string; // e.g. "SPDT26-K", "SPDT26-TP"
  groupCode: string;
  groupName: string;
  categoryType: CategoryType;
  isPrimary?: boolean;
  isCustom?: boolean;
  notes?: string;
}

export interface OfficerItem {
  code: string; // Pure 3-digit code e.g. "001" .. "045"
  name: string;
  role?: 'PCL' | 'PML';
  wilayah?: string;
  isCustom?: boolean;
}

export type QuestionnaireId =
  | 'SPDT26-K'
  | 'SPDT26-TP'
  | 'SPDT26-TH'
  | 'SPDT26-TPR'
  | 'SPDT26-TRK'
  | 'SPDT26-IKT'
  | 'SPDT26-IKB'
  | 'SPDT26-HTN';

export interface PmlChecklistRule {
  id: string;
  questionnaire: QuestionnaireId;
  block: string;
  title: string;
  description: string;
  referencePage: string;
  severity: 'WAJIB' | 'KONSISTENSI' | 'KEWAJARAN';
  crossCheckHint?: string;
}
