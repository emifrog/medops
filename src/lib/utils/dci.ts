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
 * Vérifie si une substance correspond à une des substances extraites d'un DCI.
 *
 * Matching strict : égalité après normalisation.
 *
 * Pour les substances composées de plusieurs mots ("ACIDE ACETYLSALICYLIQUE"),
 * l'égalité après normalisation est également requise — pas de sous-chaîne.
 *
 * Les `parts` sont supposés déjà normalisés (sortie de splitDCI).
 * Si l'appelant passe des parts bruts, normalizeDCI est appliqué ici aussi
 * pour garantir la symétrie des comparaisons.
 *
 * Exemples :
 * - matchSubstance("APIXABAN", ["APIXABAN"]) → true
 * - matchSubstance("APIXABAN", ["AMOXICILLINE", "ACIDE CLAVULANIQUE"]) → false
 * - matchSubstance("PARACÉTAMOL", ["PARACETAMOL"]) → true (accents)
 * - matchSubstance("ACIDE", ["ACIDE CLAVULANIQUE"]) → false (pas une substance complète)
 */
export function matchSubstance(target: string, dciParts: string[]): boolean {
  const normalizedTarget = normalizeDCI(target);
  if (normalizedTarget.length < 3) return false;

  return dciParts.some((part) => normalizeDCI(part) === normalizedTarget);
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
