/**
 * Normalisation et matching des DCI pour le vérificateur d'interactions.
 *
 * Pourquoi : les DCI peuvent contenir plusieurs substances ("AMOXICILLINE +
 * ACIDE CLAVULANIQUE"), des accents variables ("PARACÉTAMOL" vs "PARACETAMOL"),
 * et la recherche par substring simple crée des faux positifs
 * (ex: "ACIDE" matcherait dans plusieurs DCI non liées).
 */

// Regex des diacritiques combinants Unicode (U+0300 à U+036F)
const DIACRITICS = /[̀-ͯ]/g;

/**
 * Retire les accents (NFD decomposition) et passe en majuscules.
 */
export function normalizeDCI(raw: string): string {
  return raw.normalize("NFD").replace(DIACRITICS, "").toUpperCase().trim();
}

/**
 * Décompose une chaîne de DCI en tableau de substances normalisées.
 *
 * Entrée : "AMOXICILLINE + ACIDE CLAVULANIQUE"
 * Sortie : ["AMOXICILLINE", "ACIDE CLAVULANIQUE"]
 */
export function splitDCI(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\s*[+,/]\s*|\s+ET\s+/i)
    .map(normalizeDCI)
    .filter((s) => s.length > 2);
}

/**
 * Vérifie si une substance (ex: "APIXABAN") correspond à une des substances
 * extraites d'un DCI d'un médicament.
 *
 * Matching par égalité stricte (après normalisation) OU par mot entier
 * (la substance forme un mot complet dans le DCI, pas une sous-chaîne).
 *
 * Exemples :
 * - matchSubstance("APIXABAN", ["APIXABAN"]) → true
 * - matchSubstance("APIXABAN", ["AMOXICILLINE", "ACIDE CLAVULANIQUE"]) → false
 * - matchSubstance("ACIDE ACÉTYLSALICYLIQUE", ["ACIDE ACETYLSALICYLIQUE"]) → true (accents)
 * - matchSubstance("CODEINE", ["PARACETAMOL", "CODEINE"]) → true
 * - matchSubstance("ACIDE", ["ACIDE CLAVULANIQUE"]) → false (ACIDE seul n'est pas une substance à part entière ici)
 */
export function matchSubstance(target: string, dciParts: string[]): boolean {
  const normalizedTarget = normalizeDCI(target);
  if (normalizedTarget.length < 3) return false;

  return dciParts.some((part) => {
    // Égalité stricte après normalisation
    if (part === normalizedTarget) return true;

    // Match par mot entier (évite les sous-chaînes)
    const boundary = new RegExp(
      `(^|[\\s\\-,+/])${escapeRegExp(normalizedTarget)}($|[\\s\\-,+/])`,
    );
    return boundary.test(part);
  });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Génère une clé stable pour dédupliquer des interactions détectées.
 * Triée pour que (A, B, level) et (B, A, level) produisent la même clé.
 */
export function interactionKey(
  sub1: string,
  sub2: string,
  level: string,
): string {
  const a = normalizeDCI(sub1);
  const b = normalizeDCI(sub2);
  const [first, second] = a < b ? [a, b] : [b, a];
  return `${first}||${second}||${level}`;
}
