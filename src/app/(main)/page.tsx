"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useCategoryMeds } from "@/hooks/useCategoryMeds";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { MedListItem } from "@/components/medication/MedListItem";
import { CATEGORIES, type Category } from "@/lib/utils/categories";
import { CategoryGrid } from "@/components/search/CategoryGrid";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const results = useSearch(query);
  const { recentMeds } = useHistory(10);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { meds: categoryMeds, loading: categoryLoading } =
    useCategoryMeds(activeCategory);

  const isSearching = query.length >= 2;
  const isBrowsingCategory = activeCategory !== null;

  const handleClearAll = () => {
    setQuery("");
    setActiveCategory(null);
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <SearchBar
        query={query}
        onQueryChange={(q) => {
          setQuery(q);
          if (q.length > 0) setActiveCategory(null);
        }}
        onClear={handleClearAll}
        showClear={isSearching || isBrowsingCategory}
      />

      {/* Résultats de recherche */}
      {isSearching && <SearchResults results={results} query={query} />}

      {/* Navigation par catégorie */}
      {isBrowsingCategory && !isSearching && (
        <div className="space-y-2 animate-[fadeIn_0.25s_ease-out]">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-500">
              {categoryMeds.length} resultat
              {categoryMeds.length !== 1 && "s"} dans{" "}
              <span className="text-amber-500">{activeCategory.label}</span>
            </p>
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs text-amber-500 hover:text-amber-400 transition-colors duration-150"
            >
              Tout voir
            </button>
          </div>
          {categoryLoading ? (
            <p className="text-center text-slate-500 py-8 animate-pulse">
              Chargement...
            </p>
          ) : categoryMeds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                Aucun médicament dans cette catégorie
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {categoryMeds.map((m) => (
                <MedListItem
                  key={m.codeCIS}
                  medication={m}
                  onClick={() => router.push(`/med/${m.codeCIS}`)}
                  isFavorite={isFavorite(m.codeCIS)}
                  onToggleFavorite={() => toggleFavorite(m.codeCIS)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page d'accueil (ni recherche ni catégorie) */}
      {!isSearching && !isBrowsingCategory && (
        <div className="space-y-5 animate-[fadeIn_0.25s_ease-out]">
          {/* Catégories thérapeutiques */}
          <CategoryGrid
            categories={CATEGORIES}
            onSelect={setActiveCategory}
          />

          {/* Consultés récemment */}
          {recentMeds.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-2.5 px-0.5">
                Consultés récemment
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {recentMeds.map((m) => (
                  <button
                    key={m.codeCIS}
                    onClick={() => router.push(`/med/${m.codeCIS}`)}
                    className="flex-shrink-0 w-28 p-3 bg-slate-800/40 border-2 border-slate-700/25 rounded-xl hover:border-slate-600/50 transition-all active:scale-95 text-center"
                  >
                    <p className="text-xs font-bold text-slate-300 truncate">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {m.dosage || m.dci}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
