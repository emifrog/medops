"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import type { MedicationFull } from "@/types/medication";

export function useMedication(codeCIS: string | null) {
  const [medication, setMedication] = useState<MedicationFull | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!codeCIS) {
      setMedication(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      const med = await db.medications.get(codeCIS!);
      if (cancelled || !med) {
        setLoading(false);
        return;
      }

      const [substances, alerts, surdosage] = await Promise.all([
        db.substances.where("codeCIS").equals(codeCIS!).toArray(),
        db.alerts.where("codeCIS").equals(codeCIS!).toArray(),
        db.surdosage.get(med.dci),
      ]);

      if (!cancelled) {
        setMedication({ ...med, substances, alerts, surdosage });
        setLoading(false);

        // Enregistrer dans l'historique
        await db.history.add({
          codeCIS: med.codeCIS,
          medName: med.name,
          date: new Date().toISOString(),
        });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [codeCIS]);

  return { medication, loading };
}
