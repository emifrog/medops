export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  atcPrefixes: string[];
}

/**
 * Classes thérapeutiques principales pour la navigation par catégorie.
 * Mappées sur les préfixes de code ATC.
 */
export const CATEGORIES: Category[] = [
  {
    id: "antalgique",
    label: "Antalgiques",
    icon: "💊",
    color: "#3B82F6",
    atcPrefixes: ["N02"],
  },
  {
    id: "cardio",
    label: "Cardiologie",
    icon: "❤️",
    color: "#F97316",
    atcPrefixes: ["C01", "C02", "C03", "C07", "C08", "C09", "C10"],
  },
  {
    id: "anticoagulant",
    label: "Anticoagulants",
    icon: "🩸",
    color: "#EF4444",
    atcPrefixes: ["B01"],
  },
  {
    id: "antidiabetique",
    label: "Antidiabetiques",
    icon: "📊",
    color: "#10B981",
    atcPrefixes: ["A10"],
  },
  {
    id: "psychotrope",
    label: "Psychotropes",
    icon: "🧠",
    color: "#F59E0B",
    atcPrefixes: ["N05", "N06"],
  },
  {
    id: "endocrino",
    label: "Endocrino",
    icon: "🦋",
    color: "#8B5CF6",
    atcPrefixes: ["H"],
  },
  {
    id: "pneumo",
    label: "Pneumologie",
    icon: "🌬️",
    color: "#0EA5E9",
    atcPrefixes: ["R03"],
  },
  {
    id: "infectio",
    label: "Anti-infectieux",
    icon: "🦠",
    color: "#14B8A6",
    atcPrefixes: ["J01", "J02", "J05"],
  },
  {
    id: "gastro",
    label: "Gastro",
    icon: "🫁",
    color: "#A855F7",
    atcPrefixes: ["A02", "A03", "A04", "A06", "A07"],
  },
  {
    id: "neuro",
    label: "Neurologie",
    icon: "⚡",
    color: "#EC4899",
    atcPrefixes: ["N03", "N04", "N07"],
  },
];

/**
 * Trouve la catégorie correspondante à un code ATC
 */
export function getCategoryForATC(codeATC: string): Category | undefined {
  if (!codeATC) return undefined;
  return CATEGORIES.find((cat) =>
    cat.atcPrefixes.some((prefix) => codeATC.startsWith(prefix)),
  );
}
