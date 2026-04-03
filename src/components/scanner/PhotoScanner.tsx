"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOCR } from "@/hooks/useOCR";
import { CameraIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { MedListItem } from "@/components/medication/MedListItem";

export function PhotoScanner() {
  const router = useRouter();
  const { status, progress, result, error, processImage, reset } = useOCR();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    processImage(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    reset();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Zone de capture / preview */}
      {!preview ? (
        <button
          onClick={handleCapture}
          aria-label="Prendre une photo de la boîte de médicament"
          className="w-full aspect-4/3 bg-slate-800/40 border-2 border-dashed border-slate-700/50 hover:border-amber-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
            <CameraIcon className="w-8 h-8 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">
              Photographier la boîte
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Le texte sera lu automatiquement
            </p>
          </div>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Photo de la boîte"
            className="w-full aspect-4/3 object-cover"
          />

          {/* Overlay OCR */}
          {(status === "loading-engine" ||
            status === "recognizing" ||
            status === "extracting") && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
              <div className="w-12 h-12 rounded-full border-[3px] border-slate-700 border-t-amber-500 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                {status === "loading-engine"
                  ? "Chargement du moteur OCR..."
                  : status === "recognizing"
                    ? `Lecture en cours... ${progress}%`
                    : "Recherche dans la base..."}
              </p>
              {status === "recognizing" && (
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            aria-label="Reprendre la photo"
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Erreur */}
      {status === "error" && (
        <div className="p-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl" role="alert">
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-xs text-amber-500 hover:text-amber-400 transition-colors duration-150"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Résultats OCR */}
      {status === "done" && result && (
        <div className="space-y-3 animate-[fadeIn_0.25s_ease-out]">
          <div className="p-3 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-1">
              Texte détecté
            </p>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
              {result.rawText.trim() || "Aucun texte détecté"}
            </p>
          </div>

          {result.candidates.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
                {result.candidates.length} médicament
                {result.candidates.length > 1 ? "s" : ""} identifié
                {result.candidates.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-1.5" role="list" aria-label="Médicaments identifiés">
                {result.candidates.map((r) => (
                  <MedListItem
                    key={r.codeCIS}
                    medication={{
                      codeCIS: r.codeCIS,
                      name: r.name,
                      dci: r.dci,
                      dosage: r.dosage,
                      forme: r.forme,
                    }}
                    onClick={() => router.push(`/med/${r.codeCIS}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">
                Aucun médicament identifié dans la photo
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Essayez de cadrer plus près du nom du médicament
              </p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-2.5 text-sm text-slate-500 hover:text-amber-400 transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <CameraIcon className="w-4 h-4" />
            Prendre une autre photo
          </button>
        </div>
      )}
    </div>
  );
}
