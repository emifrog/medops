"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import type { Medication } from "@/types/medication";

export function useHistory(limit = 10) {
  const [recentMeds, setRecentMeds] = useState<Medication[]>([]);

  const load = useCallback(async () => {
    // Récupérer les dernières consultations uniques
    const entries = await db.history
      .orderBy("date")
      .reverse()
      .limit(50)
      .toArray();

    // Dédupliquer par codeCIS, garder le plus récent
    const seen = new Set<string>();
    const uniqueCIS: string[] = [];
    for (const entry of entries) {
      if (!seen.has(entry.codeCIS)) {
        seen.add(entry.codeCIS);
        uniqueCIS.push(entry.codeCIS);
        if (uniqueCIS.length >= limit) break;
      }
    }

    if (uniqueCIS.length === 0) {
      setRecentMeds([]);
      return;
    }

    const meds = await db.medications
      .where("codeCIS")
      .anyOf(uniqueCIS)
      .toArray();

    // Trier dans l'ordre de consultation
    const medsMap = new Map(meds.map((m) => [m.codeCIS, m]));
    const sorted = uniqueCIS
      .map((cis) => medsMap.get(cis))
      .filter((m): m is Medication => m !== undefined);

    setRecentMeds(sorted);
  }, [limit]);

  useEffect(() => {
    load();

    // Recharger périodiquement (quand l'utilisateur revient sur la page)
    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [load]);

  return { recentMeds, reload: load };
}
