/**
 * Seed des fiches surdosage / CAT dans Supabase
 *
 * Usage : npx tsx scripts/seed-surdosage.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── FICHES SURDOSAGE / CAT ────────────────────────────
// Sources : Vidal, ANSM RCP, protocoles SAMU, littérature toxicologique
// Rédigées pour usage opérationnel sapeurs-pompiers

interface FicheSurdosage {
  dci: string;
  dose_toxique: string;
  symptomes: string[];
  cat: string[];
  antidote: string;
  gravite: "faible" | "moderee" | "elevee" | "vitale";
  delai_action: string;
  orientation: string;
}

const FICHES: FicheSurdosage[] = [
  // ═══════════════════════════════════════
  // ANTALGIQUES
  // ═══════════════════════════════════════
  {
    dci: "PARACÉTAMOL",
    dose_toxique: ">150 mg/kg (adulte) ou >75 mg/kg (sujet à risque : alcoolisme, dénutrition, hépatopathie)",
    symptomes: [
      "Phase initiale (0-24h) : asymptomatique ou nausées/vomissements",
      "Phase hépatique (24-72h) : douleur hypochondre droit, cytolyse hépatique",
      "Phase critique (72-96h) : insuffisance hépatique aiguë, encéphalopathie, coagulopathie",
    ],
    cat: [
      "Paracétamolémie à H+4 post-ingestion",
      "Bilan hépatique (ASAT, ALAT, TP/INR)",
      "Charbon activé si <1h post-ingestion (50g adulte)",
      "N-acétylcystéine IV (protocole Prescott) si dose toxique ou paracétamolémie au-dessus de la ligne de traitement",
      "Surveillance hépatique répétée",
    ],
    antidote: "N-ACÉTYLCYSTÉINE (Fluimucil) IV — Protocole Prescott : 150 mg/kg en 1h, puis 50 mg/kg en 4h, puis 100 mg/kg en 16h",
    gravite: "vitale",
    delai_action: "Symptômes retardés 24-72h — cytolyse hépatique souvent silencieuse initialement",
    orientation: "Transfert SAMU/Centre antipoison. Réanimation si signes hépatiques.",
  },
  {
    dci: "IBUPROFÈNE",
    dose_toxique: ">400 mg/kg (grave). 100-400 mg/kg : modéré",
    symptomes: [
      "Nausées, vomissements, douleurs épigastriques",
      "Céphalées, vertiges, acouphènes",
      "Insuffisance rénale aiguë (doses élevées)",
      "Cas graves : convulsions, acidose métabolique, coma",
    ],
    cat: [
      "Charbon activé si <1h et dose >100 mg/kg",
      "Protection gastrique (IPP IV)",
      "Surveillance rénale (créatinine, diurèse)",
      "Traitement symptomatique",
    ],
    antidote: "Pas d'antidote spécifique",
    gravite: "moderee",
    delai_action: "Symptômes en 1-4h",
    orientation: "SAU si dose >100 mg/kg. Réanimation si convulsions ou insuffisance rénale.",
  },
  {
    dci: "TRAMADOL",
    dose_toxique: ">500 mg (adulte). Risque majoré si association BZD/alcool/opioïdes",
    symptomes: [
      "Somnolence, confusion, myosis",
      "Nausées, vomissements",
      "Convulsions (fréquentes avec tramadol)",
      "Dépression respiratoire (doses élevées)",
      "Syndrome sérotoninergique si association ISRS",
    ],
    cat: [
      "Surveillance respiratoire continue (SpO2, FR)",
      "Protection des voies aériennes",
      "Naloxone si dépression respiratoire",
      "Benzodiazépines si convulsions (diazépam 10mg IV)",
    ],
    antidote: "NALOXONE (Narcan) 0,4 mg IV/IM, renouvelable toutes les 2-3 min (max 10 mg). Attention : demi-vie naloxone < tramadol",
    gravite: "elevee",
    delai_action: "Symptômes en 1-2h (forme LI) à 4-6h (forme LP)",
    orientation: "Transfert SAMU. Réanimation si dépression respiratoire ou convulsions.",
  },
  {
    dci: "CODÉINE",
    dose_toxique: ">3 mg/kg (enfant : très sensible). Métaboliseurs ultra-rapides CYP2D6 à risque accru",
    symptomes: [
      "Somnolence progressive, myosis serré",
      "Dépression respiratoire (bradypnée <10/min)",
      "Nausées, vomissements, constipation",
      "Coma, collapsus cardiovasculaire (doses massives)",
    ],
    cat: [
      "Libération VAS, PLS si trouble conscience",
      "Surveillance respiratoire continue",
      "Naloxone si FR <10/min ou SpO2 <92%",
      "Ventilation assistée si nécessaire",
    ],
    antidote: "NALOXONE (Narcan) 0,4 mg IV/IM, renouvelable. Titrer jusqu'à FR >12/min",
    gravite: "elevee",
    delai_action: "Symptômes en 30 min à 2h",
    orientation: "Transfert SAMU. Surveillance prolongée (demi-vie codéine > naloxone).",
  },
  {
    dci: "MORPHINE",
    dose_toxique: ">0,5 mg/kg per os (non tolérant). Dose létale très variable selon tolérance",
    symptomes: [
      "Triade opioïde : coma + myosis + dépression respiratoire",
      "Bradypnée sévère (FR <8/min)",
      "Hypotension, bradycardie",
      "Oedème pulmonaire lésionnel",
    ],
    cat: [
      "URGENCE VITALE — libération VAS immédiate",
      "Ventilation au BAVU si FR <8/min",
      "Naloxone IV titrée",
      "Monitorage SpO2/FR/PA continu",
      "Ne PAS attendre la réponse à la naloxone pour ventiler",
    ],
    antidote: "NALOXONE (Narcan) 0,04 mg IV puis titration par 0,04 mg toutes les 2 min. Relais IVSE si nécessaire (demi-vie morphine > naloxone)",
    gravite: "vitale",
    delai_action: "Symptômes rapides : 15-30 min (per os), immédiat (IV)",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation.",
  },

  // ═══════════════════════════════════════
  // PSYCHOTROPES — BENZODIAZÉPINES
  // ═══════════════════════════════════════
  {
    dci: "ALPRAZOLAM",
    dose_toxique: ">10 mg (adulte). Risque vital si association alcool/opioïdes",
    symptomes: [
      "Somnolence, confusion, ataxie",
      "Dysarthrie, hypotonie",
      "Dépression respiratoire (surtout si co-ingestion)",
      "Coma calme hypotonique",
    ],
    cat: [
      "Libération VAS, PLS",
      "Surveillance respiratoire continue",
      "Flumazénil uniquement si dépression respiratoire ET pas de co-ingestion proconvulsivante (AD tricycliques, alcool sevrage)",
      "Intubation si nécessaire",
    ],
    antidote: "FLUMAZÉNIL (Anexate) 0,2 mg IV lent, renouvelable par 0,1 mg toutes les 60s (max 1 mg). CONTRE-INDIQUÉ si épilepsie ou co-ingestion tricycliques",
    gravite: "elevee",
    delai_action: "Symptômes en 30 min à 2h",
    orientation: "Transfert SAMU. Réanimation si coma ou dépression respiratoire.",
  },
  {
    dci: "BROMAZÉPAM",
    dose_toxique: ">60 mg (adulte). Même profil que alprazolam",
    symptomes: [
      "Somnolence, confusion, ataxie",
      "Hypotonie musculaire",
      "Dépression respiratoire si association",
      "Coma calme",
    ],
    cat: [
      "Libération VAS, PLS",
      "Surveillance respiratoire continue",
      "Flumazénil si dépression respiratoire isolée (voir CI)",
      "Traitement symptomatique",
    ],
    antidote: "FLUMAZÉNIL (Anexate) 0,2 mg IV — mêmes modalités que pour alprazolam",
    gravite: "elevee",
    delai_action: "Symptômes en 1-2h",
    orientation: "Transfert SAMU si troubles conscience ou dépression respiratoire.",
  },
  {
    dci: "DIAZÉPAM",
    dose_toxique: ">100 mg (adulte). Demi-vie très longue (20-100h)",
    symptomes: [
      "Somnolence prolongée, confusion",
      "Ataxie, hypotonie",
      "Dépression respiratoire (co-ingestion++)",
      "Coma calme, hypothermie",
    ],
    cat: [
      "PLS, libération VAS",
      "Surveillance prolongée (demi-vie longue)",
      "Flumazénil si indication (voir CI)",
      "Réchauffement si hypothermie",
    ],
    antidote: "FLUMAZÉNIL (Anexate) — idem alprazolam. Attention : effet flumazénil < diazépam → risque de resédation",
    gravite: "elevee",
    delai_action: "Symptômes en 30 min à 2h. Surveillance prolongée (métabolites actifs)",
    orientation: "Transfert SAMU. Surveillance ≥24h (demi-vie longue).",
  },
  {
    dci: "ZOPICLONE",
    dose_toxique: ">150 mg (adulte)",
    symptomes: [
      "Somnolence, confusion",
      "Goût métallique amer (caractéristique)",
      "Dépression respiratoire modérée",
      "Coma (doses massives)",
    ],
    cat: [
      "PLS, surveillance respiratoire",
      "Flumazénil efficace (zopiclone agit sur récepteurs BZD)",
      "Traitement symptomatique",
    ],
    antidote: "FLUMAZÉNIL (Anexate) 0,2 mg IV — efficace car Z-drug agit sur site BZD. Mêmes précautions que BZD",
    gravite: "moderee",
    delai_action: "Symptômes en 30 min à 1h",
    orientation: "SAU. SAMU si coma ou dépression respiratoire.",
  },
  {
    dci: "ZOLPIDEM",
    dose_toxique: ">100 mg (adulte)",
    symptomes: [
      "Somnolence rapide, confusion",
      "Ataxie, chutes",
      "Dépression respiratoire (association++)",
      "Hallucinations, comportements paradoxaux",
    ],
    cat: [
      "PLS, surveillance respiratoire",
      "Flumazénil si dépression respiratoire",
      "Contention douce si agitation paradoxale",
    ],
    antidote: "FLUMAZÉNIL (Anexate) — efficace (Z-drug). 0,2 mg IV",
    gravite: "moderee",
    delai_action: "Symptômes rapides : 15-30 min",
    orientation: "SAU. SAMU si dépression respiratoire.",
  },

  // ═══════════════════════════════════════
  // CARDIOVASCULAIRE — BÊTABLOQUANTS
  // ═══════════════════════════════════════
  {
    dci: "BISOPROLOL",
    dose_toxique: ">100 mg (adulte). Intoxication potentiellement létale",
    symptomes: [
      "Bradycardie sévère (<40 bpm)",
      "BAV de haut degré (II-III)",
      "Hypotension artérielle sévère",
      "Bronchospasme",
      "Insuffisance cardiaque aiguë, choc cardiogénique",
    ],
    cat: [
      "URGENCE VITALE — monitorage ECG continu",
      "Atropine 0,5-1 mg IV (peut être inefficace)",
      "Glucagon IV (antidote spécifique)",
      "Isoprénaline si échec atropine/glucagon",
      "SEES (sonde entraînement) si BAV complet",
      "Remplissage vasculaire prudent",
    ],
    antidote: "GLUCAGON 1-5 mg IV en bolus, puis 2-10 mg/h IVSE. Si échec : ISOPRÉNALINE 5 µg/min IVSE",
    gravite: "vitale",
    delai_action: "Symptômes en 1-4h. Surveillance ≥24h",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation / USIC.",
  },
  {
    dci: "PROPRANOLOL",
    dose_toxique: ">1 g (adulte). Plus toxique que bisoprolol (non sélectif + effet stabilisant de membrane)",
    symptomes: [
      "Bradycardie profonde, BAV",
      "Hypotension, collapsus",
      "Convulsions (effet stabilisant de membrane)",
      "QRS élargi à l'ECG",
      "Bronchospasme sévère",
      "Hypoglycémie (masquée)",
    ],
    cat: [
      "URGENCE VITALE — ECG 12 dérivations immédiat",
      "Atropine 1 mg IV",
      "Glucagon IV bolus + relais",
      "Sels de sodium molaires (84‰) si QRS >120ms",
      "Isoprénaline, SEES",
      "Dextrose IV (hypoglycémie)",
    ],
    antidote: "GLUCAGON 5-10 mg IV bolus + SELS SODIUM MOLAIRES (84‰) 250 mL IV si QRS élargi",
    gravite: "vitale",
    delai_action: "Symptômes en 30 min à 2h. Risque d'arrêt cardiaque brutal",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation.",
  },

  // ═══════════════════════════════════════
  // CARDIOVASCULAIRE — INHIBITEURS CALCIQUES
  // ═══════════════════════════════════════
  {
    dci: "AMLODIPINE",
    dose_toxique: ">50 mg (adulte)",
    symptomes: [
      "Hypotension sévère, vasodilatation",
      "Tachycardie réflexe (dihydropyridine)",
      "Choc vasoplégique",
      "Hyperglycémie",
    ],
    cat: [
      "Remplissage vasculaire NaCl 0,9%",
      "Vasopresseurs (noradrénaline)",
      "Gluconate de calcium IV 1-2 g",
      "Insuline forte dose + glucose (protocole IFD)",
      "ECMO si choc réfractaire",
    ],
    antidote: "GLUCONATE DE CALCIUM 10% : 20-30 mL IV lent (adulte). Insuline forte dose si échec : 1 UI/kg bolus + 0,5 UI/kg/h IVSE + G30%",
    gravite: "vitale",
    delai_action: "Symptômes en 2-6h (amlodipine LP). Effet prolongé (demi-vie 30-50h)",
    orientation: "Transfert SAMU. Réanimation / USIC.",
  },
  {
    dci: "DILTIAZEM",
    dose_toxique: ">600 mg (adulte)",
    symptomes: [
      "Bradycardie + hypotension (double effet)",
      "BAV de haut degré",
      "Choc cardiogénique",
      "Asystolie (cas graves)",
    ],
    cat: [
      "URGENCE VITALE — ECG + monitorage continu",
      "Atropine 1 mg IV",
      "Gluconate de calcium IV",
      "Isoprénaline si BAV",
      "SEES si besoin",
      "Insuline forte dose si choc réfractaire",
    ],
    antidote: "GLUCONATE DE CALCIUM 10% : 20-30 mL IV + ATROPINE 1 mg IV + ISOPRÉNALINE si BAV persistant",
    gravite: "vitale",
    delai_action: "Symptômes en 1-4h (forme LP : 6-12h)",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation / USIC.",
  },

  // ═══════════════════════════════════════
  // ANTICOAGULANTS
  // ═══════════════════════════════════════
  {
    dci: "APIXABAN",
    dose_toxique: "Pas de dose toxique définie. Risque = hémorragie",
    symptomes: [
      "Hémorragie active (extériorisée ou non)",
      "Hématomes spontanés",
      "Hématurie, méléna, épistaxis sévère",
      "Choc hémorragique si saignement majeur",
    ],
    cat: [
      "Compression mécanique si hémorragie extériorisée",
      "Bilan : NFS, TP, anti-Xa si disponible",
      "Acide tranexamique (Exacyl) 1g IV",
      "Transfusion CGR si Hb <7 g/dL ou choc",
      "CCP (FEIBA/Octaplex) si pronostic vital engagé",
    ],
    antidote: "Pas d'antidote spécifique largement disponible. ANDEXANET ALFA (si disponible). Sinon : FEIBA 50 UI/kg ou CCP 50 UI/kg + ACIDE TRANEXAMIQUE 1g IV",
    gravite: "vitale",
    delai_action: "Hémorragie possible à tout moment. Demi-vie 8-15h",
    orientation: "Transfert SAMU IMMÉDIAT si hémorragie active. SAU si surdosage sans saignement.",
  },
  {
    dci: "RIVAROXABAN",
    dose_toxique: "Pas de dose toxique définie. Risque hémorragique identique à apixaban",
    symptomes: [
      "Hémorragie active",
      "Hématomes spontanés",
      "Hémorragie digestive, intracrânienne",
      "Choc hémorragique",
    ],
    cat: [
      "Compression mécanique",
      "Acide tranexamique 1g IV",
      "Transfusion si besoin",
      "CCP si pronostic vital",
    ],
    antidote: "ANDEXANET ALFA (si disponible). Sinon : CCP (Octaplex) 50 UI/kg + ACIDE TRANEXAMIQUE 1g IV",
    gravite: "vitale",
    delai_action: "Demi-vie 5-13h",
    orientation: "Transfert SAMU si hémorragie active.",
  },
  {
    dci: "WARFARINE",
    dose_toxique: "Surdosage = INR >5. Risque hémorragique si INR >9",
    symptomes: [
      "Hémorragie (ecchymoses, épistaxis, gingivorragies)",
      "Hématurie, méléna",
      "Hémorragie intracrânienne (complication redoutée)",
    ],
    cat: [
      "Mesure INR en urgence",
      "Vitamine K1 per os (INR 5-9 sans saignement : 1-2 mg) ou IV (hémorragie active : 10 mg IV lent)",
      "CCP (Octaplex) si hémorragie grave ou INR >20",
    ],
    antidote: "VITAMINE K1 (Konakion) : 10 mg IV lent si hémorragie. Délai d'action : 6-12h. + CCP 25 UI/kg si urgence vitale (effet immédiat)",
    gravite: "elevee",
    delai_action: "Surdosage chronique : progressif. Surdosage aigu : 24-48h pour effet anticoagulant max",
    orientation: "SAU si INR >5. SAMU si hémorragie active ou INR >9.",
  },

  // ═══════════════════════════════════════
  // ANTIDIABÉTIQUES
  // ═══════════════════════════════════════
  {
    dci: "METFORMINE",
    dose_toxique: ">5 g (adulte). Acidose lactique = complication redoutée (mortalité ~50%)",
    symptomes: [
      "Nausées, vomissements, douleurs abdominales",
      "Diarrhée profuse",
      "Acidose lactique : polypnée de Kussmaul, hypothermie, troubles conscience",
      "Collapsus cardiovasculaire, arrêt cardiaque",
    ],
    cat: [
      "URGENCE VITALE si acidose lactique",
      "Bilan : lactates, GDS, glycémie, créatinine",
      "Bicarbonate de sodium IV si pH <7,1",
      "Hémodialyse en urgence (épuration de la metformine + correction acidose)",
      "Réhydratation IV",
    ],
    antidote: "Pas d'antidote spécifique. HÉMODIALYSE en urgence = traitement de référence de l'acidose lactique à la metformine",
    gravite: "vitale",
    delai_action: "Acidose lactique : installation en 12-24h, parfois plus rapide si IR associée",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation avec capacité d'hémodialyse.",
  },
  {
    dci: "INSULINE",
    dose_toxique: "Toute dose inadaptée. Risque vital = hypoglycémie sévère",
    symptomes: [
      "Hypoglycémie : sueurs, tremblements, pâleur, tachycardie",
      "Confusion, troubles du comportement, agressivité",
      "Convulsions",
      "Coma hypoglycémique",
    ],
    cat: [
      "Glycémie capillaire IMMÉDIATE",
      "Si conscient : resucrage oral (15g sucre = 3 morceaux ou jus de fruit)",
      "Si inconscient : G30% 20-50 mL IV (ou G10% 150 mL)",
      "Glucagon 1 mg IM/SC si pas de voie veineuse",
      "Recontrôle glycémie à 15 min",
      "Surveillance prolongée (insulines LP : effet prolongé)",
    ],
    antidote: "GLUCOSE IV : G30% 20-50 mL IVD (ou G10% 150 mL). GLUCAGON 1 mg IM si pas d'abord veineux",
    gravite: "vitale",
    delai_action: "Hypoglycémie : minutes à heures selon type d'insuline (rapide vs LP)",
    orientation: "SAMU si coma ou convulsions. SAU si hypoglycémie corrigée (surveillance).",
  },

  // ═══════════════════════════════════════
  // ANTIDÉPRESSEURS
  // ═══════════════════════════════════════
  {
    dci: "AMITRIPTYLINE",
    dose_toxique: ">500 mg (adulte). Intoxication très dangereuse",
    symptomes: [
      "Syndrome anticholinergique : mydriase, bouche sèche, rétention urinaire, tachycardie",
      "Troubles de conscience rapides → coma",
      "Convulsions",
      "Troubles de conduction : QRS élargi (>120ms), QT allongé",
      "Arythmies ventriculaires, torsades de pointe",
      "Choc cardiogénique",
    ],
    cat: [
      "URGENCE VITALE — ECG 12 dérivations IMMÉDIAT",
      "Si QRS >120ms : sels de sodium molaires (84‰) 250 mL IV",
      "Charbon activé si <1h",
      "BZD si convulsions (diazépam 10 mg IV)",
      "NE PAS donner de flumazénil (risque de convulsions)",
      "Intubation précoce si Glasgow ≤8",
    ],
    antidote: "SELS DE SODIUM MOLAIRES (84‰) : 250 mL IV si QRS >120ms (peut être répété). Objectif : rétrécir les QRS",
    gravite: "vitale",
    delai_action: "Symptômes rapides : 1-4h. Détérioration brutale possible",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation.",
  },

  // ═══════════════════════════════════════
  // NEUROLOGIE — ANTIÉPILEPTIQUES
  // ═══════════════════════════════════════
  {
    dci: "VALPROATE DE SODIUM",
    dose_toxique: ">200 mg/kg",
    symptomes: [
      "Troubles de conscience, coma",
      "Hyperammoniémie (encéphalopathie)",
      "Acidose métabolique",
      "Hépatotoxicité, pancréatite",
      "Thrombopénie, troubles de coagulation",
    ],
    cat: [
      "Charbon activé si <1h",
      "Bilan : ammoniémie, GDS, bilan hépatique, NFS",
      "L-carnitine IV (antidote de l'hyperammoniémie)",
      "Hémodialyse si coma avec valproatémie très élevée",
    ],
    antidote: "L-CARNITINE : 100 mg/kg IV (max 6g) puis 50 mg/kg toutes les 8h. Réduit l'hyperammoniémie",
    gravite: "elevee",
    delai_action: "Symptômes en 1-4h",
    orientation: "Transfert SAMU. Réanimation si coma ou ammoniémie élevée.",
  },
  {
    dci: "CARBAMAZÉPINE",
    dose_toxique: ">20 mg/kg",
    symptomes: [
      "Ataxie, nystagmus, diplopie",
      "Troubles de conscience, coma",
      "Convulsions (paradoxales)",
      "Troubles de conduction cardiaque (BAV, QRS élargi)",
      "Dépression respiratoire",
    ],
    cat: [
      "ECG + monitorage continu",
      "Charbon activé répété (absorption prolongée, cycle entéro-hépatique)",
      "BZD si convulsions",
      "Sels de sodium molaires si QRS élargi",
      "Intubation si nécessaire",
    ],
    antidote: "Pas d'antidote spécifique. Charbon activé multi-doses : 25g toutes les 4h (cycle entéro-hépatique)",
    gravite: "elevee",
    delai_action: "Symptômes en 1-4h. Absorption prolongée (formes LP : jusqu'à 24h)",
    orientation: "Transfert SAMU. Réanimation si troubles de conduction ou coma.",
  },

  // ═══════════════════════════════════════
  // DIVERS — MÉDICAMENTS FRÉQUENTS
  // ═══════════════════════════════════════
  {
    dci: "LÉVOTHYROXINE",
    dose_toxique: "Ingestion massive >5 mg. Surdosage chronique : signes de thyrotoxicose",
    symptomes: [
      "Tachycardie, palpitations, arythmies",
      "Agitation, tremblements, insomnie",
      "Hyperthermie, sueurs",
      "Diarrhée, amaigrissement",
      "Cas graves : orage thyroïdien (fièvre >40°C, arythmie, défaillance cardiaque)",
    ],
    cat: [
      "Arrêt du traitement",
      "Bêtabloquants si tachycardie (propranolol 40 mg PO ou 1 mg IV)",
      "Surveillance cardioscopique",
      "Charbon activé si ingestion massive <1h",
    ],
    antidote: "PROPRANOLOL : 40 mg PO ou 1 mg IV (contrôle symptômes adrénergiques). Pas d'antidote direct",
    gravite: "moderee",
    delai_action: "Surdosage aigu : effet retardé 2-5 jours (demi-vie longue). Surdosage chronique : progressif",
    orientation: "SAU. SAMU si orage thyroïdien ou arythmie.",
  },
  {
    dci: "COLCHICINE",
    dose_toxique: ">0,1 mg/kg. >10 mg = pronostic vital engagé. Dose létale : ~0,8 mg/kg",
    symptomes: [
      "Phase 1 (0-24h) : diarrhée profuse, vomissements, douleurs abdominales",
      "Phase 2 (24-72h) : défaillance multiviscérale, CIVD, aplasie médullaire",
      "Phase 3 (>J7) : récupération OU décès",
    ],
    cat: [
      "URGENCE VITALE — intoxication gravissime",
      "Charbon activé si <1h",
      "PAS d'antidote spécifique disponible",
      "Réanimation précoce et agressive",
      "Anticorps anti-colchicine (Fab) si disponibles (ATU)",
    ],
    antidote: "ANTICORPS ANTI-COLCHICINE (fragments Fab) : disponibilité très limitée (ATU). Sinon : traitement symptomatique uniquement",
    gravite: "vitale",
    delai_action: "Symptômes digestifs en 2-12h. Défaillance d'organes à J2-J3",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation. Centre antipoison.",
  },
  {
    dci: "LITHIUM",
    dose_toxique: "Lithiémie >1,5 mmol/L (thérapeutique : 0,6-1,2). >2,5 mmol/L = intoxication sévère",
    symptomes: [
      "Tremblements grossiers, fasciculations",
      "Confusion, somnolence",
      "Diarrhée, vomissements",
      "Ataxie, dysarthrie",
      "Convulsions, coma (lithiémie >3)",
      "Insuffisance rénale aiguë",
    ],
    cat: [
      "Arrêt immédiat du lithium",
      "Réhydratation IV NaCl 0,9% (ne pas restreindre le sodium)",
      "Bilan : lithiémie, créatinine, ionogramme",
      "Hémodialyse si lithiémie >2,5 ou signes neurologiques sévères",
      "NE PAS donner de diurétiques thiazidiques",
    ],
    antidote: "Pas d'antidote. HÉMODIALYSE = traitement de référence si lithiémie >2,5 mmol/L ou signes neurologiques sévères",
    gravite: "elevee",
    delai_action: "Surdosage aigu : 6-12h. Surdosage chronique : plus rapide (accumulation)",
    orientation: "Transfert SAMU. Réanimation avec capacité d'hémodialyse.",
  },
  {
    dci: "DIGOXINE",
    dose_toxique: ">3 mg (adulte). Marge thérapeutique étroite (digoxinémie thérapeutique : 0,8-2 ng/mL)",
    symptomes: [
      "Troubles digestifs : nausées, vomissements, diarrhée",
      "Troubles visuels : vision jaune/verte, halos lumineux",
      "Bradycardie, BAV",
      "Arythmies : ESV, TV, FV",
      "Hyperkaliémie (marqueur de gravité)",
    ],
    cat: [
      "URGENCE VITALE — ECG + monitorage continu",
      "Kaliémie en urgence (marqueur de gravité)",
      "Anticorps anti-digoxine = antidote spécifique",
      "Atropine 0,5-1 mg IV si bradycardie",
      "NE PAS donner de calcium IV (risque d'asystolie)",
      "SEES si BAV complet",
    ],
    antidote: "DIGIFAB (anticorps anti-digoxine Fab) : neutralisation équimolaire. Dose selon digoxinémie ou dose ingérée. 1 flacon neutralise ~0,5 mg de digoxine",
    gravite: "vitale",
    delai_action: "Symptômes en 1-6h (per os). Risque d'arythmie fatale",
    orientation: "Transfert SAMU IMMÉDIAT. Réanimation / USIC. Centre antipoison pour calcul dose Fab.",
  },
  {
    dci: "SALBUTAMOL",
    dose_toxique: ">20 mg per os. Rarement grave en isolé",
    symptomes: [
      "Tachycardie sinusale",
      "Tremblements fins des extrémités",
      "Agitation, anxiété",
      "Hypokaliémie (risque de troubles du rythme)",
      "Hyperglycémie transitoire",
    ],
    cat: [
      "Surveillance cardiaque (tachycardie, arythmie)",
      "Contrôle kaliémie",
      "Correction hypokaliémie si <3 mmol/L (KCl IV)",
      "Bêtabloquant cardiosélectif si tachycardie menaçante (atenolol 50 mg PO)",
    ],
    antidote: "Pas d'antidote spécifique. Correction de l'hypokaliémie. Bêtabloquant cardiosélectif si arythmie",
    gravite: "faible",
    delai_action: "Symptômes en 15-30 min. Résolution en 4-6h",
    orientation: "SAU si tachycardie >150 bpm ou hypokaliémie sévère.",
  },
  {
    dci: "PREDNISONE",
    dose_toxique: "Surdosage aigu rarement grave. Risque = effets chroniques du surdosage",
    symptomes: [
      "Surdosage aigu : troubles digestifs, hyperglycémie, agitation",
      "Surdosage chronique : syndrome de Cushing, ostéoporose, immunodépression",
      "Insuffisance surrénale à l'arrêt brutal",
    ],
    cat: [
      "Surdosage aigu : surveillance glycémique, traitement symptomatique",
      "Arrêt brutal après traitement prolongé : HYDROCORTISONE IV 100 mg si insuffisance surrénale aiguë",
      "NE JAMAIS arrêter brutalement un corticoïde au long cours",
    ],
    antidote: "Pas d'antidote. Si insuffisance surrénale aiguë (arrêt brutal) : HYDROCORTISONE 100 mg IV",
    gravite: "faible",
    delai_action: "Surdosage aigu : heures. Insuffisance surrénale : 12-48h après arrêt brutal",
    orientation: "SAU si insuffisance surrénale aiguë. Médecin traitant si surdosage chronique.",
  },
  {
    dci: "AMIODARONE",
    dose_toxique: ">2 g dose de charge. Toxicité chronique si dose cumulative élevée",
    symptomes: [
      "Bradycardie, BAV",
      "Hypotension",
      "Allongement QT → torsades de pointe (rare)",
      "Toxicité chronique : thyroïde, poumon (pneumopathie), foie, cornée",
    ],
    cat: [
      "ECG + monitorage continu",
      "Atropine si bradycardie",
      "Isoprénaline si BAV sévère",
      "SEES si nécessaire",
      "Magnésium IV si torsades de pointe (2g IV en 10 min)",
    ],
    antidote: "Pas d'antidote spécifique. Demi-vie très longue (40-55 jours). Traitement symptomatique prolongé",
    gravite: "elevee",
    delai_action: "Surdosage aigu : heures. Effets persistants des semaines (demi-vie 40-55j)",
    orientation: "SAMU si bradycardie ou troubles de conduction. USIC.",
  },
  {
    dci: "CLOPIDOGREL",
    dose_toxique: "Pas de dose toxique définie. Risque = hémorragie par inhibition plaquettaire irréversible",
    symptomes: [
      "Allongement du temps de saignement",
      "Hémorragies spontanées",
      "Ecchymoses, épistaxis, gingivorragies",
      "Hémorragie digestive ou intracrânienne (grave)",
    ],
    cat: [
      "Compression mécanique locale",
      "Bilan : NFS, TP, temps de saignement",
      "Transfusion plaquettaire si hémorragie sévère (les plaquettes transfusées ne sont pas inhibées)",
      "Acide tranexamique 1g IV si saignement actif",
    ],
    antidote: "Pas d'antidote spécifique. TRANSFUSION PLAQUETTAIRE si hémorragie grave (inhibition irréversible des plaquettes du patient)",
    gravite: "moderee",
    delai_action: "Effet antiplaquettaire dure 7-10 jours (durée de vie plaquettaire)",
    orientation: "SAU si saignement. SAMU si hémorragie grave.",
  },
];

// ─── Main ──────────────────────────────────────────────

async function main() {
  console.log("🚨 MedOps — Seed des fiches surdosage / CAT\n");

  // Vider et réinsérer
  const { error: delErr } = await supabase.from("surdosage").delete().neq("id", 0);
  if (delErr) console.error("  ⚠️ Erreur suppression:", delErr.message);

  const rows = FICHES.map((f) => ({
    ...f,
    updated_at: new Date().toISOString(),
  }));

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("surdosage").insert(batch);
    if (error) {
      console.error(`  ❌ Erreur insert batch ${i}:`, error.message);
      throw error;
    }
  }

  console.log(`  ✅ ${FICHES.length} fiches surdosage/CAT insérées\n`);

  // Lister les DCI couvertes
  console.log("  DCI couvertes :");
  for (const f of FICHES) {
    const icon = f.gravite === "vitale" ? "🔴" : f.gravite === "elevee" ? "🟠" : f.gravite === "moderee" ? "🟡" : "🟢";
    console.log(`    ${icon} ${f.dci} (${f.gravite})`);
  }

  console.log("\n✅ Seed terminé !");
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
