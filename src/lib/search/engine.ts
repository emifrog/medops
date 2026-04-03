import MiniSearch from "minisearch";
import { db } from "@/lib/db";
import type { Medication } from "@/types/medication";

let searchIndex: MiniSearch<Medication> | null = null;
let indexReady = false;

export function createSearchIndex(): MiniSearch<Medication> {
  return new MiniSearch<Medication>({
    fields: ["name", "dci", "searchText", "codeATC", "classe"],
    storeFields: ["codeCIS", "name", "dci", "dosage", "forme", "labo", "codeATC", "classe"],
    idField: "codeCIS",
    searchOptions: {
      boost: { name: 3, dci: 2, codeATC: 1.5, classe: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
    tokenize: (text) => text.toLowerCase().split(/[\s\-_/,;()]+/),
  });
}

export async function buildIndex(): Promise<MiniSearch<Medication>> {
  const index = createSearchIndex();
  const medications = await db.medications.toArray();
  index.addAll(medications);
  searchIndex = index;
  indexReady = true;
  return index;
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
