"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db";
import type { Medication } from "@/types/medication";
import type { Interaction, DetectedInteraction } from "@/types/interaction";

export function useInteractions(selectedMeds: Medication[]) {
  const [allInteractions, setAllInteractions] = useState<Interaction[]>([]);

  // Charger toutes les interactions depuis IndexedDB
  useEffect(() => {
    db.interactions.toArray().then(setAllInteractions);
  }, []);

  // Détecter les interactions entre les médicaments sélectionnés
  const detected = useMemo((): DetectedInteraction[] => {
    if (selectedMeds.length < 2 || allInteractions.length === 0) return [];

    const results: DetectedInteraction[] = [];

    for (let i = 0; i < selectedMeds.length; i++) {
      for (let j = i + 1; j < selectedMeds.length; j++) {
        const medA = selectedMeds[i]!;
        const medB = selectedMeds[j]!;
        const dciA = medA.dci.toUpperCase();
        const dciB = medB.dci.toUpperCase();

        // Chercher les interactions dans les deux sens
        for (const inter of allInteractions) {
          const s1 = inter.substance1.toUpperCase();
          const s2 = inter.substance2.toUpperCase();

          const match =
            (dciA.includes(s1) && dciB.includes(s2)) ||
            (dciA.includes(s2) && dciB.includes(s1));

          if (match) {
            results.push({
              ...inter,
              medA: { name: medA.name, codeCIS: medA.codeCIS },
              medB: { name: medB.name, codeCIS: medB.codeCIS },
            });
          }
        }
      }
    }

    // Trier par gravité
    const order = {
      "contre-indiquee": 0,
      deconseillee: 1,
      precaution: 2,
      "a-prendre-en-compte": 3,
    };
    results.sort(
      (a, b) => (order[a.level] ?? 4) - (order[b.level] ?? 4),
    );

    return results;
  }, [selectedMeds, allInteractions]);

  return { detected, totalInteractionsInDB: allInteractions.length };
}
