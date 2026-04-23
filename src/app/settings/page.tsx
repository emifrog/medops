"use client";

import { useState } from "react";
import { useDatabase } from "@/hooks/DatabaseProvider";
import {
  useStorageEstimate,
  formatBytes,
} from "@/hooks/useStorageEstimate";
import { useToast } from "@/components/ui/Toast";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { state, reload } = useDatabase();
  const storage = useStorageEstimate();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const version = state.status === "ready" ? state.version : "—";
  const count = state.status === "ready" ? state.count : 0;

  async function handleForceSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      await reload();
      toast("Base synchronisée avec succès", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast(`Échec de la synchronisation : ${msg}`, "error");
    } finally {
      setSyncing(false);
    }
  }

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
            <span className="text-slate-200 font-medium">
              IndexedDB (local)
            </span>
          </div>
        </div>
      </section>

      {/* Stockage */}
      <section className="space-y-2" aria-label="Stockage">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
          Stockage local
        </p>
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl space-y-3">
          {storage.unsupported ? (
            <p className="text-xs text-slate-500">
              Estimation non supportée sur ce navigateur.
            </p>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Utilisé</span>
                <span className="text-slate-200 font-medium">
                  {formatBytes(storage.usage)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Quota navigateur</span>
                <span className="text-slate-200 font-medium">
                  {formatBytes(storage.quota)}
                </span>
              </div>
              {storage.percent !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Utilisation</span>
                    <span>{storage.percent}%</span>
                  </div>
                  <div
                    className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={storage.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${storage.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Actions admin */}
      <section className="space-y-2" aria-label="Administration">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
          Administration
        </p>
        <button
          onClick={handleForceSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 p-4 bg-slate-800/30 hover:bg-slate-800/60 border-2 border-slate-700/20 hover:border-amber-500/30 rounded-xl transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-200"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Synchronisation…" : "Forcer la synchronisation"}
        </button>
        <p className="text-[10px] text-slate-600 px-0.5 leading-relaxed">
          Recharge la base ANSM depuis Supabase. Utile si vous pensez que vos
          données sont obsolètes. Nécessite une connexion.
        </p>
      </section>

      {/* À propos */}
      <section className="space-y-2" aria-label="À propos">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
          À propos
        </p>
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl text-center space-y-1">
          <p className="font-black text-base">
            MED<span className="text-amber-500">OPS</span>{" "}
            <span className="text-xs text-slate-600 font-normal">
              v{process.env.npm_package_version ?? "0.1.0"}
            </span>
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
      <div
        className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-600 leading-relaxed"
        role="note"
      >
        <strong className="text-slate-500">⚕️ Avertissement :</strong>{" "}
        Informations à titre d&apos;aide opérationnelle. Ne se substituent pas
        à l&apos;avis du médecin régulateur (CRRA 15) ni aux protocoles
        départementaux.
      </div>
    </div>
  );
}
