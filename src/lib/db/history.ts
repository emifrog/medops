import { db } from "./index";

const MAX_HISTORY_ENTRIES = 500;
const DEDUP_WINDOW_MS = 60_000; // 1 minute

/**
 * Ajoute une consultation à l'historique, avec déduplication rapprochée.
 *
 * Si une entrée pour le même codeCIS existe dans la dernière minute, on ne
 * crée pas de nouveau doublon (évite de spammer l'historique quand un SP
 * rafraîchit ou re-navigue rapidement sur la même fiche).
 */
export async function addHistoryEntry(
  codeCIS: string,
  medName: string,
): Promise<void> {
  const now = Date.now();
  const cutoff = new Date(now - DEDUP_WINDOW_MS).toISOString();

  const recent = await db.history
    .where("codeCIS")
    .equals(codeCIS)
    .filter((e) => e.date > cutoff)
    .first();

  if (recent) return;

  await db.history.add({
    codeCIS,
    medName,
    date: new Date(now).toISOString(),
  });
}

/**
 * Purge les entrées d'historique au-delà de MAX_HISTORY_ENTRIES.
 *
 * Appelé au chargement de l'app. Évite une croissance infinie de la table
 * qui dégraderait progressivement les performances des requêtes.
 */
export async function purgeHistory(): Promise<number> {
  const total = await db.history.count();
  if (total <= MAX_HISTORY_ENTRIES) return 0;

  const toDelete = total - MAX_HISTORY_ENTRIES;

  // Supprimer les plus anciennes
  const oldestIds = await db.history
    .orderBy("date")
    .limit(toDelete)
    .primaryKeys();

  if (oldestIds.length > 0) {
    await db.history.bulkDelete(oldestIds);
  }

  return oldestIds.length;
}
