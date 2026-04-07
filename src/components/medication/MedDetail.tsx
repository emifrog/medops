"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  StarIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/Badge";
import { InfoSection } from "@/components/ui/InfoSection";
import { formatBilanSAMU, copyToClipboard } from "@/lib/utils/formatters";
import { getCategoryForATC } from "@/lib/utils/categories";
import type { MedicationFull } from "@/types/medication";

interface MedDetailProps {
  medication: MedicationFull;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function MedDetail({
  medication: med,
  onBack,
  isFavorite,
  onToggleFavorite,
}: MedDetailProps) {
  const [copied, setCopied] = useState(false);
  const category = getCategoryForATC(med.codeATC);

  const handleCopy = async () => {
    const text = formatBilanSAMU(med);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="space-y-3 animate-[fadeIn_0.25s_ease-out]" aria-label={`Fiche ${med.name}`}>
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <button
          onClick={onBack}
          aria-label="Retour"
          className="mt-0.5 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-amber-500/40 text-slate-400 hover:text-white transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-white">{med.name}</h2>
            {med.dosage && <Badge color="#F59E0B">{med.dosage}</Badge>}
          </div>
          <p className="text-slate-400 text-sm">
            {[med.dci, med.forme, med.labo].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavorite}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500 ${
            isFavorite
              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
              : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-200"
          }`}
        >
          {isFavorite ? (
            <StarSolid className="w-5 h-5" />
          ) : (
            <StarIcon className="w-5 h-5" />
          )}
          <span>{isFavorite ? "Favori" : "Ajouter aux favoris"}</span>
        </button>
        <button
          onClick={handleCopy}
          aria-label="Copier le bilan SAMU"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
          <span>{copied ? "Copié !" : "Bilan"}</span>
        </button>
      </div>

      {/* Classification */}
      <div className="flex flex-wrap gap-1.5">
        {med.codeATC && (
          <Badge color="#6B7280" small>
            ATC : {med.codeATC}
          </Badge>
        )}
        {category && (
          <Badge color={category.color} small>
            {category.icon} {category.label}
          </Badge>
        )}
        {med.classe && (
          <Badge color="#F59E0B" small>
            {med.classe}
          </Badge>
        )}
        {med.statutAMM && (
          <Badge color="#10B981" small>
            {med.statutAMM}
          </Badge>
        )}
        {med.voie && (
          <Badge color="#8B5CF6" small>
            {med.voie}
          </Badge>
        )}
      </div>

      {/* Indication */}
      {med.surdosage?.indication && (
        <InfoSection
          icon="💊"
          title="Indication"
          content={med.surdosage.indication}
        />
      )}

      {/* Substances actives */}
      {med.substances.length > 0 && (
        <InfoSection
          icon="🧬"
          title="Composition"
          content={med.substances
            .filter((s) => s.nature === "SA")
            .map((s) => `${s.dci}${s.dosage ? ` — ${s.dosage}` : ""}`)
            .join("\n")}
        />
      )}

      {/* Surdosage / CAT */}
      {med.surdosage ? (
        <InfoSection
          icon="🚨"
          title="Surdosage — Conduite à tenir"
          content={[
            med.surdosage.doseToxique &&
              `Dose toxique : ${med.surdosage.doseToxique}`,
            med.surdosage.symptomes.length > 0 &&
              `Symptômes : ${med.surdosage.symptomes.join(", ")}`,
            med.surdosage.antidote && `ANTIDOTE : ${med.surdosage.antidote}`,
            ...med.surdosage.cat.map((c: string) => `→ ${c}`),
            med.surdosage.orientation &&
              `Orientation : ${med.surdosage.orientation}`,
          ]
            .filter(Boolean)
            .join("\n")}
          severity
        />
      ) : (
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl">
          <p className="text-xs text-slate-500 text-center">
            Données surdosage/CAT non disponibles — contactez le CRRA 15
          </p>
        </div>
      )}

      {/* Alertes ANSM */}
      {med.alerts.length > 0 && (
        <section aria-label="Alertes ANSM" className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="text-base" aria-hidden="true">⚠️</span>
            <h3 className="font-bold text-xs uppercase tracking-widest text-amber-400">
              {med.alerts.length} alerte{med.alerts.length > 1 ? "s" : ""} ANSM
            </h3>
          </div>
          {med.alerts.map((alert, i) => (
            <div
              key={alert.id ?? i}
              className="p-3 bg-amber-950/30 border-2 border-amber-500/20 rounded-xl"
            >
              <p className="text-sm text-slate-200 leading-relaxed">
                {alert.texte}
              </p>
              {alert.dateDebut && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Depuis le {alert.dateDebut}
                  {alert.dateFin ? ` — jusqu'au ${alert.dateFin}` : ""}
                </p>
              )}
              {alert.lien && (
                <a
                  href={alert.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-500 hover:text-amber-400 mt-1 block transition-colors duration-150"
                >
                  En savoir plus →
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Conservation */}
      {med.conservation && (
        <div className="flex items-center gap-2 text-[11px] text-slate-600 px-1">
          <span aria-hidden="true">📦</span> Conservation : {med.conservation}
        </div>
      )}

      {/* Forme et voie */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-600 px-1">
        {med.forme && <span><span aria-hidden="true">💊</span> Forme : {med.forme}</span>}
        {med.voie && <span><span aria-hidden="true">💉</span> Voie : {med.voie}</span>}
        {med.labo && <span><span aria-hidden="true">🏭</span> Labo : {med.labo}</span>}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-600 leading-relaxed" role="note">
        <strong className="text-slate-500">⚕️ Avertissement :</strong>{" "}
        Informations à titre d&apos;aide opérationnelle. Ne se substituent pas à
        l&apos;avis du médecin régulateur (CRRA 15) ni aux protocoles
        départementaux.
      </div>
    </article>
  );
}
