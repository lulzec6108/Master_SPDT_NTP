import { useState, useEffect, useCallback, useRef } from 'react';
import { CommodityItem, OfficerItem, QuestionnaireId, SectorId } from './types';
import { INITIAL_COMMODITIES } from './data/commodities';
import { INITIAL_OFFICERS } from './data/officers';
import { PML_CHECKLIST_RULES } from './data/pmlRules';
import { LoadingScreen } from './components/LoadingScreen';
import { CommodityTab, FilterGroup, SECTOR_FILTERS } from './components/CommodityTab';
import { OfficerTab } from './components/OfficerTab';
import { LocalAssistantTab } from './components/LocalAssistantTab';
import { PmlAssistantTab } from './components/PmlAssistantTab';
import { AdminModal } from './components/AdminModal';

const STORAGE_KEYS = {
  COMMODITIES: 'spdt_ntp_2026_commodities_v4_buku5',
  OFFICERS: 'spdt_ntp_2026_officers_v3',
  FAVORITES: 'spdt_ntp_2026_favorites_v3',
  CHECKLIST: 'spdt_ntp_2026_pml_checklist_v3',
  ADMIN_SESSION: 'spdt_ntp_2026_admin_session_v3',
  THEME: 'spdt_ntp_2026_theme_v1',
};

