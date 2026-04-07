"use client";

import { ChevronRightIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/Badge";
import type { Gravite } from "@/types/surdosage";

interface MedListItemProps {
  medication: {
    codeCIS: string;
    name: string;
    dci: string;
    dosage: string;
    forme: string;
  };
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  gravite?: Gravite | null;
  indication?: string;
}

const GRAVITE_BADGE: Record<string, { label: string; color: string }> = {
  vitale: { label: "⚠️ Létal", color: "#EF4444" },
  elevee: { label: "⚠️ Élevé", color: "#F97316" },
  moderee: { label: "Modéré", color: "#F59E0B" },
};

export function MedListItem({
  medication,
  onClick,
  isFavorite,
  onToggleFavorite,
  gravite,
  indication,
}: MedListItemProps) {
  const badge = gravite ? GRAVITE_BADGE[gravite] : undefined;

  return (
    <button
      onClick={onClick}
      role="listitem"
      className="w-full text-left p-3.5 md:p-4 bg-slate-800/40 hover:bg-slate-800/80 border-2 border-slate-700/30 hover:border-amber-500/30 rounded-xl transition-all duration-150 active:scale-[0.98] group focus-visible:outline-2 focus-visible:outline-amber-500 min-h-14"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white text-sm md:text-base group-hover:text-amber-400 transition-colors duration-150">
              {medication.name}
            </span>
            {medication.dosage && (
              <Badge color="#6B7280" small>
                {medication.dosage}
              </Badge>
            )}
            {badge && (
              <Badge color={badge.color} small>
                {badge.label}
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 truncate">
            {indication || (
              <>
                {medication.dci}
                {medication.forme ? ` · ${medication.forme}` : ""}
              </>
            )}
          </p>
        </div>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={isFavorite}
            className={`p-2.5 rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-amber-500 min-w-11 min-h-11 flex items-center justify-center ${
              isFavorite
                ? "text-amber-400"
                : "text-slate-700 hover:text-slate-500"
            }`}
          >
            {isFavorite ? (
              <StarSolid className="w-5 h-5" />
            ) : (
              <StarIcon className="w-5 h-5" />
            )}
          </button>
        )}
        <ChevronRightIcon className="w-4 h-4 text-slate-700 group-hover:text-amber-500/60 transition-colors duration-150 shrink-0" />
      </div>
    </button>
  );
}
