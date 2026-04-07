"use client";

import { useOfflineStatus } from "@/hooks/useOfflineStatus";

interface HeaderProps {
  dbVersion?: string;
  dbCount?: number;
}

export function Header({ dbVersion, dbCount }: HeaderProps) {
  const isOnline = useOfflineStatus();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b-2 border-slate-800/60">
      <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-linear-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
            <span className="text-sm md:text-base font-black text-white">M</span>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black tracking-tight leading-none">
              MED<span className="text-amber-500">OPS</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-600 tracking-[0.15em] uppercase">
              Sapeurs-Pompiers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {dbCount !== undefined && (
            <span className="text-[10px] md:text-xs text-slate-600 font-medium hidden min-[380px]:inline">
              {dbCount.toLocaleString("fr-FR")} méd.{" "}
              {dbVersion && `· v${dbVersion}`}
            </span>
          )}
          <div className="flex items-center gap-1.5" role="status" aria-live="polite">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isOnline
                  ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
                  : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
              }`}
            />
            <span className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {isOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
