"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useSearch } from "@/hooks/useSearch";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useCategoryMeds } from "@/hooks/useCategoryMeds";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { MedListItem } from "@/components/medication/MedListItem";
import { CATEGORIES, type Category } from "@/lib/utils/categories";
import { CategoryGrid } from "@/components/search/CategoryGrid";
import { useSurdosageMap } from "@/hooks/useSurdosageMap";
import { MedListItemSkeleton } from "@/components/ui/Skeleton";

const ITEM_HEIGHT = 62; // hauteur estimée MedListItem en px
const ITEM_GAP = 6; // space-y-1.5 = 6px

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const results = useSearch(query);
  const { recentMeds } = useHistory(10);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { meds: categoryMeds, loading: categoryLoading } =
    useCategoryMeds(activeCategory);
  const { map: surdosageMap } = useSurdosageMap();

  const isSearching = query.length >= 2;
  const isBrowsingCategory = activeCategory !== null;

  // Offset du container de liste pour le virtualizer fenêtre
  const listRef = useRef<HTMLDivElement>(null);
  const [listOffset, setListOffset] = useState(0);

  useLayoutEffect(() => {
    if (listRef.current && isBrowsingCategory && !categoryLoading) {
      setListOffset(listRef.current.offsetTop);
    }
  }, [isBrowsingCategory, categoryLoading]);

  const virtualizer = useWindowVirtualizer({
    count: categoryMeds.length,
    estimateSize: () => ITEM_HEIGHT + ITEM_GAP,
    scrollMargin: listOffset,
    overscan: 5,
  });

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
              {categoryLoading ? (
                <span className="animate-pulse">Chargement…</span>
              ) : (
                <>
                  {categoryMeds.length} résultat
                  {categoryMeds.length !== 1 && "s"} dans{" "}
                  <span className="text-amber-500">{activeCategory.label}</span>
                </>
              )}
            </p>
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs text-amber-500 hover:text-amber-400 transition-colors duration-150"
            >
              Retour
            </button>
          </div>

          {categoryLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <MedListItemSkeleton key={i} />
              ))}
            </div>
          ) : categoryMeds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                Aucun médicament dans cette catégorie
              </p>
            </div>
          ) : (
            // Liste virtualisée — seuls les items visibles sont dans le DOM
            <div
              ref={listRef}
              style={{ height: virtualizer.getTotalSize(), position: "relative" }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const m = categoryMeds[virtualItem.index];
                if (!m) return null;
                const info = surdosageMap.get(m.dci?.toUpperCase() ?? "");
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${
                        virtualItem.start - virtualizer.options.scrollMargin
                      }px)`,
                      paddingBottom: ITEM_GAP,
                    }}
                  >
                    <MedListItem
                      medication={m}
                      onClick={() => router.push(`/med/${m.codeCIS}`)}
                      isFavorite={isFavorite(m.codeCIS)}
                      onToggleFavorite={() => toggleFavorite(m.codeCIS)}
                      gravite={info?.gravite}
                      indication={info?.indication}
                    />
                  </div>
                );
              })}
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
              <p className="text-[10px] md:text-xs text-slate-600 uppercase tracking-[0.2em] font-bold mb-2.5 px-0.5">
                Consultés récemment
              </p>
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {recentMeds.map((m) => (
                  <button
                    key={m.codeCIS}
                    onClick={() => router.push(`/med/${m.codeCIS}`)}
                    className="shrink-0 w-28 md:w-36 lg:w-40 p-3 md:p-4 bg-slate-800/40 border-2 border-slate-700/25 rounded-xl hover:border-slate-600/50 transition-all duration-150 active:scale-95 text-center min-h-12"
                  >
                    <p className="text-xs md:text-sm font-bold text-slate-300 truncate">
                      {m.name}
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-600 mt-0.5">
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
