"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { formatCIP13 } from "@/lib/utils/cip13";
import { ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScanHistoryEntry } from "@/lib/db/schema";

export function ScanHistory() {
  const router = useRouter();
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    db.scanHistory
      .orderBy("date")
      .reverse()
      .limit(20)
      .toArray()
      .then(setEntries);
  }, []);

  const clearHistory = async () => {
    await db.scanHistory.clear();
    setEntries([]);
  };

  if (entries.length === 0) return null;

  return (
    <section className="space-y-2" aria-label="Historique des scans">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5 text-slate-600" />
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
            Derniers scans
          </p>
        </div>
        <button
          onClick={clearHistory}
          aria-label="Effacer l'historique des scans"
          className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors duration-150"
        >
          <TrashIcon className="w-3 h-3" />
          Effacer
        </button>
      </div>
      <div className="space-y-1" role="list">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => router.push(`/med/${entry.codeCIS}`)}
            role="listitem"
            className="w-full flex items-center justify-between p-2.5 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl hover:bg-slate-800/60 hover:border-slate-700/40 transition-all duration-150 active:scale-[0.99] text-left focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {entry.medName}
              </p>
              <p className="text-[10px] text-slate-600 font-mono">
                {formatCIP13(entry.cip13)}
              </p>
            </div>
            <p className="text-[10px] text-slate-700">
              {formatRelativeDate(entry.date)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}
