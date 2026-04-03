/**
 * Valide un code CIP13 (13 chiffres + checksum Luhn)
 */
export function isValidCIP13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  return luhnCheck(code);
}

function luhnCheck(code: string): boolean {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    let digit = parseInt(code[code.length - 1 - i]!, 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Formate un code CIP13 avec des espaces pour lisibilité
 * 3400936295704 → 340 093 629 5704
 */
export function formatCIP13(code: string): string {
  if (code.length !== 13) return code;
  return `${code.slice(0, 3)} ${code.slice(3, 6)} ${code.slice(6, 9)} ${code.slice(9)}`;
}
