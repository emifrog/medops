"use client";

import { useState, useCallback } from "react";
import { db } from "@/lib/db";
import type { Medication } from "@/types/medication";

interface CIPLookupResult {
  medication: Medication | null;
  loading: boolean;
  error: string | null;
}

export function useCIPLookup() {
  const [result, setResult] = useState<CIPLookupResult>({
    medication: null,
    loading: false,
    error: null,
  });

  const lookup = useCallback(async (cip13: string) => {
    setResult({ medication: null, loading: true, error: null });

    const presentation = await db.presentations.get(cip13);
    if (!presentation) {
      setResult({ medication: null, loading: false, error: "Code CIP13 inconnu" });
      return null;
    }

    const medication = await db.medications.get(presentation.codeCIS);
    if (!medication) {
      setResult({ medication: null, loading: false, error: "Medicament introuvable" });
      return null;
    }

    // Enregistrer dans l'historique des scans
    await db.scanHistory.add({
      cip13,
      codeCIS: medication.codeCIS,
      medName: medication.name,
      date: new Date().toISOString(),
    });

    setResult({ medication, loading: false, error: null });
    return medication;
  }, []);

  return { ...result, lookup };
}
