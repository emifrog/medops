export type InteractionLevel =
  | "contre-indiquee"
  | "deconseillee"
  | "precaution"
  | "a-prendre-en-compte";

export interface Interaction {
  id?: number;
  substance1: string;
  substance2: string;
  level: InteractionLevel;
  description: string;
  cat: string;
  updatedAt: string;
}

export interface DetectedInteraction extends Interaction {
  medA: { name: string; codeCIS: string };
  medB: { name: string; codeCIS: string };
}

export const INTERACTION_LEVELS: Record<
  InteractionLevel,
  { label: string; color: string; order: number }
> = {
  "contre-indiquee": { label: "Contre-indiquee", color: "#EF4444", order: 0 },
  deconseillee: { label: "Deconseillee", color: "#F59E0B", order: 1 },
  precaution: { label: "Precaution d'emploi", color: "#3B82F6", order: 2 },
  "a-prendre-en-compte": {
    label: "A prendre en compte",
    color: "#10B981",
    order: 3,
  },
};
