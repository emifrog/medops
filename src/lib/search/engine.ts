import MiniSearch, { type Options } from "minisearch";
import { db } from "@/lib/db";
import type { Medication } from "@/types/medication";

const INDEX_CACHE_ID = "main";

let searchIndex: MiniSearch<Medication> | null = null;
let indexReady = false;

const indexOptions: Options<Medication> = {
  fields: ["name", "dci", "searchText", "codeATC", "classe"],
  storeFields: [
    "codeCIS",
    "name",
    "dci",
    "dosage",
    "forme",
    "labo",
    "codeATC",
    "classe",
  ],
  idField: "codeCIS",
  searchOptions: {
    boost: { name: 3, dci: 2, codeATC: 1.5, classe: 1 },
    fuzzy: 0.2,
    prefix: true,
  },
  tokenize: (text) => text.toLowerCase().split(/[\s\-_/,;()]+/),
};

export function createSearchIndex(): MiniSearch<Medication> {
  return new MiniSearch<Medication>(indexOptions);
}

async function getCurrentDBVersion(): Promise<string | null> {
  const meta = await db.meta.get("version");
  return meta?.value ?? null;
}

/**
 * Tente de restaurer l'index depuis le cache IndexedDB.
 *
 * Retourne null si :
 * - Aucun cache en base
 * - La version du cache ne correspond pas à la version actuelle de la base
 * - La désérialisation échoue
 */
async function tryLoadIndexFromCache(): Promise<MiniSearch<Medication> | null> {
  try {
    const [cache, currentVersion, medicationCount] = await Promise.all([
      db.searchIndexCache.get(INDEX_CACHE_ID),
      getCurrentDBVersion(),
      db.medications.count(),
    ]);

    if (!cache) return null;
    if (!currentVersion || cache.dbVersion !== currentVersion) {
      // Cache obsolète : invalider
      await db.searchIndexCache.delete(INDEX_CACHE_ID);
      return null;
    }
    if (cache.count !== medicationCount) {
      // Sanity check : le nombre de médicaments a changé sans que la version bouge
      // → mieux vaut reconstruire
      await db.searchIndexCache.delete(INDEX_CACHE_ID);
      return null;
    }

    const index = MiniSearch.loadJS(
      cache.serialized as Parameters<typeof MiniSearch.loadJS>[0],
      indexOptions,
    );
    return index as MiniSearch<Medication>;
  } catch (err) {
    console.warn("[search] Échec restauration index depuis cache", err);
    return null;
  }
}

/**
 * Sérialise l'index et le stocke dans IndexedDB pour accélérer les prochains
 * démarrages. Non bloquant : en cas d'échec, on log et on continue.
 */
async function saveIndexToCache(
  index: MiniSearch<Medication>,
  count: number,
): Promise<void> {
  try {
    const dbVersion = await getCurrentDBVersion();
    if (!dbVersion) return;

    await db.searchIndexCache.put({
      id: INDEX_CACHE_ID,
      dbVersion,
      count,
      serialized: index.toJSON(),
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[search] Échec sauvegarde index en cache", err);
  }
}

/**
 * Construit ou restaure l'index de recherche.
 *
 * Stratégie :
 * 1. Essayer de charger depuis IndexedDB (rapide, ~50 ms)
 * 2. Si cache manquant/invalidé, rebuild depuis medications (lent, ~500 ms-1 s)
 *    puis sauvegarder pour la prochaine fois
 */
export async function buildIndex(): Promise<MiniSearch<Medication>> {
  const totalStart = performance.now();

  // Tentative de restauration depuis le cache
  const cached = await tryLoadIndexFromCache();
  if (cached) {
    searchIndex = cached;
    indexReady = true;
    console.info(
      `[search] Index restauré depuis le cache en ${Math.round(performance.now() - totalStart)} ms`,
    );
    return cached;
  }

  // Rebuild
  const buildStart = performance.now();
  const index = createSearchIndex();
  const medications = await db.medications.toArray();
  index.addAll(medications);
  searchIndex = index;
  indexReady = true;

  console.info(
    `[search] Index reconstruit (${medications.length} entrées) en ${Math.round(performance.now() - buildStart)} ms`,
  );

  // Sauvegarde en arrière-plan (non bloquant pour le retour)
  saveIndexToCache(index, medications.length).catch(() => {});

  return index;
}

/**
 * Invalide le cache de l'index. À appeler après un reload de la base.
 */
export async function invalidateIndexCache(): Promise<void> {
  try {
    await db.searchIndexCache.delete(INDEX_CACHE_ID);
  } catch {
    // Si le store n'existe pas encore (migration pas terminée), on ignore
  }
}

export function getIndex(): MiniSearch<Medication> | null {
  return searchIndex;
}

export function isIndexReady(): boolean {
  return indexReady;
}

export interface SearchResult {
  codeCIS: string;
  name: string;
  dci: string;
  dosage: string;
  forme: string;
  labo: string;
  codeATC: string;
  classe: string;
  score: number;
}

export function search(query: string, maxResults = 20): SearchResult[] {
  if (!searchIndex || query.length < 2) return [];

  const results = searchIndex.search(query).slice(0, maxResults);

  return results.map((r) => ({
    codeCIS: r.codeCIS as string,
    name: r.name as string,
    dci: r.dci as string,
    dosage: r.dosage as string,
    forme: r.forme as string,
    labo: r.labo as string,
    codeATC: r.codeATC as string,
    classe: r.classe as string,
    score: r.score,
  }));
}
