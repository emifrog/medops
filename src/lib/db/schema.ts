import Dexie, { type EntityTable } from "dexie";
import type { Medication, Substance, Presentation, Alert } from "@/types/medication";
import type { Interaction } from "@/types/interaction";
import type { Surdosage } from "@/types/surdosage";

export interface Favorite {
  codeCIS: string;
  addedAt: string;
}

export interface HistoryEntry {
  id?: number;
  codeCIS: string;
  medName: string;
  date: string;
}

export interface ScanHistoryEntry {
  id?: number;
  cip13: string;
  codeCIS: string;
  medName: string;
  date: string;
}

export interface MetaEntry {
  key: string;
  value: string;
}

/**
 * Cache de l'index de recherche MiniSearch sérialisé.
 *
 * Évite de rebuilder l'index à chaque lancement (économie ~500 ms-1 s sur
 * 15 000 médicaments). Invalidé quand la version de la base change.
 */
export interface SearchIndexCache {
  /** Clé fixe : "main" — un seul index pour l'instant */
  id: string;
  /** Version de la base au moment où l'index a été construit */
  dbVersion: string;
  /** Nombre de médicaments indexés (sanity check) */
  count: number;
  /** JSON sérialisé de l'index MiniSearch (via index.toJSON()) */
  serialized: unknown;
  /** Timestamp de sérialisation */
  savedAt: string;
}

export class MedOpsDB extends Dexie {
  medications!: EntityTable<Medication, "codeCIS">;
  substances!: EntityTable<Substance, "id">;
  presentations!: EntityTable<Presentation, "cip13">;
  interactions!: EntityTable<Interaction, "id">;
  surdosage!: EntityTable<Surdosage, "dci">;
  alerts!: EntityTable<Alert, "id">;
  favorites!: EntityTable<Favorite, "codeCIS">;
  history!: EntityTable<HistoryEntry, "id">;
  scanHistory!: EntityTable<ScanHistoryEntry, "id">;
  meta!: EntityTable<MetaEntry, "key">;
  searchIndexCache!: EntityTable<SearchIndexCache, "id">;

  constructor() {
    super("MedOpsDB");

    this.version(1).stores({
      medications: "codeCIS, name, dci, codeATC, searchText",
      substances: "++id, codeCIS, dci",
      presentations: "cip13, codeCIS",
      interactions: "++id, substance1, substance2, level",
      surdosage: "dci, gravite",
      alerts: "++id, codeCIS",
      favorites: "codeCIS",
      history: "++id, codeCIS, date",
      scanHistory: "++id, cip13, date",
      meta: "key",
    });

    // v2 : ajout du cache de l'index de recherche
    this.version(2).stores({
      medications: "codeCIS, name, dci, codeATC, searchText",
      substances: "++id, codeCIS, dci",
      presentations: "cip13, codeCIS",
      interactions: "++id, substance1, substance2, level",
      surdosage: "dci, gravite",
      alerts: "++id, codeCIS",
      favorites: "codeCIS",
      history: "++id, codeCIS, date",
      scanHistory: "++id, cip13, date",
      meta: "key",
      searchIndexCache: "id",
    });
  }
}
