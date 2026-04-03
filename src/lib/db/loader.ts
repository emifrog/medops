import { db } from "./index";
import type { Table } from "dexie";
import { supabase } from "@/lib/supabase/client";
import type { Medication, Substance, Presentation, Alert } from "@/types/medication";
import type { Interaction } from "@/types/interaction";
import type { Surdosage } from "@/types/surdosage";

const BATCH_SIZE = 1000;

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
  const { data, error } = await supabase
    .from("data_version")
    .select("version")
    .eq("id", 1)
    .single();

  if (error || !data) return null;
  return (data as { version: string }).version;
}

async function fetchAndStore<T>(
  tableName: string,
  store: Table<T>,
  mapRow: (row: Record<string, unknown>) => T,
  onProgress: (loaded: number, total: number) => void,
): Promise<number> {
  const { count } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  const total = count ?? 0;
  let loaded = 0;

  // Vider le store avant de recharger
  await store.clear();

  // Charger par lots
  while (loaded < total) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .range(loaded, loaded + BATCH_SIZE - 1);

    if (error) throw new Error(`Erreur chargement ${tableName}: ${error.message}`);
    if (!data || data.length === 0) break;

    const mapped = data.map(mapRow);
    await store.bulkPut(mapped);

    loaded += data.length;
    onProgress(loaded, total);
  }

  return loaded;
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
  doseToxique: (r.dose_toxique as string) ?? "",
  symptomes: (r.symptomes as string[]) ?? [],
  cat: (r.cat as string[]) ?? [],
  antidote: (r.antidote as string) ?? "",
  gravite: (r.gravite as Surdosage["gravite"]) ?? "faible",
  delaiAction: (r.delai_action as string) ?? "",
  orientation: (r.orientation as string) ?? "",
  updatedAt: (r.updated_at as string) ?? "",
});

export async function loadDatabase(
  onStateChange: (state: LoadingState) => void,
): Promise<void> {
  try {
    onStateChange({ status: "checking" });

    const localVersion = await getLocalVersion();
    const remoteVersion = await getRemoteVersion();

    // Si la base locale est à jour, on ne recharge pas
    if (localVersion && remoteVersion && localVersion === remoteVersion) {
      const count = await db.medications.count();
      onStateChange({ status: "ready", version: localVersion, count });
      return;
    }

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
        message: "Aucune connexion et base locale vide. Connectez-vous pour le premier chargement.",
      });
      return;
    }

    // Charger les données depuis Supabase
    const steps: Array<{ table: string; run: (onProgress: (loaded: number, total: number) => void) => Promise<number>; label: string }> = [
      { table: "medications", run: (onProgress) => fetchAndStore("medications", db.medications, mapMedication, onProgress), label: "Medicaments" },
      { table: "substances", run: (onProgress) => fetchAndStore("substances", db.substances, mapSubstance, onProgress), label: "Compositions" },
      { table: "presentations", run: (onProgress) => fetchAndStore("presentations", db.presentations, mapPresentation, onProgress), label: "Presentations CIP" },
      { table: "alerts", run: (onProgress) => fetchAndStore("alerts", db.alerts, mapAlert, onProgress), label: "Alertes" },
      { table: "interactions", run: (onProgress) => fetchAndStore("interactions", db.interactions, mapInteraction, onProgress), label: "Interactions" },
      { table: "surdosage", run: (onProgress) => fetchAndStore("surdosage", db.surdosage, mapSurdosage, onProgress), label: "Fiches surdosage" },
    ];

    for (const { run, label } of steps) {
      onStateChange({ status: "downloading", progress: 0, total: 0, label });
      await run((loaded, total) => {
        onStateChange({ status: "downloading", progress: loaded, total, label });
      });
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
