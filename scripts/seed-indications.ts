/**
 * Seed des indications en langage simple dans Supabase
 *
 * Ajoute un champ `indication` aux fiches surdosage existantes
 * + crée des fiches indication-only pour les DCI fréquentes sans fiche CAT
 *
 * Usage : npx tsx scripts/seed-indications.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Indications pour les 30 DCI déjà couvertes par les fiches CAT
const INDICATIONS_CAT: Record<string, string> = {
  "PARACÉTAMOL": "Douleurs légères à modérées, fièvre",
  "IBUPROFÈNE": "Douleurs inflammatoires, fièvre, arthrose, règles douloureuses",
  "TRAMADOL": "Douleurs modérées à sévères (opioïde faible)",
  "CODÉINE": "Douleurs modérées (en association avec paracétamol), toux sèche",
  "MORPHINE": "Douleurs sévères, douleurs cancéreuses, douleurs post-opératoires",
  "ALPRAZOLAM": "Anxiété sévère, crises d'angoisse, troubles anxieux invalidants",
  "BROMAZÉPAM": "Anxiété, insomnie liée à l'anxiété",
  "DIAZÉPAM": "Anxiété, contractures musculaires, sevrage alcoolique, convulsions",
  "ZOPICLONE": "Insomnie (traitement de courte durée)",
  "ZOLPIDEM": "Insomnie (traitement de courte durée)",
  "BISOPROLOL": "Hypertension artérielle, insuffisance cardiaque, angor stable",
  "PROPRANOLOL": "Hypertension, tremblements, migraines, anxiété de performance, hyperthyroïdie",
  "AMLODIPINE": "Hypertension artérielle, angor chronique stable",
  "DILTIAZEM": "Hypertension, angor stable, troubles du rythme supraventriculaires",
  "APIXABAN": "Prévention AVC (fibrillation auriculaire), traitement TVP/embolie pulmonaire",
  "RIVAROXABAN": "Prévention AVC (fibrillation auriculaire), traitement TVP/EP, prévention post-chirurgicale",
  "WARFARINE": "Prévention thromboembolique (fibrillation auriculaire, prothèse valvulaire, TVP/EP)",
  "METFORMINE": "Diabète de type 2 (traitement de première intention)",
  "INSULINE": "Diabète de type 1, diabète de type 2 insulino-requérant",
  "AMITRIPTYLINE": "Dépression, douleurs neuropathiques, migraines, énurésie",
  "VALPROATE DE SODIUM": "Épilepsie, trouble bipolaire (thymorégulateur)",
  "CARBAMAZÉPINE": "Épilepsie, névralgie du trijumeau, trouble bipolaire",
  "LÉVOTHYROXINE": "Hypothyroïdie, après ablation de la thyroïde",
  "COLCHICINE": "Crise de goutte, prévention des accès goutteux, péricardite",
  "LITHIUM": "Trouble bipolaire (thymorégulateur), prévention des rechutes",
  "DIGOXINE": "Insuffisance cardiaque, fibrillation auriculaire (contrôle de fréquence)",
  "SALBUTAMOL": "Crise d'asthme, bronchospasme, BPCO (traitement de secours)",
  "PREDNISONE": "Maladies inflammatoires (asthme, polyarthrite, maladies auto-immunes), allergies sévères",
  "AMIODARONE": "Troubles du rythme cardiaque graves (fibrillation auriculaire, tachycardie ventriculaire)",
  "CLOPIDOGREL": "Prévention cardiovasculaire après AVC, infarctus, stent coronaire",
};

// Indications pour 30 DCI supplémentaires fréquentes en intervention SP (sans fiche CAT)
const INDICATIONS_EXTRA: Array<{ dci: string; indication: string }> = [
  { dci: "RAMIPRIL", indication: "Hypertension artérielle, insuffisance cardiaque, protection rénale (diabète)" },
  { dci: "ÉNALAPRIL", indication: "Hypertension artérielle, insuffisance cardiaque" },
  { dci: "LOSARTAN", indication: "Hypertension artérielle, néphropathie diabétique" },
  { dci: "VALSARTAN", indication: "Hypertension artérielle, insuffisance cardiaque post-infarctus" },
  { dci: "ATORVASTATINE", indication: "Excès de cholestérol, prévention cardiovasculaire" },
  { dci: "ROSUVASTATINE", indication: "Excès de cholestérol, prévention cardiovasculaire" },
  { dci: "SIMVASTATINE", indication: "Excès de cholestérol, prévention cardiovasculaire" },
  { dci: "OMÉPRAZOLE", indication: "Reflux gastro-œsophagien (RGO), ulcère gastrique, protection gastrique sous AINS" },
  { dci: "PANTOPRAZOLE", indication: "RGO, ulcère gastrique, prévention des lésions gastriques" },
  { dci: "ÉSOMÉPRAZOLE", indication: "RGO, ulcère gastrique" },
  { dci: "SERTRALINE", indication: "Dépression, troubles anxieux, TOC, stress post-traumatique" },
  { dci: "FLUOXÉTINE", indication: "Dépression, boulimie, TOC" },
  { dci: "PAROXÉTINE", indication: "Dépression, troubles anxieux, TOC, phobie sociale" },
  { dci: "ESCITALOPRAM", indication: "Dépression, troubles anxieux généralisés, trouble panique" },
  { dci: "VENLAFAXINE", indication: "Dépression, anxiété généralisée, phobie sociale" },
  { dci: "MIRTAZAPINE", indication: "Dépression (notamment avec insomnie et perte de poids)" },
  { dci: "FUROSÉMIDE", indication: "Insuffisance cardiaque (œdèmes), hypertension, œdème pulmonaire aigu" },
  { dci: "HYDROCHLOROTHIAZIDE", indication: "Hypertension artérielle, œdèmes" },
  { dci: "SPIRONOLACTONE", indication: "Insuffisance cardiaque, hypertension, hyperaldostéronisme" },
  { dci: "GABAPENTINE", indication: "Douleurs neuropathiques, épilepsie" },
  { dci: "PRÉGABALINE", indication: "Douleurs neuropathiques, anxiété généralisée, épilepsie" },
  { dci: "LÉVÉTIRACÉTAM", indication: "Épilepsie (crises partielles et généralisées)" },
  { dci: "LAMOTRIGINE", indication: "Épilepsie, trouble bipolaire (prévention des épisodes dépressifs)" },
  { dci: "AMOXICILLINE", indication: "Infections bactériennes (ORL, pulmonaires, urinaires, dentaires)" },
  { dci: "AZITHROMYCINE", indication: "Infections bactériennes (ORL, pulmonaires, génitales)" },
  { dci: "DOXYCYCLINE", indication: "Infections bactériennes, acné, paludisme (prévention)" },
  { dci: "ACIDE ACÉTYLSALICYLIQUE", indication: "Prévention cardiovasculaire (faible dose), douleur, fièvre, inflammation (dose anti-inflammatoire)" },
  { dci: "PHLOROGLUCINOL", indication: "Douleurs spasmodiques (digestives, gynécologiques, urinaires)" },
  { dci: "BACLOFÈNE", indication: "Spasticité musculaire (SEP, AVC), aide au sevrage alcoolique" },
  { dci: "METOCLOPRAMIDE", indication: "Nausées et vomissements" },
];

async function main() {
  console.log("💊 MedOps — Seed des indications en langage simple\n");

  // 1. Mettre à jour les fiches surdosage existantes avec l'indication
  console.log("🔗 Enrichissement des 30 fiches CAT avec indication...");

  // D'abord, ajouter la colonne indication si elle n'existe pas
  // (on utilise upsert avec le champ existant dci)
  let updatedCount = 0;
  for (const [dci, indication] of Object.entries(INDICATIONS_CAT)) {
    const { error } = await supabase
      .from("surdosage")
      .update({ indication })
      .eq("dci", dci);

    if (error) {
      console.error(`  ⚠️ ${dci}: ${error.message}`);
    } else {
      updatedCount++;
    }
  }
  console.log(`  ✅ ${updatedCount} fiches CAT enrichies avec indication\n`);

  // 2. Créer des fiches indication-only pour les DCI supplémentaires
  console.log("📝 Ajout de 30 indications supplémentaires...");

  const extraRows = INDICATIONS_EXTRA.map((e) => ({
    dci: e.dci,
    indication: e.indication,
    dose_toxique: null,
    symptomes: null,
    cat: null,
    antidote: null,
    gravite: null,
    delai_action: null,
    orientation: null,
    updated_at: new Date().toISOString(),
  }));

  // Upsert pour ne pas dupliquer si le script est relancé
  const { error: insertErr } = await supabase
    .from("surdosage")
    .upsert(extraRows, { onConflict: "dci" });

  if (insertErr) {
    console.error(`  ❌ Erreur insert: ${insertErr.message}`);
  } else {
    console.log(`  ✅ ${INDICATIONS_EXTRA.length} indications ajoutées\n`);
  }

  // 3. Résumé
  const { count } = await supabase
    .from("surdosage")
    .select("*", { count: "exact", head: true });

  console.log(`📋 Total fiches en base : ${count}`);
  console.log(`   dont ${updatedCount} avec CAT + indication`);
  console.log(`   dont ${INDICATIONS_EXTRA.length} avec indication seule`);
  console.log("\n✅ Seed terminé !");
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
