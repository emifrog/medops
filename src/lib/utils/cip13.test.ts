import { describe, it, expect } from "vitest";
import { isValidCIP13, formatCIP13 } from "./cip13";

describe("isValidCIP13 (checksum EAN-13)", () => {
  it("accepte des codes CIP13 réels avec checksum EAN-13 valide", () => {
    // Codes CIP13 réels validés par la formule EAN-13
    expect(isValidCIP13("3400936295704")).toBe(true);
    expect(isValidCIP13("3400936295698")).toBe(true);
  });

  it("refuse un code de longueur incorrecte", () => {
    expect(isValidCIP13("")).toBe(false);
    expect(isValidCIP13("123")).toBe(false);
    expect(isValidCIP13("12345678901234")).toBe(false); // 14 chiffres
    expect(isValidCIP13("123456789012")).toBe(false); // 12 chiffres
  });

  it("refuse un code contenant des caractères non numériques", () => {
    expect(isValidCIP13("340093629570A")).toBe(false);
    expect(isValidCIP13("3400 93629570")).toBe(false);
    expect(isValidCIP13("3400-936295704")).toBe(false);
  });

  it("refuse un code avec checksum EAN-13 incorrect", () => {
    // Modifier le dernier chiffre d'un code valide casse le checksum
    expect(isValidCIP13("3400936295700")).toBe(false);
    expect(isValidCIP13("3400936295701")).toBe(false);
    expect(isValidCIP13("1234567890123")).toBe(false);
  });

  it("accepte le code 0000000000000 (checksum EAN-13 mathématiquement valide)", () => {
    // sum = 0 → expected = 0 → match. Ce n'est pas un vrai CIP mais le test
    // documente le comportement limite.
    expect(isValidCIP13("0000000000000")).toBe(true);
  });
});

describe("formatCIP13", () => {
  it("formate un code CIP13 avec espaces", () => {
    expect(formatCIP13("3400936295704")).toBe("340 093 629 5704");
  });

  it("retourne le code tel quel si la longueur est incorrecte", () => {
    expect(formatCIP13("123")).toBe("123");
    expect(formatCIP13("")).toBe("");
  });

  it("supporte les caractères de padding (affichage pendant saisie)", () => {
    expect(formatCIP13("340093629···")).toBe("340093629···");
  });
});
