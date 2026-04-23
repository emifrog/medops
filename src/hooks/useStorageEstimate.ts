"use client";

import { useEffect, useState } from "react";

export interface StorageEstimate {
  /** Octets utilisés par cette origine (IndexedDB, cache SW, etc.) */
  usage: number | null;
  /** Quota total disponible pour l'origine */
  quota: number | null;
  /** Pourcentage utilisé (0-100) */
  percent: number | null;
  /** API non supportée sur ce navigateur */
  unsupported: boolean;
}

/**
 * Estime l'usage du stockage local (IndexedDB + cache Service Worker).
 *
 * Utilise navigator.storage.estimate() — supporté partout sauf les navigateurs
 * très anciens. Sur iOS Safari, les valeurs peuvent être imprécises mais
 * restent indicatives.
 */
export function useStorageEstimate() {
  const [estimate, setEstimate] = useState<StorageEstimate>({
    usage: null,
    quota: null,
    percent: null,
    unsupported: false,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
      setEstimate({
        usage: null,
        quota: null,
        percent: null,
        unsupported: true,
      });
      return;
    }

    navigator.storage
      .estimate()
      .then((e) => {
        const usage = e.usage ?? null;
        const quota = e.quota ?? null;
        const percent =
          usage !== null && quota !== null && quota > 0
            ? Math.round((usage / quota) * 100)
            : null;
        setEstimate({ usage, quota, percent, unsupported: false });
      })
      .catch(() => {
        setEstimate({
          usage: null,
          quota: null,
          percent: null,
          unsupported: false,
        });
      });
  }, []);

  return estimate;
}

/**
 * Formate un nombre d'octets en MB/GB lisibles.
 */
export function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "—";
  const mb = bytes / 1024 / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} Mo`;
  return `${(mb / 1024).toFixed(2)} Go`;
}
