import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  totalCommodities: number;
  totalOfficers: number;
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  totalCommodities,
  totalOfficers,
  onComplete,
}) => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(28);

  const phases = [
    `Memuat ${totalCommodities.toLocaleString('id-ID')} kode komoditas Buku 5`,
    `Menyiapkan ${totalOfficers} kode petugas lapangan`,
    'Menyiapkan asisten pemeriksaan Buku 6',
  ];

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase(1);
      setProgress(72);
    }, 260);
    const t2 = setTimeout(() => {
      setPhase(2);
      setProgress(98);
    }, 520);
    const t3 = setTimeout(() => {
      setProgress(100);
      onComplete();
    }, 740);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] px-6 dark:bg-[#0B0F19]">
      <div className="w-full max-w-md">
        {/* Custom SPDT Balance Scale / Neraca Emblem */}
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#002D5A] bg-[#003D7A] text-white shadow-2xs dark:border-[#1E3A8A] dark:bg-[#0F2952]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {/* Central Pillar & Base */}
              <path
                d="M12 3V20M8 20H16"
                stroke="#F8FAFC"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              {/* Balance Beam */}
              <path
                d="M4.5 7H19.5"
                stroke="#38BDF8"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              {/* Left Scale Pan */}
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
              {/* Right Scale Pan */}
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
              {/* Top Fulcrum */}
              <circle cx="12" cy="7" r="1.6" fill="#F8FAFC" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase dark:text-[#94A3B8]">
              Direktori Referensi Lapangan
            </p>
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              SPDT NTP 2026
            </h1>
          </div>
        </div>

        {/* Clean Progress Line */}
        <div className="h-1 w-full overflow-hidden rounded-none bg-[#E2E8F0] dark:bg-[#1E293B]">
          <div
            className="h-full bg-[#003D7A] transition-all duration-200 ease-out dark:bg-[#38BDF8]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
          <span>{phases[phase]}</span>
          <span className="tabular-code font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};
