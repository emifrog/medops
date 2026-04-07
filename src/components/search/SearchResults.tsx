"use client";

import { useRouter } from "next/navigation";
import { MedListItem } from "@/components/medication/MedListItem";
import { useFavorites } from "@/hooks/useFavorites";
import { useSurdosageMap } from "@/hooks/useSurdosageMap";
import type { SearchResult } from "@/lib/search/engine";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { map: surdosageMap } = useSurdosageMap();

  if (query.length < 2) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-slate-400 font-medium">
          Recherchez un médicament
        </p>
        <p className="text-slate-600 text-sm mt-1">
          Par nom commercial, DCI ou code ATC
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-2">🔍</p>
        <p className="text-slate-400 font-medium">Aucun résultat</p>
        <p className="text-slate-600 text-sm mt-1">
          Essayez avec le nom DCI ou le code ATC
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-[fadeIn_0.25s_ease-out]" role="list" aria-label="Résultats de recherche">
      <p className="text-xs text-slate-500 px-1">
        {results.length} résultat{results.length !== 1 && "s"}
      </p>
      <div className="space-y-1.5">
        {results.map((r, i) => {
          const info = surdosageMap.get(r.dci?.toUpperCase() ?? "");
          return (
            <MedListItem
              key={r.codeCIS}
              index={i}
              medication={{
                codeCIS: r.codeCIS,
                name: r.name,
                dci: r.dci,
                dosage: r.dosage,
                forme: r.forme,
              }}
              onClick={() => router.push(`/med/${r.codeCIS}`)}
              isFavorite={isFavorite(r.codeCIS)}
              onToggleFavorite={() => toggleFavorite(r.codeCIS)}
              gravite={info?.gravite}
              indication={info?.indication}
            />
          );
        })}
      </div>
    </div>
  );
}
