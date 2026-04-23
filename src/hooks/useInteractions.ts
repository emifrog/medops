"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db";
import {
  splitDCI,
  matchSubstance,
  normalizeDCI,
  interactionKey,
} from "@/lib/utils/dci";
import type { Medication } from "@/types/medication";
import type { Interaction, DetectedInteraction } from "@/types/interaction";

type InteractionIndex = Map<string, Interaction[]>;

/**
 * Construit un index par substance normalisée.
 *
 * Chaque interaction est référencée deux fois : une sous substance1,
 * une sous substance2. Cela permet une recherche O(1) par substance au
 * lieu de scanner toutes les interactions pour chaque paire de médicaments.
 */
function buildInteractionIndex(interactions: Interaction[]): InteractionIndex {
  const index: InteractionIndex = new Map();
  for (const inter of interactions) {
    const s1 = normalizeDCI(inter.substance1);
    const s2 = normalizeDCI(inter.substance2);
    if (!index.has(s1)) index.set(s1, []);
    if (!index.has(s2)) index.set(s2, []);
    index.get(s1)!.push(inter);
    index.get(s2)!.push(inter);
  }
  return index;
}

export function useInteractions(selectedMeds: Medication[]) {
  const [interactionIndex, setInteractionIndex] = useState<InteractionIndex>(
    new Map(),
  );
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    db.interactions.toArray().then((all) => {
      setInteractionIndex(buildInteractionIndex(all));
      setTotalCount(all.length);
    });
  }, []);

  const detected = useMemo((): DetectedInteraction[] => {
    if (selectedMeds.length < 2 || interactionIndex.size === 0) return [];

    // Pré-calcul des parts de chaque médicament
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

        // Candidates = interactions pertinentes pour les substances de A OU B
        const candidates = new Set<Interaction>();
        for (const part of a.parts) {
          const bucket = interactionIndex.get(part);
          if (bucket) for (const inter of bucket) candidates.add(inter);
        }
        for (const part of b.parts) {
          const bucket = interactionIndex.get(part);
          if (bucket) for (const inter of bucket) candidates.add(inter);
        }

        // Vérifier chaque candidate : les deux substances de l'interaction
        // doivent matcher (une dans A, l'autre dans B — peu importe l'ordre).
        for (const inter of candidates) {
          const s1InA = matchSubstance(inter.substance1, a.parts);
          const s2InB = matchSubstance(inter.substance2, b.parts);
          const s1InB = matchSubstance(inter.substance1, b.parts);
          const s2InA = matchSubstance(inter.substance2, a.parts);

          const matchesAtoB = s1InA && s2InB;
          const matchesBtoA = s1InB && s2InA;

          if (!matchesAtoB && !matchesBtoA) continue;

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
  }, [selectedMeds, interactionIndex]);

  return { detected, totalInteractionsInDB: totalCount };
}
