/**
 * Seed des interactions médicamenteuses dans Supabase
 *
 * Source : Thesaurus ANSM des interactions médicamenteuses (simplifié)
 * Couvre les interactions les plus critiques en intervention SP
 *
 * Usage : npx tsx scripts/seed-interactions.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type Level = "contre-indiquee" | "deconseillee" | "precaution" | "a-prendre-en-compte";

interface InteractionData {
  substance1: string;
  substance2: string;
  level: Level;
  description: string;
  cat: string;
}

const INTERACTIONS: InteractionData[] = [
  // ═══════════════════════════════════════
  // CONTRE-INDIQUÉES (niveau le plus grave)
  // ═══════════════════════════════════════

  // AOD + Antiagrégants
  {
    substance1: "APIXABAN",
    substance2: "CLOPIDOGREL",
    level: "contre-indiquee",
    description: "AOD + antiagrégant plaquettaire : risque hémorragique majeur, potentiellement fatal.",
    cat: "Association contre-indiquée sauf indication cardiologique précise (double/triple antithrombotique validé par cardiologue). Surveiller tout signe hémorragique.",
  },
  {
    substance1: "RIVAROXABAN",
    substance2: "CLOPIDOGREL",
    level: "contre-indiquee",
    description: "AOD + antiagrégant plaquettaire : risque hémorragique majeur.",
    cat: "Association contre-indiquée sauf indication cardiologique précise. Signaler au CRRA 15.",
  },
  {
    substance1: "APIXABAN",
    substance2: "ACIDE ACÉTYLSALICYLIQUE",
    level: "contre-indiquee",
    description: "AOD + aspirine : risque hémorragique majeur, y compris hémorragie intracrânienne.",
    cat: "Association contre-indiquée. Si association en cours, signaler immédiatement au médecin régulateur.",
  },
  {
    substance1: "RIVAROXABAN",
    substance2: "ACIDE ACÉTYLSALICYLIQUE",
    level: "contre-indiquee",
    description: "AOD + aspirine : risque hémorragique majeur.",
    cat: "Association contre-indiquée sauf indication validée (SCA récent).",
  },
  // Warfarine + AINS
  {
    substance1: "WARFARINE",
    substance2: "IBUPROFÈNE",
    level: "contre-indiquee",
    description: "AVK + AINS : risque hémorragique digestif majeur. L'ibuprofène augmente l'effet anticoagulant et agresse la muqueuse gastrique.",
    cat: "Association contre-indiquée. Si prise concomitante, rechercher des signes d'hémorragie digestive (méléna, hématémèse).",
  },
  // Méthotrexate + AINS à dose anti-inflammatoire
  {
    substance1: "MÉTHOTREXATE",
    substance2: "IBUPROFÈNE",
    level: "contre-indiquee",
    description: "AINS + méthotrexate (doses >20 mg/semaine) : augmentation toxicité du méthotrexate (insuffisance rénale, pancytopénie).",
    cat: "Association contre-indiquée avec méthotrexate à doses anticancéreuses. Précaution d'emploi avec doses rhumatologiques.",
  },
  // Bêtabloquant + ICa bradycardisant
  {
    substance1: "BISOPROLOL",
    substance2: "DILTIAZEM",
    level: "contre-indiquee",
    description: "Bêtabloquant + inhibiteur calcique bradycardisant : risque de bradycardie sévère, BAV, insuffisance cardiaque.",
    cat: "Association contre-indiquée (sauf insuffisance cardiaque chronique sous surveillance stricte). ECG si association découverte.",
  },
  {
    substance1: "PROPRANOLOL",
    substance2: "DILTIAZEM",
    level: "contre-indiquee",
    description: "Bêtabloquant non sélectif + ICa bradycardisant : risque de bradycardie sévère et BAV de haut degré.",
    cat: "Association contre-indiquée. Risque d'arrêt cardiaque.",
  },
  // Colchicine + macrolides (clarithromycine)
  {
    substance1: "COLCHICINE",
    substance2: "CLARITHROMYCINE",
    level: "contre-indiquee",
    description: "La clarithromycine augmente massivement les taux de colchicine (inhibition CYP3A4 + P-gp). Risque de toxicité fatale.",
    cat: "Association formellement contre-indiquée. Si les deux médicaments sont trouvés, alerter le CRRA 15.",
  },

  // ═══════════════════════════════════════
  // DÉCONSEILLÉES
  // ═══════════════════════════════════════

  // Opioïdes + BZD
  {
    substance1: "MORPHINE",
    substance2: "ALPRAZOLAM",
    level: "deconseillee",
    description: "Opioïde + benzodiazépine : risque majeur de dépression respiratoire, coma et décès. Cause fréquente de décès par surdosage.",
    cat: "Association très dangereuse. Surveiller FR, SpO2, conscience. Naloxone + flumazénil à disposition. Signaler au CRRA 15.",
  },
  {
    substance1: "MORPHINE",
    substance2: "DIAZÉPAM",
    level: "deconseillee",
    description: "Opioïde + BZD : dépression respiratoire synergique, risque vital.",
    cat: "Surveillance respiratoire renforcée. Naloxone et flumazénil à disposition.",
  },
  {
    substance1: "TRAMADOL",
    substance2: "ALPRAZOLAM",
    level: "deconseillee",
    description: "Opioïde faible + BZD : risque de dépression respiratoire et de sédation excessive.",
    cat: "Association déconseillée. Surveillance FR et conscience.",
  },
  {
    substance1: "CODÉINE",
    substance2: "BROMAZÉPAM",
    level: "deconseillee",
    description: "Opioïde + BZD : potentialisation de la dépression du SNC.",
    cat: "Surveillance rapprochée si association en cours.",
  },
  // Aspirine doses antiagrégantes + clopidogrel (synergie hémorragique)
  {
    substance1: "ACIDE ACÉTYLSALICYLIQUE",
    substance2: "CLOPIDOGREL",
    level: "deconseillee",
    description: "Double antiagrégation : synergie antiplaquettaire mais risque hémorragique majoré.",
    cat: "Association justifiée en post-SCA/stent (double antiagrégation prescrite). En dehors de ce contexte, risque hémorragique majoré. Signaler au médecin.",
  },
  // Lithium + AINS
  {
    substance1: "LITHIUM",
    substance2: "IBUPROFÈNE",
    level: "deconseillee",
    description: "Les AINS augmentent la lithiémie (réduction excrétion rénale). Risque d'intoxication au lithium.",
    cat: "Si les deux sont pris ensemble, rechercher signes d'intoxication lithium (tremblements, confusion, diarrhée). Contrôle lithiémie.",
  },
  // Digoxine + amiodarone
  {
    substance1: "DIGOXINE",
    substance2: "AMIODARONE",
    level: "deconseillee",
    description: "L'amiodarone augmente la digoxinémie de 70-100%. Risque de surdosage digitalique (bradycardie, arythmie).",
    cat: "Réduire dose digoxine de moitié si amiodarone ajoutée. Surveillance ECG. Dosage digoxinémie.",
  },

  // ═══════════════════════════════════════
  // PRÉCAUTION D'EMPLOI
  // ═══════════════════════════════════════

  // Bêtabloquant + insuline
  {
    substance1: "BISOPROLOL",
    substance2: "INSULINE",
    level: "precaution",
    description: "Les bêtabloquants masquent les signes d'hypoglycémie (tachycardie, tremblements). Seules les sueurs persistent.",
    cat: "Informer le patient diabétique. Renforcer l'autosurveillance glycémique. En intervention, penser à l'hypoglycémie même sans tachycardie.",
  },
  {
    substance1: "PROPRANOLOL",
    substance2: "INSULINE",
    level: "precaution",
    description: "BB non sélectif + insuline : masque les signes d'hypoglycémie ET prolonge l'hypoglycémie (blocage glycogénolyse).",
    cat: "Risque plus élevé qu'avec BB cardiosélectifs. Glycémie capillaire systématique en cas de malaise.",
  },
  // Metformine + produits de contraste iodés
  {
    substance1: "METFORMINE",
    substance2: "PRODUITS DE CONTRASTE IODÉS",
    level: "precaution",
    description: "Risque d'acidose lactique par insuffisance rénale fonctionnelle induite par les PCI.",
    cat: "Arrêt metformine 48h avant et après injection PCI. Reprise après contrôle fonction rénale.",
  },
  // BZD + alcool
  {
    substance1: "ALPRAZOLAM",
    substance2: "ÉTHANOL",
    level: "deconseillee",
    description: "BZD + alcool : potentialisation majeure de la dépression du SNC. Dépression respiratoire, coma.",
    cat: "Association très fréquente en intervention. Surveillance respiratoire renforcée. Flumazénil à disposition (mais CI si alcoolisme chronique avec risque de sevrage).",
  },
  {
    substance1: "DIAZÉPAM",
    substance2: "ÉTHANOL",
    level: "deconseillee",
    description: "BZD + alcool : dépression du SNC synergique.",
    cat: "Idem alprazolam + alcool. Surveillance rapprochée.",
  },
  // ISRS + tramadol → syndrome sérotoninergique
  {
    substance1: "TRAMADOL",
    substance2: "SERTRALINE",
    level: "precaution",
    description: "Opioïde sérotoninergique + ISRS : risque de syndrome sérotoninergique (agitation, myoclonies, hyperthermie, diarrhée).",
    cat: "Surveillance clinique. Si syndrome sérotoninergique : arrêt des deux médicaments, refroidissement, BZD si agitation, transfert SAMU.",
  },
  {
    substance1: "TRAMADOL",
    substance2: "FLUOXÉTINE",
    level: "precaution",
    description: "Tramadol + ISRS : risque de syndrome sérotoninergique + convulsions (seuil abaissé par les deux).",
    cat: "Surveillance clinique renforcée. Signaler l'association au CRRA 15.",
  },
  // Amlodipine + bêtabloquant (synergie hypotensive)
  {
    substance1: "AMLODIPINE",
    substance2: "BISOPROLOL",
    level: "precaution",
    description: "ICa dihydropyridine + BB : risque d'hypotension et d'insuffisance cardiaque. Association fréquente en cardiologie mais nécessite surveillance.",
    cat: "Association courante en HTA. Surveiller PA et FC. Risque si surdosage de l'un des deux.",
  },
  // Valproate + lamotrigine
  {
    substance1: "VALPROATE DE SODIUM",
    substance2: "LAMOTRIGINE",
    level: "precaution",
    description: "Le valproate double les taux de lamotrigine. Risque de toxicité cutanée (syndrome de Stevens-Johnson) et neurologique.",
    cat: "Réduction de dose de lamotrigine nécessaire. Surveiller signes cutanés (éruption, bulles).",
  },

  // ═══════════════════════════════════════
  // À PRENDRE EN COMPTE
  // ═══════════════════════════════════════
  {
    substance1: "PARACÉTAMOL",
    substance2: "WARFARINE",
    level: "a-prendre-en-compte",
    description: "Le paracétamol à doses élevées et prolongées (>2g/j pendant >1 semaine) peut augmenter l'INR.",
    cat: "Pas de risque en prise ponctuelle. Surveillance INR si usage prolongé à fortes doses.",
  },
  {
    substance1: "LÉVOTHYROXINE",
    substance2: "FER",
    level: "a-prendre-en-compte",
    description: "Les sels de fer réduisent l'absorption de la lévothyroxine. Espacement nécessaire.",
    cat: "Prendre à au moins 2h d'intervalle. Pas de risque en prise espacée.",
  },
  {
    substance1: "LÉVOTHYROXINE",
    substance2: "CALCIUM",
    level: "a-prendre-en-compte",
    description: "Le calcium réduit l'absorption de la lévothyroxine.",
    cat: "Espacement d'au moins 2h entre les prises.",
  },
  {
    substance1: "PARACÉTAMOL",
    substance2: "ALPRAZOLAM",
    level: "a-prendre-en-compte",
    description: "Pas d'interaction pharmacologique significative.",
    cat: "Association possible sans précaution particulière.",
  },
  {
    substance1: "SALBUTAMOL",
    substance2: "BISOPROLOL",
    level: "precaution",
    description: "BB cardiosélectif + β2-mimétique : antagonisme partiel. Le bisoprolol peut réduire l'efficacité du salbutamol à fortes doses.",
    cat: "En pratique, le bisoprolol cardiosélectif est toléré chez l'asthmatique léger. Éviter les BB non sélectifs (propranolol) chez l'asthmatique.",
  },
  {
    substance1: "SALBUTAMOL",
    substance2: "PROPRANOLOL",
    level: "contre-indiquee",
    description: "BB non sélectif chez patient asthmatique : risque de bronchospasme sévère. Le propranolol bloque les récepteurs β2 bronchiques.",
    cat: "Association formellement contre-indiquée chez l'asthmatique. Si bronchospasme sous BB non sélectif : salbutamol en nébulisation + adrénaline si sévère.",
  },
];

// ─── Main ──────────────────────────────────────────────

async function main() {
  console.log("⚡ MedOps — Seed des interactions médicamenteuses\n");

  // Vider et réinsérer
  const { error: delErr } = await supabase.from("interactions").delete().neq("id", 0);
  if (delErr) console.error("  ⚠️ Erreur suppression:", delErr.message);

  const rows = INTERACTIONS.map((i) => ({
    ...i,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("interactions").insert(rows);
  if (error) {
    console.error("  ❌ Erreur insert:", error.message);
    throw error;
  }

  console.log(`  ✅ ${INTERACTIONS.length} interactions insérées\n`);

  // Stats par niveau
  const counts = { "contre-indiquee": 0, deconseillee: 0, precaution: 0, "a-prendre-en-compte": 0 };
  for (const i of INTERACTIONS) counts[i.level]++;
  console.log(`  🔴 Contre-indiquées : ${counts["contre-indiquee"]}`);
  console.log(`  🟠 Déconseillées : ${counts.deconseillee}`);
  console.log(`  🔵 Précaution d'emploi : ${counts.precaution}`);
  console.log(`  🟢 À prendre en compte : ${counts["a-prendre-en-compte"]}`);

  console.log("\n✅ Seed terminé !");
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
