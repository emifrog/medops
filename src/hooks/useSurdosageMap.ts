"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import type { Gravite } from "@/types/surdosage";

export interface SurdosageInfo {
  dci: string;
  indication: string;
  gravite: Gravite | null;
  hasCAT: boolean;
}

/**
 * Charge toutes les fiches surdosage en mémoire et les indexe par DCI (uppercase).
 * Permet de croiser rapidement un résultat de recherche avec sa gravité.
 */
export function useSurdosageMap() {
  const [map, setMap] = useState<Map<string, SurdosageInfo>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    db.surdosage.toArray().then((fiches) => {
      const m = new Map<string, SurdosageInfo>();
      for (const f of fiches) {
        m.set(f.dci.toUpperCase(), {
          dci: f.dci,
          indication: f.indication ?? "",
          gravite: f.gravite ?? null,
          hasCAT: (f.cat?.length ?? 0) > 0,
        });
      }
      setMap(m);
      setReady(true);
    });
  }, []);

  return { map, ready };
}
