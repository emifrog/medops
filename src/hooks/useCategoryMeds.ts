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

    setLoading(true);

    async function load() {
      // Chercher les médicaments dont le code ATC commence par un des préfixes
      const allMeds = await db.medications.toArray();
      const filtered = allMeds.filter((m) =>
        category!.atcPrefixes.some((prefix) => m.codeATC.startsWith(prefix)),
      );
      // Trier par nom
      filtered.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      setMeds(filtered);
      setLoading(false);
    }

    load();
  }, [category]);

  return { meds, loading };
}

export function useCategoryCounts() {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    async function load() {
      const allMeds = await db.medications.toArray();
      const map = new Map<string, number>();

      for (const med of allMeds) {
        if (!med.codeATC) continue;
        // Compter par préfixe ATC
        const prefix2 = med.codeATC.slice(0, 1);
        const prefix3 = med.codeATC.slice(0, 3);
        // On stocke les deux niveaux
        map.set(prefix2, (map.get(prefix2) ?? 0) + 1);
        map.set(prefix3, (map.get(prefix3) ?? 0) + 1);
      }

      setCounts(map);
    }

    load();
  }, []);

  return counts;
}
