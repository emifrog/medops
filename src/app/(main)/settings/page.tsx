"use client";

import { useDatabase } from "@/hooks/useDatabase";

export default function SettingsPage() {
  const { state } = useDatabase();
  const version = state.status === "ready" ? state.version : "—";
  const count = state.status === "ready" ? state.count : 0;

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div>
        <h2 className="text-lg font-black text-white">Réglages</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configuration de l&apos;application
        </p>
      </div>

      {/* Base de données */}
      <section className="space-y-2" aria-label="Base de données">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
          Base de données
        </p>
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Source</span>
            <span className="text-slate-200 font-medium">ANSM Open Data</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Version</span>
            <span className="text-slate-200 font-medium">{version}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Spécialités</span>
            <span className="text-slate-200 font-medium">
              {count.toLocaleString("fr-FR")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Stockage</span>
            <span className="text-slate-200 font-medium">IndexedDB (local)</span>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="space-y-2" aria-label="À propos">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
          À propos
        </p>
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl text-center space-y-1">
          <p className="font-black text-base">
            MED<span className="text-amber-500">OPS</span>{" "}
            <span className="text-xs text-slate-600 font-normal">v{process.env.npm_package_version ?? "0.1.0"}</span>
          </p>
          <p className="text-xs text-slate-500">
            Aide à l&apos;identification médicamenteuse
          </p>
          <p className="text-xs text-slate-500">pour les Sapeurs-Pompiers</p>
          <p className="text-[10px] text-slate-700 mt-2">
            Orionis Solutions SAS — 2026
          </p>
        </div>
      </section>

      {/* Avertissement */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-600 leading-relaxed" role="note">
        <strong className="text-slate-500">⚕️ Avertissement :</strong>{" "}
        Informations à titre d&apos;aide opérationnelle. Ne se substituent pas à
        l&apos;avis du médecin régulateur (CRRA 15) ni aux protocoles
        départementaux.
      </div>
    </div>
  );
}
