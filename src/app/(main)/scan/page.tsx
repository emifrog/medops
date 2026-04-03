"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCIPLookup } from "@/hooks/useCIPLookup";
import { CameraScanner } from "@/components/scanner/CameraScanner";
import { PhotoScanner } from "@/components/scanner/PhotoScanner";
import { ManualCIPInput } from "@/components/scanner/ManualCIPInput";
import { ScanHistory } from "@/components/scanner/ScanHistory";
import {
  CheckCircleIcon,
  ViewfinderCircleIcon,
  CameraIcon,
} from "@heroicons/react/24/solid";

type ScanMode = "barcode" | "photo";
type ScanPhase = "scanning" | "found" | "not-found";

export default function ScanPage() {
  const router = useRouter();
  const { lookup, loading, error, medication } = useCIPLookup();
  const [mode, setMode] = useState<ScanMode>("photo");
  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [lastCIP, setLastCIP] = useState("");

  const handleBarcodeScan = useCallback(
    async (cip13: string) => {
      setLastCIP(cip13);
      const med = await lookup(cip13);
      if (med) {
        setPhase("found");
      } else {
        setPhase("not-found");
      }
    },
    [lookup],
  );

  const handleReset = () => {
    setPhase("scanning");
    setLastCIP("");
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      {/* Toggle mode */}
      <div className="flex gap-1.5 p-1 bg-slate-800/50 rounded-xl">
        <button
          onClick={() => {
            setMode("photo");
            handleReset();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === "photo"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <CameraIcon className="w-4 h-4" />
          Photo
        </button>
        <button
          onClick={() => {
            setMode("barcode");
            handleReset();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === "barcode"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <ViewfinderCircleIcon className="w-4 h-4" />
          Code-barres
        </button>
      </div>

      {/* Mode Photo OCR */}
      {mode === "photo" && <PhotoScanner />}

      {/* Mode Code-barres */}
      {mode === "barcode" && (
        <>
          {phase === "scanning" && (
            <CameraScanner
              onScan={handleBarcodeScan}
              active={phase === "scanning" && mode === "barcode"}
            />
          )}

          {phase === "found" && medication && (
            <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-green-500/30">
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-green-400 font-bold text-lg mb-1">
                  Medicament identifie
                </p>
                <p className="text-white font-black text-xl">
                  {medication.name}
                </p>
                <p className="text-slate-400 text-sm mt-0.5">
                  {medication.dci}
                  {medication.dosage ? ` · ${medication.dosage}` : ""}
                </p>
                <p className="text-slate-600 text-xs font-mono mt-2">
                  CIP13 : {lastCIP}
                </p>
                <div className="mt-5 space-y-2">
                  <button
                    onClick={() =>
                      router.push(`/med/${medication.codeCIS}`)
                    }
                    className="w-full px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-base transition-all active:scale-95 shadow-lg shadow-amber-900/40"
                  >
                    Voir la fiche complete
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Scanner un autre medicament
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === "not-found" && (
            <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-red-500/30">
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                  <span className="text-3xl">❓</span>
                </div>
                <p className="text-red-400 font-bold text-lg mb-1">
                  Medicament non trouve
                </p>
                <p className="text-slate-400 text-sm">
                  Le code CIP13{" "}
                  <span className="font-mono">{lastCIP}</span>{" "}
                  n&apos;est pas dans la base
                </p>
                {error && (
                  <p className="text-red-400/70 text-xs mt-2">{error}</p>
                )}
                <div className="mt-5 space-y-2">
                  <button
                    onClick={() => router.push("/")}
                    className="w-full px-8 py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-base transition-all active:scale-95"
                  >
                    Rechercher par nom
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Reessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saisie manuelle CIP13 */}
          <ManualCIPInput
            onSubmit={handleBarcodeScan}
            loading={loading}
            error={phase === "not-found" ? null : error}
          />
        </>
      )}

      {/* Historique des scans */}
      <ScanHistory />
    </div>
  );
}
