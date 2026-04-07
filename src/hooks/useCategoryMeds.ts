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
      // Requêtes indexées par préfixe ATC — évite le full scan des 15k médicaments
      const results = await Promise.all(
        category!.atcPrefixes.map((prefix) =>
          db.medications.where("codeATC").startsWith(prefix).toArray(),
        ),
      );
      const filtered = results.flat();
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
    // Placeholder — useCategoryCounts n'est plus utilisé (counts dans CategoryGrid)
  }, []);

  return counts;
}
