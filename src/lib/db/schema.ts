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
  }
}
