import type { MedicationFull } from "@/types/medication";

/**
 * Génère le texte du bilan SAMU pour copie dans le presse-papiers
 */
export function formatBilanSAMU(med: MedicationFull): string {
  const lines = [
    `BILAN MEDIC. — ${med.name} ${med.dosage}`,
    `DCI: ${med.dci}`,
    `Classe: ${med.classe}`,
  ];

  if (med.surdosage) {
    if (med.surdosage.doseToxique) {
      lines.push(`Dose toxique: ${med.surdosage.doseToxique}`);
    }
    if (med.surdosage.antidote) {
      lines.push(`Antidote: ${med.surdosage.antidote}`);
    }
    if (med.surdosage.cat.length > 0) {
      lines.push(`CAT: ${med.surdosage.cat.join(" / ")}`);
    }
    lines.push(`Orientation: ${med.surdosage.orientation}`);
  }

  return lines.join("\n");
}

/**
 * Copie du texte dans le presse-papiers avec fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
