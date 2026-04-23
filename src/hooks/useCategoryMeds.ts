"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import type { Medication } from "@/types/medication";
import type { Category } from "@/lib/utils/categories";

export function useCategoryMeds(category: Category | null) {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) {
      setMeds([]);
      return;
    }

    // Pattern cancellation : si l'utilisateur change de catégorie avant la
    // fin de la requête, on ignore les résultats pour éviter de stale-write
    // le state avec des données obsolètes.
    let cancelled = false;
    setLoading(true);

    async function load() {
      // Requêtes indexées par préfixe ATC — évite le full scan des 15k médicaments
      const results = await Promise.all(
        category!.atcPrefixes.map((prefix) =>
          db.medications.where("codeATC").startsWith(prefix).toArray(),
        ),
      );
      if (cancelled) return;

      const filtered = results.flat();
      filtered.sort((a, b) => a.name.localeCompare(b.name, "fr"));

      if (cancelled) return;
      setMeds(filtered);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { meds, loading };
}
