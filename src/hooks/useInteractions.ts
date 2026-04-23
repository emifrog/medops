"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db";
import { splitDCI, matchSubstance, interactionKey } from "@/lib/utils/dci";
import type { Medication } from "@/types/medication";
import type { Interaction, DetectedInteraction } from "@/types/interaction";

export function useInteractions(selectedMeds: Medication[]) {
  const [allInteractions, setAllInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    db.interactions.toArray().then(setAllInteractions);
  }, []);

  const detected = useMemo((): DetectedInteraction[] => {
    if (selectedMeds.length < 2 || allInteractions.length === 0) return [];

    // Pré-calcul : pour chaque médicament sélectionné, extraire les substances
    const medSubstances = selectedMeds.map((m) => ({
      med: m,
      parts: splitDCI(m.dci),
    }));

    const results: DetectedInteraction[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < medSubstances.length; i++) {
      for (let j = i + 1; j < medSubstances.length; j++) {
        const a = medSubstances[i]!;
        const b = medSubstances[j]!;

        for (const inter of allInteractions) {
          // Matching bidirectionnel : inter.substance1 dans med A + inter.substance2 dans med B, ou inversement
          const s1InA = matchSubstance(inter.substance1, a.parts);
          const s2InB = matchSubstance(inter.substance2, b.parts);
          const s1InB = matchSubstance(inter.substance1, b.parts);
          const s2InA = matchSubstance(inter.substance2, a.parts);

          const matchesAtoB = s1InA && s2InB;
          const matchesBtoA = s1InB && s2InA;

          if (!matchesAtoB && !matchesBtoA) continue;

          // Déduplication : (A+B, level) ne doit apparaître qu'une fois
          const key = interactionKey(
            `${a.med.codeCIS}_${inter.substance1}`,
            `${b.med.codeCIS}_${inter.substance2}`,
            inter.level,
          );
          if (seen.has(key)) continue;
          seen.add(key);

          results.push({
            ...inter,
            medA: { name: a.med.name, codeCIS: a.med.codeCIS },
            medB: { name: b.med.name, codeCIS: b.med.codeCIS },
          });
        }
      }
    }

    const order = {
      "contre-indiquee": 0,
      deconseillee: 1,
      precaution: 2,
      "a-prendre-en-compte": 3,
    };
    results.sort((a, b) => (order[a.level] ?? 4) - (order[b.level] ?? 4));

    return results;
  }, [selectedMeds, allInteractions]);

  return { detected, totalInteractionsInDB: allInteractions.length };
}
