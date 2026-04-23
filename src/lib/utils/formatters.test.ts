import { describe, it, expect } from "vitest";
import { formatBilanSAMU } from "./formatters";
import type { MedicationFull } from "@/types/medication";

const baseMed: MedicationFull = {
  codeCIS: "60234100",
  name: "DOLIPRANE",
  dci: "PARACÉTAMOL",
  dosage: "1000 mg",
  forme: "comprimé",
  voie: "orale",
  labo: "Opella Healthcare France",
  statutAMM: "Autorisation active",
  classe: "Antalgique",
  codeATC: "N02BE01",
  searchText: "doliprane paracetamol",
  conservation: "< 25°C",
  updatedAt: "2026-04-07",
  substances: [],
  alerts: [],
};

describe("formatBilanSAMU", () => {
  it("génère un bilan minimal sans fiche surdosage", () => {
    const text = formatBilanSAMU(baseMed);
    expect(text).toContain("BILAN MEDIC.");
    expect(text).toContain("DOLIPRANE");
    expect(text).toContain("1000 mg");
    expect(text).toContain("DCI: PARACÉTAMOL");
    expect(text).toContain("Classe: Antalgique");
    // Sans surdosage, pas de section CAT/antidote
    expect(text).not.toContain("Antidote:");
    expect(text).not.toContain("CAT:");
  });

  it("inclut les données surdosage quand présentes", () => {
    const text = formatBilanSAMU({
      ...baseMed,
      surdosage: {
        dci: "PARACÉTAMOL",
        indication: "Douleurs légères",
        doseToxique: ">150 mg/kg",
        symptomes: ["nausées", "cytolyse hépatique"],
        cat: ["Charbon activé", "N-acétylcystéine IV"],
        antidote: "N-ACÉTYLCYSTÉINE IV",
        gravite: "vitale",
        delaiAction: "24-72h",
        orientation: "Transfert SAMU",
        updatedAt: "2026-04-07",
      },
    });
    expect(text).toContain("Dose toxique: >150 mg/kg");
    expect(text).toContain("Antidote: N-ACÉTYLCYSTÉINE IV");
    expect(text).toContain("CAT: Charbon activé / N-acétylcystéine IV");
    expect(text).toContain("Orientation: Transfert SAMU");
  });

  it("omet les champs surdosage vides", () => {
    const text = formatBilanSAMU({
      ...baseMed,
      surdosage: {
        dci: "X",
        indication: "",
        doseToxique: "",
        symptomes: [],
        cat: [],
        antidote: "",
        gravite: "faible",
        delaiAction: "",
        orientation: "SAU",
        updatedAt: "2026-04-07",
      },
    });
    expect(text).not.toContain("Dose toxique:");
    expect(text).not.toContain("Antidote:");
    expect(text).not.toContain("CAT:");
    expect(text).toContain("Orientation: SAU");
  });

  it("format multi-ligne avec séparateurs \\n", () => {
    const text = formatBilanSAMU(baseMed);
    const lines = text.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(lines[0]).toMatch(/^BILAN MEDIC\./);
  });
});
