/**
 * Valide un code CIP13 (13 chiffres + checksum EAN-13).
 *
 * IMPORTANT : le CIP13 utilise le checksum EAN-13 (poids alternés 1-3),
 * PAS l'algorithme de Luhn. Ne pas confondre.
 */
export function isValidCIP13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  return ean13Check(code);
}

/**
 * Checksum EAN-13 : somme pondérée (1-3-1-3...) des 12 premiers chiffres.
 * Le 13e chiffre est le complément à 10 modulo 10.
 */
function ean13Check(code: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]!, 10);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  const expected = (10 - (sum % 10)) % 10;
  return expected === parseInt(code[12]!, 10);
}

/**
 * Formate un code CIP13 avec des espaces pour lisibilité
 * 3400936295704 → 340 093 629 5704
 */
export function formatCIP13(code: string): string {
  if (code.length !== 13) return code;
  return `${code.slice(0, 3)} ${code.slice(3, 6)} ${code.slice(6, 9)} ${code.slice(9)}`;
}
