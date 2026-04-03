"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { db } from "@/lib/db";
import { MedListItem } from "@/components/medication/MedListItem";
import type { Medication } from "@/types/medication";

export default function FavoritesPage() {
  const router = useRouter();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const [favMeds, setFavMeds] = useState<Medication[]>([]);

  useEffect(() => {
    if (favoriteIds.size === 0) {
      setFavMeds([]);
      return;
    }
    db.medications
      .where("codeCIS")
      .anyOf([...favoriteIds])
      .toArray()
      .then((meds) => {
        meds.sort((a, b) => a.name.localeCompare(b.name, "fr"));
        setFavMeds(meds);
      });
  }, [favoriteIds]);

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div>
        <h2 className="text-lg font-black text-white">Favoris</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Médicaments fréquemment rencontrés sur votre secteur
        </p>
      </div>
      {favMeds.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3" aria-hidden="true">⭐</p>
          <p className="text-slate-400 font-medium">Aucun favori</p>
          <p className="text-slate-600 text-sm mt-1">
            Ajoutez des médicaments depuis leur fiche détaillée
          </p>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
            {favMeds.length} favori{favMeds.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-1.5" role="list" aria-label="Médicaments favoris">
            {favMeds.map((m) => (
              <MedListItem
                key={m.codeCIS}
                medication={m}
                onClick={() => router.push(`/med/${m.codeCIS}`)}
                isFavorite={isFavorite(m.codeCIS)}
                onToggleFavorite={() => toggleFavorite(m.codeCIS)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
