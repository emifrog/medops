import { db } from "./index";
import type { Table } from "dexie";
import { getSupabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types.generated";
import type { Medication, Substance, Presentation, Alert } from "@/types/medication";
import type { Interaction } from "@/types/interaction";
import type { Surdosage } from "@/types/surdosage";

type SupabaseTable = keyof Database["public"]["Tables"];

const BATCH_SIZE = 1000;
/**
 * Délai au-delà duquel on force un full sync même si un delta est possible.
 * Permet de rattraper les deletes (Supabase ne renvoie pas les lignes supprimées
 * via .gte("updated_at")).
 */
const FULL_SYNC_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export type LoadingState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "downloading"; progress: number; total: number; label: string }
  | { status: "ready"; version: string; count: number }
  | { status: "error"; message: string };

async function getLocalVersion(): Promise<string | null> {
  const meta = await db.meta.get("version");
  return meta?.value ?? null;
}

async function getRemoteVersion(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("data_version")
    .select("version")
    .eq("id", 1)
    .single();

  if (error || !data) return null;
  return (data as { version: string }).version;
}

function lastSyncKey(table: SupabaseTable): string {
  return `lastSync:${table}`;
}

function lastFullSyncKey(table: SupabaseTable): string {
  return `lastFullSync:${table}`;
}

async function getLastSync(table: SupabaseTable): Promise<string | null> {
  const meta = await db.meta.get(lastSyncKey(table));
  return meta?.value ?? null;
}

async function getLastFullSync(table: SupabaseTable): Promise<string | null> {
  const meta = await db.meta.get(lastFullSyncKey(table));
  return meta?.value ?? null;
}

/**
 * Décide si on doit faire un full sync ou un delta sync pour cette table.
 */
async function shouldFullSync(
  table: SupabaseTable,
  store: Table<unknown>,
): Promise<boolean> {
  // Si le store est vide, full sync obligatoire
  const count = await store.count();
  if (count === 0) return true;

  // Pas de dernier full sync enregistré → full
  const lastFull = await getLastFullSync(table);
  if (!lastFull) return true;

  // Dernier full trop ancien → full pour rattraper les deletes
  const lastFullMs = new Date(lastFull).getTime();
  if (Number.isNaN(lastFullMs)) return true;
  if (Date.now() - lastFullMs > FULL_SYNC_MAX_AGE_MS) return true;

  return false;
}

/**
 * Télécharge et met à jour une table, en mode delta ou full selon le contexte.
 */
