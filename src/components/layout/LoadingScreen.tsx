"use client";

import type { LoadingState } from "@/lib/db/loader";

interface LoadingScreenProps {
  state: LoadingState;
  onRetry?: () => void;
}

export function LoadingScreen({ state, onRetry }: LoadingScreenProps) {
  if (state.status === "idle" || state.status === "checking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white px-8" role="status">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-900/30 mb-6">
          <span className="text-2xl font-black">M</span>
        </div>
        <h1 className="text-xl font-black mb-2">
          MED<span className="text-amber-500">OPS</span>
        </h1>
        <p className="text-slate-500 text-sm animate-pulse">
          {state.status === "checking"
            ? "Vérification de la base..."
            : "Initialisation..."}
        </p>
      </div>
    );
  }

  if (state.status === "downloading") {
    const percent =
      state.total > 0 ? Math.round((state.progress / state.total) * 100) : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white px-8" role="status" aria-live="polite">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-900/30 mb-6">
          <span className="text-2xl font-black">M</span>
        </div>
        <h1 className="text-xl font-black mb-6">
          MED<span className="text-amber-500">OPS</span>
        </h1>
        <div className="w-full max-w-xs space-y-3">
          <p className="text-sm text-slate-400 text-center">{state.label}</p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-slate-600 text-center">
            {state.progress.toLocaleString("fr-FR")} /{" "}
            {state.total.toLocaleString("fr-FR")} — {percent}%
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white px-8" role="alert">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mb-6">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-red-400 mb-2">Erreur</h2>
        <p className="text-sm text-slate-400 text-center mb-6 max-w-xs">
          {state.message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return null;
}
