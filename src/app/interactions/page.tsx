"use client";

import { useState, useCallback } from "react";
import { useInteractions } from "@/hooks/useInteractions";
import { useSearch } from "@/hooks/useSearch";
import { useFavorites } from "@/hooks/useFavorites";
import { MedListItem } from "@/components/medication/MedListItem";
import { SearchBar } from "@/components/search/SearchBar";
import { INTERACTION_LEVELS } from "@/types/interaction";
import { copyToClipboard } from "@/lib/utils/formatters";
import type { Medication } from "@/types/medication";
import {
  PlusIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function InteractionsPage() {
  const [selectedMeds, setSelectedMeds] = useState<Medication[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const { isFavorite } = useFavorites();

  const pickerResults = useSearch(pickerQuery);
  const { detected, totalInteractionsInDB } = useInteractions(selectedMeds);

  const addMed = useCallback(
    (med: Medication) => {
      if (
        !selectedMeds.find((m) => m.codeCIS === med.codeCIS) &&
        selectedMeds.length < 10
      ) {
        setSelectedMeds((prev) => [...prev, med]);
      }
      setShowPicker(false);
      setPickerQuery("");
    },
    [selectedMeds],
  );

  const removeMed = (codeCIS: string) => {
    setSelectedMeds((prev) => prev.filter((m) => m.codeCIS !== codeCIS));
  };

  const handleCopyBilan = async () => {
    if (detected.length === 0) return;
    const now = new Date();
    const lines = [
      `INTERACTIONS DÉTECTÉES — ${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      `Médicaments : ${selectedMeds.map((m) => m.name).join(", ")}`,
      "",
    ];
    for (const inter of detected) {
      const lvl = INTERACTION_LEVELS[inter.level];
      const icon =
        inter.level === "contre-indiquee"
          ? "⛔"
          : inter.level === "deconseillee"
            ? "⚠️"
            : inter.level === "precaution"
              ? "🔵"
              : "ℹ️";
      lines.push(
        `${icon} ${lvl.label.toUpperCase()} : ${inter.medA.name} + ${inter.medB.name}`,
      );
      lines.push(`   ${inter.description}`);
      lines.push("");
    }
    const ok = await copyToClipboard(lines.join("\n"));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div>
        <h2 className="text-lg font-black text-white">
          Vérificateur d&apos;interactions
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajoutez les médicaments trouvés chez la victime
          {totalInteractionsInDB > 0 && (
            <span className="text-slate-700">
              {" "}
              · {totalInteractionsInDB} interactions en base
            </span>
          )}
        </p>
      </div>

      {/* Médicaments sélectionnés */}
      <div className="flex flex-wrap gap-2">
        {selectedMeds.map((m) => (
          <div
            key={m.codeCIS}
            className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-slate-800/60 border-2 border-slate-700/40 rounded-xl"
          >
            <span className="text-sm font-semibold text-slate-200">
              {m.name}
            </span>
            <span className="text-[10px] text-slate-500">{m.dci}</span>
            <button
              onClick={() => removeMed(m.codeCIS)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        {selectedMeds.length < 10 && (
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border-2 border-dashed border-slate-700 hover:border-amber-500/40 rounded-xl text-slate-500 hover:text-amber-400 transition-all active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Ajouter</span>
          </button>
        )}
      </div>

      {/* Résultats des interactions */}
      {selectedMeds.length >= 2 && (
        <div className="space-y-2 animate-[fadeIn_0.25s_ease-out]">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
              {detected.length} interaction
              {detected.length !== 1 && "s"} détectée
              {detected.length !== 1 && "s"}
            </p>
            {detected.length > 0 && (
              <button
                onClick={handleCopyBilan}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 transition-colors"
              >
                {copied ? (
                  <CheckIcon className="w-3 h-3 text-green-400" />
                ) : (
                  <ClipboardDocumentIcon className="w-3 h-3" />
                )}
                {copied ? "Copie !" : "Copier le bilan"}
              </button>
            )}
          </div>

          {detected.length > 0 ? (
            detected.map((inter, i) => {
              const lvl = INTERACTION_LEVELS[inter.level];
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border-2"
                  style={{
                    backgroundColor: lvl.color + "15",
                    borderColor: lvl.color + "40",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lvl.color }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: lvl.color }}
                    >
                      {lvl.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 font-semibold mb-1">
                    {inter.medA.name} + {inter.medB.name}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {inter.description}
                  </p>
                  {inter.cat && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed border-t border-slate-700/30 pt-2">
                      <span className="font-semibold text-slate-400">
                        CAT :{" "}
                      </span>
                      {inter.cat}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl text-center">
              <p className="text-green-400 font-semibold text-sm">
                Aucune interaction connue détectée
              </p>
              <p className="text-green-400/60 text-xs mt-1">
                Vérifiez toujours auprès du CRRA 15
              </p>
            </div>
          )}
        </div>
      )}

      {/* État initial */}
      {selectedMeds.length < 2 && (
        <div className="text-center py-10 text-slate-600">
          <p className="text-3xl mb-2">⚡</p>
          <p className="text-sm">
            Ajoutez au moins 2 médicaments pour vérifier les interactions
          </p>
        </div>
      )}

      {/* Picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center md:justify-center animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full md:max-w-2xl max-h-[80vh] md:max-h-[85vh] bg-slate-900 border-t-2 md:border-2 border-slate-700 rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 pb-2">
              <p className="text-sm md:text-base font-bold text-slate-300">
                Sélectionner un médicament
              </p>
              <button
                onClick={() => {
                  setShowPicker(false);
                  setPickerQuery("");
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors duration-150"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-2">
              <SearchBar
                query={pickerQuery}
                onQueryChange={setPickerQuery}
                showClear={pickerQuery.length > 0}
              />
            </div>
            <div className="overflow-auto p-4 pt-2 space-y-1.5">
              {pickerQuery.length >= 2 ? (
                pickerResults.length > 0 ? (
                  pickerResults
                    .filter(
                      (r) =>
                        !selectedMeds.find(
                          (m) => m.codeCIS === r.codeCIS,
                        ),
                    )
                    .map((r) => (
                      <MedListItem
                        key={r.codeCIS}
                        medication={{
                          codeCIS: r.codeCIS,
                          name: r.name,
                          dci: r.dci,
                          dosage: r.dosage,
                          forme: r.forme,
                        }}
                        onClick={() =>
                          addMed({
                            codeCIS: r.codeCIS,
                            name: r.name,
                            dci: r.dci,
                            dosage: r.dosage,
                            forme: r.forme,
                            voie: "",
                            labo: r.labo,
                            statutAMM: "",
                            classe: r.classe,
                            codeATC: r.codeATC,
                            searchText: "",
                            conservation: "",
                            updatedAt: "",
                          })
                        }
                        isFavorite={isFavorite(r.codeCIS)}
                      />
                    ))
                ) : (
                  <p className="text-center text-slate-600 py-8 text-sm">
                    Aucun resultat
                  </p>
                )
              ) : (
                <p className="text-center text-slate-600 py-8 text-sm">
                  Tapez le nom du medicament...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