async function syncTable<T>(
  tableName: SupabaseTable,
  store: Table<T>,
  mapRow: (row: Record<string, unknown>) => T,
  onProgress: (loaded: number, total: number) => void,
): Promise<{ mode: "full" | "delta"; loaded: number }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase non disponible");

  const isFullSync = await shouldFullSync(tableName, store);
  const sinceTimestamp = isFullSync ? null : await getLastSync(tableName);

  // Compter les lignes à télécharger
  let countQuery = supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });
  if (sinceTimestamp) {
    countQuery = countQuery.gte("updated_at", sinceTimestamp);
  }
  const { count } = await countQuery;
  const total = count ?? 0;

  // Full sync : vider le store avant de recharger
  if (isFullSync) {
    await store.clear();
  }

  // Si delta et rien à télécharger, on met juste à jour le timestamp
  if (total === 0) {
    const now = new Date().toISOString();
    await db.meta.put({ key: lastSyncKey(tableName), value: now });
    onProgress(0, 0);
    return { mode: isFullSync ? "full" : "delta", loaded: 0 };
  }

  let loaded = 0;
  while (loaded < total) {
    let query = supabase
      .from(tableName)
      .select("*")
      .range(loaded, loaded + BATCH_SIZE - 1);
    if (sinceTimestamp) {
      query = query.gte("updated_at", sinceTimestamp);
    }
    // Tri stable pour la pagination — évite les doublons si inserts concurrents
    query = query.order("updated_at", { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Erreur chargement ${tableName}: ${error.message}`);
    }
    if (!data || data.length === 0) break;

    const mapped = data.map(mapRow);
    await store.bulkPut(mapped);

    loaded += data.length;
    onProgress(loaded, total);
  }

  // Mettre à jour les timestamps de sync
  const now = new Date().toISOString();
  await db.meta.put({ key: lastSyncKey(tableName), value: now });
  if (isFullSync) {
    await db.meta.put({ key: lastFullSyncKey(tableName), value: now });
  }

  return { mode: isFullSync ? "full" : "delta", loaded };
}

// Mappers Supabase → IndexedDB
const mapMedication = (r: Record<string, unknown>): Medication => ({
  codeCIS: r.code_cis as string,
  name: r.name as string,
  dci: (r.dci as string) ?? "",
  dosage: (r.dosage as string) ?? "",
  forme: (r.forme as string) ?? "",
  voie: (r.voie as string) ?? "",
  labo: (r.labo as string) ?? "",
  statutAMM: (r.statut_amm as string) ?? "",
  classe: (r.classe as string) ?? "",
  codeATC: (r.code_atc as string) ?? "",
  searchText: (r.search_text as string) ?? "",
  conservation: (r.conservation as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

const mapSubstance = (r: Record<string, unknown>): Substance => ({
  id: r.id as number,
  codeCIS: r.code_cis as string,
  dci: r.dci as string,
  dosage: (r.dosage as string) ?? "",
  nature: (r.nature as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

const mapPresentation = (r: Record<string, unknown>): Presentation => ({
  cip13: r.cip13 as string,
  cip7: (r.cip7 as string) ?? "",
  codeCIS: r.code_cis as string,
  libelle: (r.libelle as string) ?? "",
  prix: (r.prix as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

const mapAlert = (r: Record<string, unknown>): Alert => ({
  id: r.id as number,
  codeCIS: r.code_cis as string,
  dateDebut: (r.date_debut as string) ?? "",
  dateFin: (r.date_fin as string) ?? "",
  texte: (r.texte as string) ?? "",
  lien: (r.lien as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

const mapInteraction = (r: Record<string, unknown>): Interaction => ({
  id: r.id as number,
  substance1: r.substance1 as string,
  substance2: r.substance2 as string,
  level: r.level as Interaction["level"],
  description: (r.description as string) ?? "",
  cat: (r.cat as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

const mapSurdosage = (r: Record<string, unknown>): Surdosage => ({
  dci: r.dci as string,
  indication: (r.indication as string) ?? "",
  doseToxique: (r.dose_toxique as string) ?? "",
  symptomes: (r.symptomes as string[]) ?? [],
  cat: (r.cat as string[]) ?? [],
  antidote: (r.antidote as string) ?? "",
  gravite: (r.gravite as Surdosage["gravite"]) ?? "faible",
  delaiAction: (r.delai_action as string) ?? "",
  orientation: (r.orientation as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

/**
 * Réinitialise les timestamps de sync (utilisé pour forcer un full sync).
 */
export async function resetSyncTimestamps(): Promise<void> {
  const tables: SupabaseTable[] = [
    "medications",
    "substances",
    "presentations",
    "alerts",
    "interactions",
    "surdosage",
  ];
  for (const t of tables) {
    await db.meta.delete(lastSyncKey(t));
    await db.meta.delete(lastFullSyncKey(t));
  }
}

export async function loadDatabase(
  onStateChange: (state: LoadingState) => void,
): Promise<void> {
  try {
    onStateChange({ status: "checking" });

    const localVersion = await getLocalVersion();
    const remoteVersion = await getRemoteVersion();

    // Pas de connexion Supabase ? Vérifier si on a des données locales
    if (!remoteVersion) {
      const count = await db.medications.count();
      if (count > 0) {
        onStateChange({
          status: "ready",
          version: localVersion ?? "locale",
          count,
        });
        return;
      }
      onStateChange({
        status: "error",
        message:
          "Aucune connexion et base locale vide. Connectez-vous pour le premier chargement.",
      });
      return;
    }

    // Version locale à jour → on sort tôt, pas de sync nécessaire
    // (sauf si on veut forcer un delta de rattrapage : désactivé pour l'instant
    // pour garder le démarrage rapide)
    if (localVersion && localVersion === remoteVersion) {
      const count = await db.medications.count();
      if (count > 0) {
        onStateChange({ status: "ready", version: localVersion, count });
        return;
      }
    }

    // Sync des tables (delta si possible, full sinon)
    const steps: Array<{
      table: SupabaseTable;
      run: (
        onProgress: (loaded: number, total: number) => void,
      ) => Promise<{ mode: "full" | "delta"; loaded: number }>;
      label: string;
    }> = [
      {
        table: "medications",
        run: (onProgress) =>
          syncTable("medications", db.medications, mapMedication, onProgress),
        label: "Médicaments",
      },
      {
        table: "substances",
        run: (onProgress) =>
          syncTable("substances", db.substances, mapSubstance, onProgress),
        label: "Compositions",
      },
      {
        table: "presentations",
        run: (onProgress) =>
          syncTable(
            "presentations",
            db.presentations,
            mapPresentation,
            onProgress,
          ),
        label: "Présentations CIP",
      },
      {
        table: "alerts",
        run: (onProgress) =>
          syncTable("alerts", db.alerts, mapAlert, onProgress),
        label: "Alertes",
      },
      {
        table: "interactions",
        run: (onProgress) =>
          syncTable(
            "interactions",
            db.interactions,
            mapInteraction,
            onProgress,
          ),
        label: "Interactions",
      },
      {
        table: "surdosage",
        run: (onProgress) =>
          syncTable("surdosage", db.surdosage, mapSurdosage, onProgress),
        label: "Fiches surdosage",
      },
    ];

    for (const { run, label, table } of steps) {
      onStateChange({ status: "downloading", progress: 0, total: 0, label });
      const result = await run((loaded, total) => {
        onStateChange({ status: "downloading", progress: loaded, total, label });
      });
      console.info(
        `[sync] ${table} ${result.mode} sync : ${result.loaded} ligne${result.loaded !== 1 ? "s" : ""}`,
      );
    }

    // Mettre à jour la version locale
    await db.meta.put({ key: "version", value: remoteVersion });
    await db.meta.put({ key: "lastSync", value: new Date().toISOString() });

    const count = await db.medications.count();
    onStateChange({ status: "ready", version: remoteVersion, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    onStateChange({ status: "error", message });
  }
}
