export type Gravite = "faible" | "moderee" | "elevee" | "vitale";

export interface Surdosage {
  dci: string;
  doseToxique: string;
  symptomes: string[];
  cat: string[];
  antidote: string;
  gravite: Gravite;
  delaiAction: string;
  orientation: string;
  updatedAt: string;
}
