export interface Medication {
  codeCIS: string;
  name: string;
  dci: string;
  dosage: string;
  forme: string;
  voie: string;
  labo: string;
  statutAMM: string;
  classe: string;
  codeATC: string;
  searchText: string;
  conservation: string;
  updatedAt: string;
}

export interface Substance {
  id?: number;
  codeCIS: string;
  dci: string;
  dosage: string;
  nature: string; // SA (substance active) / FT (fraction thérapeutique)
  updatedAt: string;
}

export interface Presentation {
  cip13: string;
  cip7: string;
  codeCIS: string;
  libelle: string;
  prix: string;
  updatedAt: string;
}

export interface Alert {
  id?: number;
  codeCIS: string;
  dateDebut: string;
  dateFin: string;
  texte: string;
  lien: string;
  updatedAt: string;
}

import type { Surdosage } from "./surdosage";

export interface MedicationFull extends Medication {
  substances: Substance[];
  alerts: Alert[];
  surdosage?: Surdosage;
}