type ActiveTab = 'COMMODITIES' | 'OFFICERS' | 'ASSISTANT' | 'PML_TOOLS';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('COMMODITIES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorId>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup>('ALL');

  // Dual Theme: Light & Dark Mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // Fallback
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  const [commodities, setCommodities] = useState<CommodityItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMODITIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_COMMODITIES;
  });

  const [officers, setOfficers] = useState<OfficerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFICERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].code) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_OFFICERS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : ['0111001', '0141003', '2101001', '4102010', '4102012'];
    } catch {
      return ['0111001', '0141003', '2101001'];
    }
  });

  const [checkedRuleIds, setCheckedRuleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  });

  // Hidden Admin Button Trigger (Revealed only after pressing 'f' 4 times or when already logged in as Admin)
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  });
  const fKeyTimestampsRef = useRef<number[]>([]);

  // Admin Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState<
    'LOGIN' | 'COMMODITY_FORM' | 'OFFICER_FORM' | 'BACKUP'
  >('LOGIN');
  const [editingCommodity, setEditingCommodity] = useState<CommodityItem | null>(null);
  const [editingOfficer, setEditingOfficer] = useState<OfficerItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Listen for 4 consecutive presses of key 'f' outside text inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }

      if (e.key === 'f' || e.key === 'F') {
        const now = Date.now();
        const recent = fKeyTimestampsRef.current.filter((t) => now - t < 1600);
        recent.push(now);
        fKeyTimestampsRef.current = recent;

        if (recent.length >= 4) {
          fKeyTimestampsRef.current = [];
          setAdminUnlocked(true);
          setEditingCommodity(null);
          setEditingOfficer(null);
          setAdminModalMode(isAdmin ? 'COMMODITY_FORM' : 'LOGIN');
          setAdminModalOpen(true);
          showToast('Menu Pengelola Dibuka');
        }
      } else {
        fKeyTimestampsRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMODITIES, JSON.stringify(commodities));
    } catch {
      // Ignore
    }
  }, [commodities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
    } catch {
      // Ignore
    }
  }, [officers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch {
      // Ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checkedRuleIds));
    } catch {
      // Ignore
    }
  }, [checkedRuleIds]);

  const handleCopyCode = useCallback(
    (text: string, label: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      showToast(`Disalin: ${label}`);
    },
    [showToast]
  );

  const handleToggleFavorite = (code: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((c) => c !== code) : [...prev, code];
      showToast(exists ? `${code} dihapus dari Tersimpan` : `${code} disimpan`);
      return next;
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setCheckedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleResetChecklist = (questionnaire?: QuestionnaireId) => {
    if (!questionnaire) {
      setCheckedRuleIds([]);
      return;
    }
    const idsToClear = PML_CHECKLIST_RULES.filter((r) => r.questionnaire === questionnaire).map(
      (r) => r.id
    );
    setCheckedRuleIds((prev) => prev.filter((id) => !idsToClear.includes(id)));
    showToast(`Checklist ${questionnaire} direset`);
  };

  const handleSaveCommodity = (newItem: CommodityItem, originalCode?: string) => {
    setCommodities((prev) => {
      if (originalCode) {
        return prev.map((item) => (item.code === originalCode ? newItem : item));
      }
      const existingIdx = prev.findIndex((item) => item.code === newItem.code);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });
    showToast(`Komoditas ${newItem.code} disimpan`);
  };

  const handleDeleteCommodity = (code: string) => {
    setCommodities((prev) => prev.filter((item) => item.code !== code));
    showToast(`Komoditas ${code} dihapus`);
  };

  const handleSaveOfficer = (newOfficer: OfficerItem, originalCode?: string) => {
    setOfficers((prev) => {
      if (originalCode) {
        return prev
          .map((item) => (item.code === originalCode ? newOfficer : item))
          .sort((a, b) => a.code.localeCompare(b.code));
      }
      const existingIdx = prev.findIndex((item) => item.code === newOfficer.code);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newOfficer;
        return copy.sort((a, b) => a.code.localeCompare(b.code));
      }
      return [...prev, newOfficer].sort((a, b) => a.code.localeCompare(b.code));
    });
    showToast(`Petugas ${newOfficer.code} disimpan`);
  };

  const handleDeleteOfficer = (code: string) => {
    setOfficers((prev) => prev.filter((item) => item.code !== code));
    showToast(`Petugas ${code} dihapus`);
  };

  const handleImportOfficersCsv = (csvText: string) => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      return { ok: false, count: 0, message: 'Format CSV tidak valid.' };
    }
    const imported: OfficerItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        const code = parts[0].padStart(3, '0');
        const name = parts[1].toUpperCase();
        const role = (parts[2] as 'PCL' | 'PML') || 'PCL';
        if (name && /^\d{3}$/.test(code)) {
          imported.push({ code, name, role, isCustom: true });
        }
      }
    }
    if (imported.length === 0) {
      return { ok: false, count: 0, message: 'Tidak ada kode 3 digit yang valid.' };
    }

    setOfficers((prev) => {
      const map = new Map(prev.map((o) => [o.code, o]));
      imported.forEach((o) => map.set(o.code, o));
      return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
    });
    return {
      ok: true,
      count: imported.length,
      message: `${imported.length} petugas berhasil dimuat.`,
    };
  };

  const handleExportDatabase = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 'SPDT-NTP-2026-BUKU5',
      commodities,
      officers,
      favorites,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spdt_ntp_2026_backup.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('File JSON diunduh');
  };

  const handleImportDatabase = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed.commodities) && Array.isArray(parsed.officers)) {
        setCommodities(parsed.commodities);
        setOfficers(parsed.officers);
        if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
        return {
          ok: true,
          message: `Memuat ${parsed.commodities.length} komoditas & ${parsed.officers.length} petugas.`,
        };
      }
      return { ok: false, message: 'Format JSON tidak sesuai.' };
    } catch {
      return { ok: false, message: 'Gagal membaca file JSON.' };
    }
  };

  const handleResetDatabase = () => {
    setCommodities(INITIAL_COMMODITIES);
    setOfficers(INITIAL_OFFICERS);
    localStorage.removeItem(STORAGE_KEYS.COMMODITIES);
    localStorage.removeItem(STORAGE_KEYS.OFFICERS);
    showToast('Database dikembalikan ke standar Buku 5');
  };

  if (isLoading) {
    return (
      <LoadingScreen
        totalCommodities={commodities.length}
        totalOfficers={officers.length}
        onComplete={() => setIsLoading(false)}
      />
    );
  }

  const navItems: { id: ActiveTab; label: string; badge?: string }[] = [
    { id: 'COMMODITIES', label: 'Master Komoditas', badge: commodities.length.toLocaleString('id-ID') },
    { id: 'OFFICERS', label: 'Kode Petugas', badge: String(officers.length) },
    { id: 'ASSISTANT', label: 'Asisten Lokal' },
    { id: 'PML_TOOLS', label: 'Kalkulator PML' },
  ];

  const groupFilters: { id: FilterGroup; label: string }[] = [
    { id: 'ALL', label: 'Semua Kategori' },
    { id: 'KONSUMSI', label: 'Konsumsi RT' },
    { id: 'PRODUKSI', label: 'Produksi' },
    { id: 'BIAYA_PRODUKSI', label: 'Biaya Produksi' },
    { id: 'FAVORITES', label: `Tersimpan (★ ${favorites.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#0F172A] transition-colors md:pb-14 dark:bg-[#0B0F19] dark:text-[#F1F5F9]">
      {/* Sticky Top Header (Height: 57px, matches sticky top-[57px] filter bars) */}
      <header className="sticky top-0 z-40 h-[57px] border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs dark:border-[#1E293B] dark:bg-[#111827]/95">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
          {/* Zone 1: Burger Button + Brand Mark with Custom SPDT Balance Scale / Neraca Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${
                isSidebarOpen
                  ? 'border-[#003D7A] bg-[#003D7A] text-white dark:border-[#0284C7] dark:bg-[#0284C7]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1] hover:bg-white hover:text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:text-white'
              }`}
              aria-label={isSidebarOpen ? 'Tutup Sidebar Navigasi' : 'Buka Sidebar Navigasi'}
              aria-expanded={isSidebarOpen}
              title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar Navigasi & Filter'}
            >
              {isSidebarOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#002D5A] bg-[#003D7A] dark:border-[#1E3A8A] dark:bg-[#0F2952]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3V20M8 20H16"
                  stroke="#F8FAFC"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M4.5 7H19.5"
                  stroke="#38BDF8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M4.5 7L2.5 13H6.5L4.5 7Z"
                  stroke="#4ADE80"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.2 13C2.2 14.3 3.2 15.2 4.5 15.2C5.8 15.2 6.8 14.3 6.8 13"
                  stroke="#4ADE80"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M19.5 7L17.5 13H21.5L19.5 7Z"
                  stroke="#FB923C"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.2 13C17.2 14.3 18.2 15.2 19.5 15.2C20.8 15.2 21.8 14.3 21.8 13"
                  stroke="#FB923C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="7" r="1.5" fill="#F8FAFC" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight whitespace-nowrap text-[#0F172A] sm:text-base dark:text-[#F8FAFC]">
              SPDT NTP 2026
            </span>
          </div>

          {/* Zone 2: Clean Typography Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigasi Utama">
            {navItems.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex h-[57px] items-center text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? 'text-[#003D7A] dark:text-[#38BDF8]'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#003D7A] dark:bg-[#38BDF8]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Theme Switcher (+ Hidden Admin Button when unlocked via 4x 'f') */}
          <div className="flex items-center gap-2 shrink-0">
            {(adminUnlocked || isAdmin) && (
              <button
                type="button"
                onClick={() => {
                  setEditingCommodity(null);
                  setEditingOfficer(null);
                  setAdminModalMode(
                    isAdmin
                      ? activeTab === 'OFFICERS'
                        ? 'OFFICER_FORM'
                        : 'COMMODITY_FORM'
                      : 'LOGIN'
                  );
                  setAdminModalOpen(true);
                }}
                className={`h-8 rounded-md border px-3 text-xs font-semibold whitespace-nowrap transition ${
                  isAdmin
                    ? 'border-[#15803D] bg-[#15803D] text-white'
                    : 'border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1]'
                }`}
              >
                {isAdmin ? 'Kelola Data' : 'Pengelola'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-xs font-semibold whitespace-nowrap text-[#475569] transition hover:border-[#CBD5E1] hover:text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:text-white"
              title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Ubah Tema"
            >
              {isDark ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
                  </svg>
                  <span className="hidden sm:inline">Terang</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">Gelap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hide & Show Sidebar Drawer + Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 top-[57px] z-30 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="mx-auto flex max-w-6xl">
        {/* Responsive Hide & Show Sidebar */}
        {isSidebarOpen && (
          <aside
            className="fixed top-[57px] bottom-0 left-0 z-40 w-72 overflow-y-auto border-r border-[#E2E8F0] bg-white p-4 shadow-xl lg:sticky lg:top-[57px] lg:z-20 lg:h-[calc(100vh-57px)] lg:w-64 lg:shrink-0 lg:shadow-none dark:border-[#1E293B] dark:bg-[#111827]"
            aria-label="Menu Sidebar Navigasi & Filter"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#1E293B]">
              <span className="text-xs font-bold tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8]">
                Navigasi & Filter
              </span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded px-2 py-0.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-white"
              >
                Tutup
              </button>
            </div>

            {/* Section 1: Main Navigation Tabs */}
            <div className="mt-4">
              <div className="px-2 text-[11px] font-bold tracking-wider uppercase text-[#94A3B8] dark:text-[#64748B]">
                Menu Utama
              </div>
              <div className="mt-1.5 space-y-1">
                {navItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-semibold transition ${
                        active
                          ? 'bg-[#003D7A] text-white dark:bg-[#0284C7]'
                          : 'text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`tabular-code rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Quick Subsektor Filter (Buku 5) */}
            <div className="mt-5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E293B]">
              <div className="px-2 text-[11px] font-bold tracking-wider uppercase text-[#94A3B8] dark:text-[#64748B]">
                Subsektor Buku 5
              </div>
              <div className="mt-1.5 space-y-1">
                {SECTOR_FILTERS.map((sf) => {
                  const active = activeTab === 'COMMODITIES' && selectedSector === sf.id;
                  return (
                    <button
                      key={sf.id}
                      type="button"
                      onClick={() => {
                        setActiveTab('COMMODITIES');
                        setSelectedSector(sf.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                        active
                          ? 'bg-[#EFF6FF] text-[#003D7A] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]'
                          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      <span>{sf.label}</span>
                      <span className="tabular-code text-[11px] text-[#64748B] dark:text-[#64748B]">
                        {sf.codePrefix}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Quick Kategori Filter */}
            <div className="mt-5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E293B]">
              <div className="px-2 text-[11px] font-bold tracking-wider uppercase text-[#94A3B8] dark:text-[#64748B]">
                Kategori Komoditas
              </div>
              <div className="mt-1.5 space-y-1">
                {groupFilters.map((gf) => {
                  const active = activeTab === 'COMMODITIES' && selectedGroup === gf.id;
                  return (
                    <button
                      key={gf.id}
                      type="button"
                      onClick={() => {
                        setActiveTab('COMMODITIES');
                        setSelectedGroup(gf.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                        active
                          ? 'bg-[#EFF6FF] text-[#003D7A] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]'
                          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      <span>{gf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Dokumen Pedoman PDF */}
            <div className="mt-5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E293B]">
              <div className="px-2 text-[11px] font-bold tracking-wider uppercase text-[#94A3B8] dark:text-[#64748B]">
                Dokumen Pedoman (PDF)
              </div>
              <div className="mt-1.5 space-y-1 text-xs">
                <a
                  href="./assets/aistudio/Buku_5_Master_Komoditas_SPDT_NTP_2026_089343c2.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md px-2.5 py-1.5 font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#38BDF8]"
                >
                  Buku 5 Master Komoditas ↗
                </a>
                <a
                  href="./assets/aistudio/Buku_6_Pedoman_Pemeriksaan_PML_SPDT_NTP_2026_87f14b4f.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md px-2.5 py-1.5 font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#38BDF8]"
                >
                  Buku 6 Pedoman PML ↗
                </a>
                <a
                  href="./assets/aistudio/kode_petugas__1__79773466.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md px-2.5 py-1.5 font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#003D7A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#38BDF8]"
                >
                  Daftar Kode Petugas ↗
                </a>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Workspace */}
        <main className="min-w-0 flex-1 px-4 pb-8 sm:px-8">
          {activeTab === 'COMMODITIES' && (
            <CommodityTab
              commodities={commodities}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onCopyCode={handleCopyCode}
              isAdmin={isAdmin}
              onOpenAddCommodity={() => {
                setEditingCommodity(null);
                setAdminModalMode('COMMODITY_FORM');
                setAdminModalOpen(true);
              }}
              onOpenEditCommodity={(item) => {
                setEditingCommodity(item);
                setAdminModalMode('COMMODITY_FORM');
                setAdminModalOpen(true);
              }}
              onDeleteCommodity={handleDeleteCommodity}
              selectedSector={selectedSector}
              onSelectSector={setSelectedSector}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}

          {activeTab === 'OFFICERS' && (
            <OfficerTab
              officers={officers}
              onCopyCode={handleCopyCode}
              isAdmin={isAdmin}
              onOpenAddOfficer={() => {
                setEditingOfficer(null);
                setAdminModalMode('OFFICER_FORM');
                setAdminModalOpen(true);
              }}
              onOpenEditOfficer={(item) => {
                setEditingOfficer(item);
                setAdminModalMode('OFFICER_FORM');
                setAdminModalOpen(true);
              }}
              onDeleteOfficer={handleDeleteOfficer}
              onImportOfficersCsv={handleImportOfficersCsv}
            />
          )}

          {activeTab === 'ASSISTANT' && (
            <LocalAssistantTab
              commodities={commodities}
              officers={officers}
              onCopyCode={handleCopyCode}
            />
          )}

          {activeTab === 'PML_TOOLS' && (
            <PmlAssistantTab
              checkedRuleIds={checkedRuleIds}
              onToggleRule={handleToggleRule}
              onResetChecklist={handleResetChecklist}
              onCopyText={handleCopyCode}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed right-0 bottom-0 left-0 z-30 flex border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xs md:hidden dark:border-[#1E293B] dark:bg-[#111827]/95"
        aria-label="Navigasi Mobile"
      >
        {navItems.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-[52px] flex-1 flex-col items-center justify-center px-1 text-[11px] font-semibold whitespace-nowrap transition ${
                active
                  ? 'text-[#003D7A] dark:text-[#38BDF8]'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              <span>{tab.label}</span>
              {active && (
                <span className="mt-1 h-0.5 w-6 bg-[#003D7A] dark:bg-[#38BDF8]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setAdminUnlocked(true);
          sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
          showToast('Mode Pengelola Aktif');
        }}
        onLogout={() => {
          setIsAdmin(false);
          setAdminUnlocked(false);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
          showToast('Keluar dari Mode Pengelola');
        }}
        initialMode={adminModalMode}
        editingCommodity={editingCommodity}
        editingOfficer={editingOfficer}
        onSaveCommodity={handleSaveCommodity}
        onSaveOfficer={handleSaveOfficer}
        onExportDatabase={handleExportDatabase}
        onImportDatabase={handleImportDatabase}
        onResetDatabase={handleResetDatabase}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-5 bottom-16 z-50 rounded-md border border-[#1E293B] bg-[#0F172A] px-3.5 py-2 text-xs font-semibold text-white shadow-lg md:bottom-6 dark:border-[#334155] dark:bg-[#1E293B]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
