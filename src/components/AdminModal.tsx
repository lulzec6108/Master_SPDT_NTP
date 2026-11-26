import React, { useState, useEffect } from 'react';
import { CategoryType, CommodityItem, OfficerItem, SectorId } from '../types';
import { SECTORS } from '../data/commodities';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  initialMode?: 'LOGIN' | 'COMMODITY_FORM' | 'OFFICER_FORM' | 'BACKUP';
  editingCommodity?: CommodityItem | null;
  editingOfficer?: OfficerItem | null;
  onSaveCommodity: (item: CommodityItem, originalCode?: string) => void;
  onSaveOfficer: (item: OfficerItem, originalCode?: string) => void;
  onExportDatabase: () => void;
  onImportDatabase: (jsonText: string) => { ok: boolean; message: string };
  onResetDatabase: () => void;
}

// One-way SHA-256 digest of salted credentials. No plaintext username or password exists in repo.
const EXPECTED_AUTH_DIGEST = '933bdeea746f08434ea0f2a04a49390bde9706d7df89f7342330ab645e64b323';

async function computeAuthDigest(user: string, pass: string): Promise<string> {
  const raw = `spdt26_salt::${user.trim().toLowerCase()}::${pass}`;
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout,
  initialMode = 'LOGIN',
  editingCommodity,
  editingOfficer,
  onSaveCommodity,
  onSaveOfficer,
  onExportDatabase,
  onImportDatabase,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'COMMODITY_FORM' | 'OFFICER_FORM' | 'BACKUP'>(
    'COMMODITY_FORM'
  );

  // Login State (Starts completely empty, zero hints)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Commodity Form State
  const [commCode, setCommCode] = useState('');
  const [commName, setCommName] = useState('');
  const [commUnit, setCommUnit] = useState('KILOGRAM');
  const [commPlantUnit, setCommPlantUnit] = useState('');
  const [commSector, setCommSector] = useState<Exclude<SectorId, 'ALL'>>('1_KONSUMSI');
  const [commCategory, setCommCategory] = useState<CategoryType>('KONSUMSI');
  const [commGroupCode, setCommGroupCode] = useState('01.1.1');
  const [commGroupName, setCommGroupName] = useState('PADI-PADIAN, UMBI-UMBIAN, DAN PENGGANTINYA');
  const [commPrimary, setCommPrimary] = useState(false);
  const [commNotes, setCommNotes] = useState('');
  const [commFormError, setCommFormError] = useState('');

  // Officer Form State (Pure 3-digit code)
  const [offCode, setOffCode] = useState('');
  const [offName, setOffName] = useState('');
  const [offRole, setOffRole] = useState<'PCL' | 'PML'>('PCL');
  const [offFormError, setOffFormError] = useState('');

  // Backup Import State
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoginError('');
    setCommFormError('');
    setOffFormError('');
    setImportFeedback(null);
    setConfirmReset(false);
    setUsername('');
    setPassword('');

    if (initialMode === 'OFFICER_FORM' || editingOfficer) {
      setActiveTab('OFFICER_FORM');
    } else if (initialMode === 'BACKUP') {
      setActiveTab('BACKUP');
    } else {
      setActiveTab('COMMODITY_FORM');
    }

    if (editingCommodity) {
      setCommCode(editingCommodity.code);
      setCommName(editingCommodity.name);
      setCommUnit(editingCommodity.unit);
      setCommPlantUnit(editingCommodity.plantUnit || '');
      setCommSector(editingCommodity.sectorId);
      setCommCategory(editingCommodity.categoryType);
      setCommGroupCode(editingCommodity.groupCode);
      setCommGroupName(editingCommodity.groupName);
      setCommPrimary(Boolean(editingCommodity.isPrimary));
      setCommNotes(editingCommodity.notes || '');
    } else {
      setCommCode('');
      setCommName('');
      setCommUnit('KILOGRAM');
      setCommPlantUnit('');
      setCommSector('1_KONSUMSI');
      setCommCategory('KONSUMSI');
      setCommGroupCode('01.1.1');
      setCommGroupName('PADI-PADIAN, UMBI-UMBIAN, DAN PENGGANTINYA');
      setCommPrimary(false);
      setCommNotes('');
    }

    if (editingOfficer) {
      setOffCode(editingOfficer.code);
      setOffName(editingOfficer.name);
      setOffRole(editingOfficer.role || 'PCL');
    } else {
      setOffCode('');
      setOffName('');
      setOffRole('PCL');
    }
  }, [isOpen, initialMode, editingCommodity, editingOfficer]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const digest = await computeAuthDigest(username, password);
      if (digest === EXPECTED_AUTH_DIGEST) {
        setLoginError('');
        setUsername('');
        setPassword('');
        onLoginSuccess();
      } else {
        setLoginError('Otentikasi gagal. Periksa kembali kredensial Anda.');
      }
    } catch {
      setLoginError('Gagal memverifikasi kredensial.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSectorChange = (sec: Exclude<SectorId, 'ALL'>) => {
    setCommSector(sec);
    if (sec === '1_KONSUMSI') {
      setCommCategory('KONSUMSI');
      setCommGroupCode('01.1.1');
      setCommGroupName('PADI-PADIAN, UMBI-UMBIAN, DAN PENGGANTINYA');
    } else {
      const prefix = sec.split('_')[0];
      setCommCategory('PRODUKSI');
      setCommGroupCode(`${prefix}101`);
      const found = SECTORS.find((s) => s.id === sec);
      setCommGroupName(found ? `PRODUKSI ${found.label.toUpperCase()}` : 'PRODUKSI SUBSEKTOR');
    }
  };

  const handleCommoditySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = commCode.trim();
    if (!/^\d{5,8}$/.test(cleanCode)) {
      setCommFormError('Kode komoditas harus berupa angka 7 digit.');
      return;
    }
    if (!commName.trim() || !commUnit.trim()) {
      setCommFormError('Nama komoditas dan satuan wajib diisi.');
      return;
    }

    const sectorObj = SECTORS.find((s) => s.id === commSector);
    const newItem: CommodityItem = {
      code: cleanCode,
      name: commName.trim().toUpperCase(),
      unit: commUnit.trim().toUpperCase(),
      plantUnit: commPlantUnit.trim() ? commPlantUnit.trim().toUpperCase() : undefined,
      sectorId: commSector,
      sectorName: sectorObj ? sectorObj.label : '1. Konsumsi Rumah Tangga',
      questionnaireCode: sectorObj ? sectorObj.docCode : 'SPDT26-K',
      groupCode: commGroupCode.trim() || cleanCode.slice(0, 2),
      groupName: commGroupName.trim() || 'KELOMPOK KOMODITAS',
      categoryType: commCategory,
      isPrimary: commPrimary,
      isCustom: true,
      notes: commNotes.trim() || undefined,
    };

    onSaveCommodity(newItem, editingCommodity?.code);
    onClose();
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paddedCode = offCode.trim().padStart(3, '0');
    if (!/^\d{3}$/.test(paddedCode)) {
      setOffFormError('Kode petugas wajib 3 digit angka (contoh: 046).');
      return;
    }
    if (!offName.trim()) {
      setOffFormError('Nama petugas wajib diisi.');
      return;
    }

    const newOfficer: OfficerItem = {
      code: paddedCode,
      name: offName.trim().toUpperCase(),
      role: offRole,
      isCustom: true,
    };

    onSaveOfficer(newOfficer, editingOfficer?.code);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      const result = onImportDatabase(content);
      setImportFeedback(result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-2xl dark:border-[#1E293B] dark:bg-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 dark:border-[#1E293B]">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              {isAdmin ? 'Pengelolaan Master Data SPDT26' : 'Otentikasi Pengelola'}
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
              {isAdmin
                ? 'Tambah atau perbarui kode komoditas & kode petugas'
                : 'Masukkan kredensial untuk mengelola data'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-white"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Login Form (No hints, no plaintext credentials) */}
        {!isAdmin ? (
          <form onSubmit={handleLogin} className="p-6">
            {loginError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  ID Pengguna
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-sm font-medium text-[#0F172A] transition focus:border-[#003D7A] focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:focus:border-[#38BDF8] dark:focus:bg-[#0F172A]"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-sm font-medium text-[#0F172A] transition focus:border-[#003D7A] focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:focus:border-[#38BDF8] dark:focus:bg-[#0F172A]"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-md px-3.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="h-9 rounded-md bg-[#003D7A] px-5 text-xs font-semibold text-white transition hover:bg-[#002B57] disabled:opacity-50 dark:bg-[#0284C7] dark:hover:bg-[#0369A1]"
              >
                {isVerifying ? 'Memverifikasi...' : 'Masuk'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Segmented Navigation */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-2.5 dark:border-[#1E293B] dark:bg-[#0F172A]">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('COMMODITY_FORM')}
                  className={`h-8 rounded px-3 text-xs font-semibold transition ${
                    activeTab === 'COMMODITY_FORM'
                      ? 'bg-[#003D7A] text-white dark:bg-[#0284C7]'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {editingCommodity ? 'Edit Komoditas' : '+ Komoditas'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('OFFICER_FORM')}
                  className={`h-8 rounded px-3 text-xs font-semibold transition ${
                    activeTab === 'OFFICER_FORM'
                      ? 'bg-[#003D7A] text-white dark:bg-[#0284C7]'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {editingOfficer ? 'Edit Petugas' : '+ Petugas (3-Digit)'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('BACKUP')}
                  className={`h-8 rounded px-3 text-xs font-semibold transition ${
                    activeTab === 'BACKUP'
                      ? 'bg-[#003D7A] text-white dark:bg-[#0284C7]'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Cadangan Data
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
              >
                Keluar
              </button>
            </div>

            {/* Tab 1: Commodity Form */}
            {activeTab === 'COMMODITY_FORM' && (
              <form onSubmit={handleCommoditySubmit} className="p-6">
                {commFormError && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    {commFormError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Kode Komoditas (7 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={commCode}
                      onChange={(e) => setCommCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="0111001"
                      className="tabular-code mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#003D7A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#38BDF8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Sektor Kuesioner
                    </label>
                    <select
                      value={commSector}
                      onChange={(e) => handleSectorChange(e.target.value as Exclude<SectorId, 'ALL'>)}
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      {SECTORS.filter((s) => s.id !== 'ALL').map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.shortLabel} ({sec.docCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Uraian Komoditas
                    </label>
                    <input
                      type="text"
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="BERAS / PUPUK UREA / IKAN TOMAN"
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] uppercase focus:border-[#003D7A] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Kategori
                    </label>
                    <select
                      value={commCategory}
                      onChange={(e) => setCommCategory(e.target.value as CategoryType)}
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="KONSUMSI">Konsumsi</option>
                      <option value="PRODUKSI">Produksi</option>
                      <option value="BIAYA_PRODUKSI">Biaya Produksi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Satuan Baku
                    </label>
                    <input
                      type="text"
                      value={commUnit}
                      onChange={(e) => setCommUnit(e.target.value)}
                      placeholder="KILOGRAM / ONS / LITER"
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] uppercase dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Satuan Tanam (Opsional)
                    </label>
                    <input
                      type="text"
                      value={commPlantUnit}
                      onChange={(e) => setCommPlantUnit(e.target.value)}
                      placeholder="M2 / POHON / RUMPUN"
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] uppercase dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Catatan Singkat (Opsional)
                    </label>
                    <input
                      type="text"
                      value={commNotes}
                      onChange={(e) => setCommNotes(e.target.value)}
                      placeholder="Keterangan tambahan"
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 rounded-md px-3.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-[#003D7A] px-5 text-xs font-semibold text-white hover:bg-[#002B57] dark:bg-[#0284C7]"
                  >
                    Simpan Komoditas
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Officer Form (Pure 3-digit) */}
            {activeTab === 'OFFICER_FORM' && (
              <form onSubmit={handleOfficerSubmit} className="p-6">
                {offFormError && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    {offFormError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Kode Petugas (3 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={offCode}
                      onChange={(e) => setOffCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="046"
                      className="tabular-code mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-bold text-[#003D7A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#38BDF8]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Jabatan
                    </label>
                    <select
                      value={offRole}
                      onChange={(e) => setOffRole(e.target.value as 'PCL' | 'PML')}
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="PCL">PCL (Pencacah)</option>
                      <option value="PML">PML (Pemeriksa)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Nama Lengkap Petugas
                    </label>
                    <input
                      type="text"
                      value={offName}
                      onChange={(e) => setOffName(e.target.value)}
                      placeholder="NAMA LENGKAP PETUGAS"
                      className="mt-1.5 h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0F172A] uppercase dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 rounded-md px-3.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-[#003D7A] px-5 text-xs font-semibold text-white hover:bg-[#002B57] dark:bg-[#0284C7]"
                  >
                    Simpan Petugas
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Backup & Reset */}
            {activeTab === 'BACKUP' && (
              <div className="space-y-4 p-6">
                <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E293B] dark:bg-[#0F172A]">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Sinkronisasi File JSON
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Ekspor perubahan lokal ke file JSON atau pulihkan dari cadangan.
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={onExportDatabase}
                      className="h-9 rounded-md bg-[#003D7A] px-4 text-xs font-semibold text-white hover:bg-[#002B57] dark:bg-[#0284C7]"
                    >
                      Unduh JSON
                    </button>

                    <label className="flex h-9 cursor-pointer items-center rounded-md border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]">
                      Impor JSON
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {importFeedback && (
                    <p
                      className={`mt-2.5 text-xs font-semibold ${
                        importFeedback.ok
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {importFeedback.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] p-3.5 dark:border-[#1E293B]">
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Kembalikan ke data standar Buku 5
                  </span>
                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
                    >
                      Reset Data
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onResetDatabase();
                          setConfirmReset(false);
                          onClose();
                        }}
                        className="h-8 rounded bg-red-600 px-3 text-xs font-semibold text-white"
                      >
                        Konfirmasi Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="h-8 rounded px-2 text-xs text-[#64748B] dark:text-[#94A3B8]"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
