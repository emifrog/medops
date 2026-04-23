import { describe, it, expect } from "vitest";
import {
  normalizeDCI,
  splitDCI,
  matchSubstance,
  interactionKey,
} from "./dci";

describe("normalizeDCI", () => {
  it("retire les accents", () => {
    expect(normalizeDCI("PARACÉTAMOL")).toBe("PARACETAMOL");
    expect(normalizeDCI("lévothyroxine")).toBe("LEVOTHYROXINE");
    expect(normalizeDCI("Acéta")).toBe("ACETA");
  });

  it("passe en majuscules", () => {
    expect(normalizeDCI("paracetamol")).toBe("PARACETAMOL");
    expect(normalizeDCI("Paracetamol")).toBe("PARACETAMOL");
  });

  it("trim les espaces", () => {
    expect(normalizeDCI("  APIXABAN  ")).toBe("APIXABAN");
  });

  it("gère les chaînes vides", () => {
    expect(normalizeDCI("")).toBe("");
    expect(normalizeDCI("   ")).toBe("");
  });
});

describe("splitDCI", () => {
  it("décompose une DCI simple", () => {
    expect(splitDCI("APIXABAN")).toEqual(["APIXABAN"]);
  });

  it("décompose une DCI composée avec +", () => {
    expect(splitDCI("AMOXICILLINE + ACIDE CLAVULANIQUE")).toEqual([
      "AMOXICILLINE",
      "ACIDE CLAVULANIQUE",
    ]);
  });

  it("décompose une DCI composée avec virgule", () => {
    expect(splitDCI("PARACÉTAMOL, CODÉINE")).toEqual(["PARACETAMOL", "CODEINE"]);
  });

  it("décompose une DCI composée avec slash", () => {
    expect(splitDCI("LÉVODOPA/CARBIDOPA")).toEqual(["LEVODOPA", "CARBIDOPA"]);
  });

  it("décompose avec le mot 'ET'", () => {
    expect(splitDCI("paracetamol et codeine")).toEqual([
      "PARACETAMOL",
      "CODEINE",
    ]);
  });

  it("filtre les substances trop courtes", () => {
    expect(splitDCI("A + B + APIXABAN")).toEqual(["APIXABAN"]);
  });

  it("retourne un tableau vide pour chaîne vide ou null", () => {
    expect(splitDCI("")).toEqual([]);
  });
});

describe("matchSubstance", () => {
  it("matche par égalité stricte", () => {
    expect(matchSubstance("APIXABAN", ["APIXABAN"])).toBe(true);
  });

  it("matche en ignorant les accents", () => {
    expect(matchSubstance("PARACÉTAMOL", ["PARACETAMOL"])).toBe(true);
    expect(matchSubstance("PARACETAMOL", ["PARACÉTAMOL"])).toBe(true);
  });

  it("matche une substance dans un DCI multi-substances", () => {
    const parts = ["AMOXICILLINE", "ACIDE CLAVULANIQUE"];
    expect(matchSubstance("AMOXICILLINE", parts)).toBe(true);
    expect(matchSubstance("ACIDE CLAVULANIQUE", parts)).toBe(true);
  });

  it("refuse APIXABAN quand le DCI est AMOXICILLINE (faux positif type)", () => {
    // Cas qui aurait pu foirer avec includes()
    expect(matchSubstance("APIXABAN", ["AMOXICILLINE"])).toBe(false);
  });

  it("ne matche pas ACIDE tout seul dans ACIDE CLAVULANIQUE", () => {
    // "ACIDE" seul n'est pas une substance à part entière : pas un mot complet dans une vraie DCI
    expect(matchSubstance("ACIDE", ["ACIDE CLAVULANIQUE"])).toBe(false);
  });

  it("matche ACIDE ACÉTYLSALICYLIQUE peu importe l'orthographe", () => {
    expect(
      matchSubstance("ACIDE ACÉTYLSALICYLIQUE", ["ACIDE ACETYLSALICYLIQUE"]),
    ).toBe(true);
    expect(
      matchSubstance("ACIDE ACETYLSALICYLIQUE", ["ACIDE ACÉTYLSALICYLIQUE"]),
    ).toBe(true);
  });

  it("ne matche pas une cible trop courte", () => {
    expect(matchSubstance("AB", ["APIXABAN"])).toBe(false);
    expect(matchSubstance("", ["APIXABAN"])).toBe(false);
  });

  it("ne matche pas CODEINE dans un part multi-substances non décomposé", () => {
    // Les parts sont supposés déjà décomposés par splitDCI.
    // Si on passe une chaîne composée comme part, pas de match — c'est
    // voulu pour éviter les faux positifs par sous-chaîne.
    expect(matchSubstance("CODEINE", ["PARACETAMOL/CODEINE"])).toBe(false);

    // En revanche, une fois passée par splitDCI, le matching fonctionne
    expect(matchSubstance("CODEINE", splitDCI("PARACETAMOL/CODEINE"))).toBe(true);
  });

  it("ne matche pas un préfixe", () => {
    // Eviter que "APIX" matche "APIXABAN"
    expect(matchSubstance("APIX", ["APIXABAN"])).toBe(false);
  });
});

describe("interactionKey", () => {
  it("produit la même clé quel que soit l'ordre des substances", () => {
    const k1 = interactionKey("APIXABAN", "CLOPIDOGREL", "contre-indiquee");
    const k2 = interactionKey("CLOPIDOGREL", "APIXABAN", "contre-indiquee");
    expect(k1).toBe(k2);
  });

  it("produit des clés différentes pour des niveaux différents", () => {
    const k1 = interactionKey("A", "B", "contre-indiquee");
    const k2 = interactionKey("A", "B", "deconseillee");
    expect(k1).not.toBe(k2);
  });

  it("normalise les accents dans la clé", () => {
    const k1 = interactionKey("PARACÉTAMOL", "CODÉINE", "precaution");
    const k2 = interactionKey("PARACETAMOL", "CODEINE", "precaution");
    expect(k1).toBe(k2);
  });
});
