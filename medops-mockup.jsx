import { useState, useEffect, useRef, useMemo } from "react";

// ─── MOCK DATABASE ─────
const MEDS = [
  { id:1, name:"DOLIPRANE", dci:"Paracétamol", dosage:"1000 mg", forme:"Comprimé", labo:"Sanofi", classe:"Antalgique / Antipyrétique", atc:"N02BE01", indication:"Douleurs légères à modérées, états fébriles.", posologie:"1 cp (1000 mg) /prise, min. 6h entre prises. Max 4 g/j (3 g/j sujet âgé). Enfant : 60 mg/kg/j en 4 prises.", ci:"Insuffisance hépatique sévère, hypersensibilité au paracétamol, alcoolisme chronique.", interactions:"AVK (risque hémorragique doses élevées prolongées), hépatotoxiques.", surdosage:"⚠️ URGENCE — Dose toxique >150 mg/kg.\nSymptômes retardés 24-48h : cytolyse hépatique → insuffisance hépatique aiguë.\n\n🔹 CAT : N-acétylcystéine IV (protocole Prescott)\n🔹 Paracétamolémie H+4\n🔹 Bilan hépatique\n🔹 Transfert SAMU/réanimation", conservation:"< 30°C", color:"#3B82F6", icon:"💊", famille:"antalgique" },
  { id:2, name:"KARDEGIC", dci:"Acétylsalicylate de DL-Lysine", dosage:"75 mg", forme:"Poudre pour solution buvable", labo:"Sanofi", classe:"Antiagrégant plaquettaire", atc:"B01AC06", indication:"Prévention secondaire après accident ischémique myocardique ou cérébral.", posologie:"75 à 325 mg/j en une prise. Prévention usuelle : 75-160 mg/j.", ci:"Ulcère gastroduodénal en évolution, hémorragie active, risque hémorragique, insuffisance hépatique sévère, dernier trimestre grossesse.", interactions:"Anticoagulants (AVK, héparines, AOD), AINS, méthotrexate, corticoïdes.", surdosage:"⚠️ Dose toxique >100 mg/kg.\nSymptômes : acouphènes, hyperventilation, troubles acido-basiques, convulsions.\n\n🔹 Lavage gastrique si <2h\n🔹 Charbon activé\n🔹 Alcalinisation des urines\n🔹 Transfert SAMU", conservation:"< 25°C", color:"#EF4444", icon:"🩸", famille:"anticoagulant" },
  { id:3, name:"LEVOTHYROX", dci:"Lévothyroxine sodique", dosage:"100 µg", forme:"Comprimé sécable", labo:"Merck", classe:"Hormone thyroïdienne", atc:"H03AA01", indication:"Hypothyroïdie. Substitution après thyroïdectomie.", posologie:"Adulte : 1,6 µg/kg/j. Prise unique matin à jeun, 30 min avant petit-déjeuner. Adaptation progressive par paliers de 12,5-25 µg toutes les 4-6 semaines.", ci:"Thyrotoxicose non traitée, insuffisance surrénale non corrigée, IDM récent, myocardite aiguë.", interactions:"Anticoagulants oraux (potentialisation), sels de fer/calcium (espacement 2h), IPP, amiodarone, lithium.", surdosage:"Signes de thyrotoxicose : tachycardie, agitation, tremblements, hyperthermie, sueurs, diarrhées.\n\n🔹 Arrêt du traitement\n🔹 Bêtabloquants si tachycardie\n🔹 Surveillance cardioscopique\n🔹 Transfert hospitalier", conservation:"< 25°C, abri humidité", color:"#8B5CF6", icon:"🦋", famille:"endocrinologie" },
  { id:4, name:"METFORMINE SANDOZ", dci:"Metformine", dosage:"1000 mg", forme:"Comprimé pelliculé", labo:"Sandoz", classe:"Antidiabétique oral (Biguanide)", atc:"A10BA02", indication:"Diabète type 2, en particulier patients en surpoids.", posologie:"Initiale : 500-850 mg 2-3x/j aux repas. Max : 3000 mg/j. Paliers de 500 mg/1-2 semaines.", ci:"IR sévère (DFG <30), acidose métabolique aiguë, déshydratation, infection sévère, IH, alcoolisme, injection PCI.", interactions:"Produits contraste iodés (arrêt 48h), diurétiques, AINS, alcool.", surdosage:"⚠️ URGENCE — Acidose lactique (mortalité 50%).\nNausées, vomissements, douleurs abdominales, hypothermie, polypnée de Kussmaul, troubles conscience.\n\n🔹 Transfert urgent SAMU/réa\n🔹 Hémodialyse\n🔹 Correction acidose", conservation:"< 25°C", color:"#10B981", icon:"📊", famille:"antidiabétique" },
  { id:5, name:"XANAX", dci:"Alprazolam", dosage:"0,50 mg", forme:"Comprimé sécable", labo:"Pfizer", classe:"Anxiolytique (Benzodiazépine)", atc:"N05BA12", indication:"Manifestations anxieuses sévères et/ou invalidantes. Prévention delirium tremens.", posologie:"0,25-0,50 mg 3x/j. Max 4 mg/j. Durée ≤12 semaines (incluant sevrage progressif).", ci:"Insuffisance respiratoire sévère, SAS, insuffisance hépatique sévère, myasthénie.", interactions:"⚠️ Opioïdes (dépression respiratoire, risque vital), alcool, dépresseurs du SNC, kétoconazole.", surdosage:"⚠️ URGENCE — Somnolence, confusion, ataxie, hypotension, dépression respiratoire, coma.\n\n🔹 ANTIDOTE : Flumazénil (Anexate®) 0,2 mg IV renouvelable\n🔹 Surveillance respiratoire continue\n🔹 Intubation si nécessaire\n🔹 Transfert SAMU/réa", conservation:"< 30°C", color:"#F59E0B", icon:"🧠", famille:"psychotrope" },
  { id:6, name:"AMLOR", dci:"Amlodipine", dosage:"10 mg", forme:"Gélule", labo:"Pfizer", classe:"Inhibiteur calcique (Antihypertenseur)", atc:"C08CA01", indication:"HTA. Angor chronique stable. Angor de Prinzmetal.", posologie:"Initiale : 5 mg/j en une prise. Si nécessaire : 10 mg/j. Pas d'ajustement IR.", ci:"Hypotension sévère, choc cardiogénique, RAC serré, angor instable (sauf Prinzmetal).", interactions:"Dantrolène IV (FV), autres antihypertenseurs, inhibiteurs CYP3A4.", surdosage:"Hypotension sévère, tachycardie réflexe, vasodilatation excessive.\n\n🔹 Remplissage vasculaire\n🔹 Vasopresseurs\n🔹 Gluconate de calcium IV\n🔹 Transfert SAMU", conservation:"< 30°C", color:"#06B6D4", icon:"❤️", famille:"cardio" },
  { id:7, name:"CLOPIDOGREL MYLAN", dci:"Clopidogrel", dosage:"75 mg", forme:"Comprimé pelliculé", labo:"Mylan", classe:"Antiagrégant plaquettaire", atc:"B01AC04", indication:"Prévention événements athérothrombotiques : IDM récent, AVC ischémique, AOMI. SCA (avec aspirine).", posologie:"75 mg/j prise unique. Dose de charge possible : 300-600 mg (SCA avant coronaro).", ci:"Hémorragie en cours, insuffisance hépatique sévère.", interactions:"Anticoagulants, AINS, ISRS (hémorragie). IPP/oméprazole (↓ efficacité). Aspirine (synergie + risque).", surdosage:"Allongement temps de saignement. Pas d'antidote spécifique.\n\n🔹 Compression locale\n🔹 Transfusion plaquettaire si hémorragie sévère\n🔹 Transfert hospitalier", conservation:"< 30°C", color:"#EC4899", icon:"🩸", famille:"anticoagulant" },
  { id:8, name:"BISOPROLOL TEVA", dci:"Bisoprolol", dosage:"5 mg", forme:"Comprimé sécable", labo:"Teva", classe:"Bêtabloquant cardiosélectif", atc:"C07AB07", indication:"HTA. Angor stable. IC chronique stable avec dysfonction systolique VG.", posologie:"HTA/Angor : 10 mg/j. IC : initiation 1,25 mg/j, paliers 2 sem → max 10 mg/j.", ci:"Asthme sévère, BPCO sévère, BAV II-III non appareillé, bradycardie <50, hypotension, phéochromocytome, Raynaud.", interactions:"ICa bradycardisants (vérapamil, diltiazem), antiarythmiques, halogénés, insuline (masque hypoglycémie).", surdosage:"⚠️ URGENCE — Bradycardie sévère, BAV, hypotension, bronchospasme, IC aiguë.\n\n🔹 Atropine 0,5-1 mg IV\n🔹 ANTIDOTE : Glucagon 1-10 mg IV\n🔹 Isoprénaline\n🔹 SEES\n🔹 Transfert SAMU/réa", conservation:"< 30°C", color:"#F97316", icon:"🫀", famille:"cardio" },
  { id:9, name:"ELIQUIS", dci:"Apixaban", dosage:"5 mg", forme:"Comprimé pelliculé", labo:"BMS/Pfizer", classe:"AOD (Anti-Xa)", atc:"B01AF02", indication:"Prévention AVC/embolie systémique (FANV). Traitement TVP/EP.", posologie:"FANV : 5 mg x2/j. Réduit 2,5 mg x2/j si ≥2 critères : âge ≥80, poids ≤60kg, créat ≥133 µmol/L.\nTVP/EP : 10 mg x2/j (7j) puis 5 mg x2/j.", ci:"Hémorragie active, atteinte hépatique avec coagulopathie.", interactions:"⚠️ Antiagrégants, AINS, héparines (risque hémorragique majeur). Inhibiteurs CYP3A4/P-gp.", surdosage:"⚠️ URGENCE HÉMORRAGIQUE — Pas d'antidote largement disponible.\n\n🔹 Compression mécanique\n🔹 Transfusion CGR/PFC/plaquettes\n🔹 Acide tranexamique 1g IV\n🔹 FEIBA ou CCP si pronostic vital\n🔹 Transfert SAMU/réa immédiat", conservation:"< 30°C", color:"#DC2626", icon:"🩸", famille:"anticoagulant" },
  { id:10, name:"TAHOR", dci:"Atorvastatine", dosage:"20 mg", forme:"Comprimé pelliculé", labo:"Pfizer", classe:"Statine (Hypolipémiant)", atc:"C10AA05", indication:"Hypercholestérolémie. Prévention cardiovasculaire. Dyslipidémie mixte.", posologie:"Initiale : 10 mg/j. Usuelle : 10-80 mg/j une prise. Adaptation 2-4 sem.", ci:"Hépatopathie évolutive, transaminases >3N, grossesse, allaitement.", interactions:"Ciclosporine, fibrates (rhabdomyolyse), inhibiteurs CYP3A4, jus pamplemousse.", surdosage:"Risque rhabdomyolyse : douleurs musculaires, urines foncées, ↑CPK.\n\n🔹 Surveillance rénale (créat, CPK)\n🔹 Hydratation\n🔹 Alcalinisation urines si rhabdomyolyse\n🔹 Transfert hospitalier", conservation:"< 25°C", color:"#84CC16", icon:"💚", famille:"cardio" },
  { id:11, name:"SPASFON", dci:"Phloroglucinol", dosage:"80 mg", forme:"Comprimé orodispersible", labo:"Teva", classe:"Antispasmodique", atc:"A03AX12", indication:"Traitement symptomatique des douleurs spasmodiques digestives, gynécologiques et urinaires.", posologie:"1-2 cp par prise, max 6 cp/j. Comprimé à laisser fondre sous la langue.", ci:"Galactosémie congénitale, malabsorption glucose/galactose, déficit en lactase.", interactions:"Pas d'interactions majeures connues.", surdosage:"Faible toxicité. Pas de cas grave rapporté.\n\n🔹 Traitement symptomatique\n🔹 Surveillance clinique", conservation:"< 25°C", color:"#A78BFA", icon:"💊", famille:"antalgique" },
  { id:12, name:"VENTOLINE", dci:"Salbutamol", dosage:"100 µg/dose", forme:"Suspension pour inhalation", labo:"GSK", classe:"Bronchodilatateur β2-mimétique", atc:"R03AC02", indication:"Traitement symptomatique de la crise d'asthme. Prévention asthme d'effort. Bronchospasme.", posologie:"Crise : 1-2 bouffées, renouvelable après 15 min si nécessaire. Nébulisation : 2,5-5 mg.", ci:"Hypersensibilité au salbutamol. Précaution : cardiopathie, HTA, diabète, hyperthyroïdie.", interactions:"Bêtabloquants non cardiosélectifs (antagonisme). Hypokaliémiants.", surdosage:"Tachycardie, tremblements, céphalées, hypokaliémie, hyperglycémie.\n\n🔹 Surveillance cardiaque\n🔹 Correction hypokaliémie\n🔹 Bêtabloquant cardiosélectif si nécessaire\n🔹 Transfert hospitalier si symptômes sévères", conservation:"< 30°C, abri lumière", color:"#0EA5E9", icon:"🌬️", famille:"pneumologie" },
];

const CATEGORIES = [
  { id:"antalgique", label:"Antalgiques", icon:"💊", color:"#3B82F6" },
  { id:"cardio", label:"Cardiologie", icon:"❤️", color:"#F97316" },
  { id:"anticoagulant", label:"Anticoagulants", icon:"🩸", color:"#EF4444" },
  { id:"antidiabétique", label:"Antidiabétiques", icon:"📊", color:"#10B981" },
  { id:"psychotrope", label:"Psychotropes", icon:"🧠", color:"#F59E0B" },
  { id:"endocrinologie", label:"Endocrino", icon:"🦋", color:"#8B5CF6" },
  { id:"pneumologie", label:"Pneumologie", icon:"🌬️", color:"#0EA5E9" },
];

const INTERACTION_LEVELS = {
  critical: { label:"Contre-indiquée", color:"#EF4444", bg:"bg-red-500/15 border-red-500/40" },
  major: { label:"Déconseillée", color:"#F59E0B", bg:"bg-amber-500/15 border-amber-500/40" },
  moderate: { label:"Précaution d'emploi", color:"#3B82F6", bg:"bg-blue-500/15 border-blue-500/40" },
  none: { label:"Pas d'interaction connue", color:"#10B981", bg:"bg-green-500/15 border-green-500/40" },
};

const KNOWN_INTERACTIONS = [
  { med1:2, med2:9, level:"critical", desc:"Aspirine + AOD : risque hémorragique majeur. Association contre-indiquée." },
  { med1:2, med2:7, level:"major", desc:"Aspirine + Clopidogrel : synergie antiagrégante mais majoration du risque hémorragique." },
  { med1:5, med2:1, level:"none", desc:"Pas d'interaction cliniquement significative." },
  { med1:8, med2:6, level:"major", desc:"Bêtabloquant + ICa : risque de bradycardie et BAV. Surveillance renforcée." },
  { med1:5, med2:8, level:"moderate", desc:"BZD + Bêtabloquant : risque de majoration de l'hypotension. Précaution d'emploi." },
  { med1:9, med2:7, level:"critical", desc:"AOD + Antiagrégant : risque hémorragique majeur. Association contre-indiquée sauf indication cardiologique précise." },
  { med1:4, med2:6, level:"none", desc:"Pas d'interaction cliniquement significative." },
];

// ─── HELPERS ─────
const getSeverityBg = (text) => {
  if (!text) return "bg-slate-700/40 border-slate-600/30";
  if (text.includes("⚠️ URGENCE") || text.includes("ANTIDOTE"))
    return "bg-red-950/60 border-red-500/40";
  if (text.includes("⚠️"))
    return "bg-amber-950/40 border-amber-500/30";
  return "bg-slate-800/50 border-slate-700/40";
};

const fuzzyMatch = (text, query) => {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  return t.includes(q);
};

// ─── ICONS (inline SVG) ─────
const Icons = {
  search: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>,
  scan: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2m0 2H5m2 0h2M7 20v2m0-2H5m2 0h2M17 4V2m0 2h-2m2 0h2M17 20v2m0-2h-2m2 0h2M4 7H2m2 0V5m0 2v2M20 7h2m-2 0V5m0 2v2M4 17H2m2 0v-2m0 2v2M20 17h2m-2 0v-2m0 2v2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>,
  interactions: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5"/></svg>,
  star: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  starFill: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  back: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>,
  chevron: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>,
  close: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  flash: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
  copy: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>,
  plus: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>,
  check: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  alert: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>,
  moon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>,
  glove: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925v3m0-3a1.575 1.575 0 013.15 0v3m-12.6 0v1.5a1.575 1.575 0 003.15 0V7.5m0 0h.075M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>,
};

// ─── SUB-COMPONENTS ─────
const Badge = ({ children, color, small }) => (
  <span
    className={`inline-flex items-center font-semibold rounded-lg border ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"}`}
    style={{ backgroundColor: color + "18", borderColor: color + "40", color }}
  >{children}</span>
);

const InfoSection = ({ icon, title, content, severity }) => {
  const bg = severity ? getSeverityBg(content) : "bg-slate-800/50 border-slate-700/40";
  return (
    <div className={`rounded-xl border-2 p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">{content}</p>
    </div>
  );
};

const MedListItem = ({ med, onClick, isFav, onToggleFav }) => (
  <button onClick={() => onClick(med)} className="w-full text-left p-3.5 bg-slate-800/40 hover:bg-slate-800/80 border-2 border-slate-700/30 hover:border-amber-500/30 rounded-xl transition-all active:scale-[0.98] group">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: med.color + "20" }}>
        {med.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-white group-hover:text-amber-400 transition-colors">{med.name}</span>
          <Badge color={med.color} small>{med.dosage}</Badge>
        </div>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{med.dci} · {med.forme}</p>
      </div>
      {onToggleFav && (
        <button onClick={(e) => { e.stopPropagation(); onToggleFav(med.id); }} className={`p-1.5 rounded-lg transition-colors ${isFav ? "text-amber-400" : "text-slate-700 hover:text-slate-500"}`}>
          {isFav ? Icons.starFill : Icons.star}
        </button>
      )}
      <span className="text-slate-700 group-hover:text-amber-500/60 transition-colors">{Icons.chevron}</span>
    </div>
  </button>
);

// ─── TAB: SEARCH ─────
const SearchTab = ({ onSelect, favorites, toggleFav }) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const results = useMemo(() => {
    if (activeCategory) return MEDS.filter(m => m.famille === activeCategory);
    if (query.length < 2) return [];
    return MEDS.filter(m =>
      fuzzyMatch(m.name, query) || fuzzyMatch(m.dci, query) ||
      m.atc.toLowerCase().includes(query.toLowerCase()) ||
      fuzzyMatch(m.classe, query)
    );
  }, [query, activeCategory]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{Icons.search}</span>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveCategory(null); }}
            placeholder="Nom, DCI, code ATC..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-800/70 border-2 border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 focus:bg-slate-800 transition-all text-base"
            autoFocus
          />
          {(query || activeCategory) && (
            <button onClick={() => { setQuery(""); setActiveCategory(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/80 text-slate-400 hover:text-white">{Icons.close}</button>
          )}
        </div>
      </div>

      {/* Results or Home */}
      {(query.length >= 2 || activeCategory) ? (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-500">
              {results.length} résultat{results.length !== 1 && "s"}
              {activeCategory && <> dans <span className="text-amber-500">{CATEGORIES.find(c=>c.id===activeCategory)?.label}</span></>}
            </p>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} className="text-xs text-amber-500 hover:text-amber-400">Tout voir</button>
            )}
          </div>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-slate-400 font-medium">Aucun résultat</p>
              <p className="text-slate-600 text-sm mt-1">Essayez avec le nom DCI ou le code ATC</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {results.map(m => (
                <MedListItem key={m.id} med={m} onClick={onSelect} isFav={favorites.has(m.id)} onToggleFav={toggleFav} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5 animate-fadeIn">
          {/* Categories */}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-2.5 px-0.5">Classes thérapeutiques</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map(cat => {
                const count = MEDS.filter(m => m.famille === cat.id).length;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className="flex items-center gap-2.5 p-3 bg-slate-800/30 hover:bg-slate-800/70 border-2 border-slate-700/25 hover:border-slate-600/50 rounded-xl transition-all active:scale-95">
                    <span className="text-lg">{cat.icon}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-300 leading-tight">{cat.label}</p>
                      <p className="text-[10px] text-slate-600">{count} spécialité{count>1&&"s"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Recents */}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-2.5 px-0.5">Consultés récemment</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {MEDS.slice(0, 5).map(m => (
                <button key={m.id} onClick={() => onSelect(m)}
                  className="flex-shrink-0 w-28 p-3 bg-slate-800/40 border-2 border-slate-700/25 rounded-xl hover:border-slate-600/50 transition-all active:scale-95 text-center">
                  <div className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-base mb-1.5" style={{ backgroundColor: med.color + "20" || m.color + "20" }}>
                    {m.icon}
                  </div>
                  <p className="text-xs font-bold text-slate-300 truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-600">{m.dosage}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Full list */}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-2.5 px-0.5">Base complète · {MEDS.length} spécialités</p>
            <div className="space-y-1.5">
              {MEDS.map(m => (
                <MedListItem key={m.id} med={m} onClick={onSelect} isFav={favorites.has(m.id)} onToggleFav={toggleFav} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB: DETAIL ─────
const DetailView = ({ med, onBack, isFav, toggleFav }) => {
  const [copied, setCopied] = useState(false);
  const handleCopyBilan = () => {
    const text = `🏥 BILAN MÉDIC. — ${med.name} ${med.dosage}\nDCI: ${med.dci}\nClasse: ${med.classe}\nIndication: ${med.indication}\nSurdosage/CAT: ${med.surdosage.replace(/🔹 /g,"")}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <button onClick={onBack} className="mt-0.5 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-amber-500/40 text-slate-400 hover:text-white transition-all active:scale-95">
          {Icons.back}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-white">{med.name}</h2>
            <Badge color={med.color}>{med.dosage}</Badge>
          </div>
          <p className="text-slate-400 text-sm">{med.dci} · {med.forme} · {med.labo}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={() => toggleFav(med.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${isFav ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-200"}`}>
          {isFav ? Icons.starFill : Icons.star}
          <span>{isFav ? "Favori" : "Ajouter aux favoris"}</span>
        </button>
        <button onClick={handleCopyBilan}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all active:scale-95">
          {copied ? Icons.check : Icons.copy}
          <span>{copied ? "Copié !" : "Bilan"}</span>
        </button>
      </div>

      {/* Classification */}
      <div className="flex flex-wrap gap-1.5">
        <Badge color="#6B7280" small>ATC: {med.atc}</Badge>
        <Badge color={med.color} small>{med.classe}</Badge>
      </div>

      {/* Sections */}
      <InfoSection icon="💊" title="Indication" content={med.indication} />
      <InfoSection icon="📋" title="Posologie usuelle" content={med.posologie} />
      <InfoSection icon="🚫" title="Contre-indications" content={med.ci} />
      <InfoSection icon="⚡" title="Interactions majeures" content={med.interactions} severity />
      <InfoSection icon="🚨" title="Surdosage — Conduite à tenir" content={med.surdosage} severity />

      <div className="flex items-center gap-2 text-[11px] text-slate-600 px-1">
        {Icons.alert}
        Conservation : {med.conservation}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-600 leading-relaxed">
        <strong className="text-slate-500">⚕️ Avertissement :</strong> Informations à titre d'aide opérationnelle. Ne se substituent pas à l'avis du médecin régulateur (CRRA 15) ni aux protocoles départementaux.
      </div>
    </div>
  );
};

// ─── TAB: SCANNER ─────
const ScanTab = ({ onSelect }) => {
  const [phase, setPhase] = useState("scanning"); // scanning | found | manual
  const [manualCode, setManualCode] = useState("");
  const [flashOn, setFlashOn] = useState(false);
  const [foundMed, setFoundMed] = useState(null);

  useEffect(() => {
    if (phase === "scanning") {
      const t = setTimeout(() => {
        const med = MEDS[Math.floor(Math.random() * MEDS.length)];
        setFoundMed(med);
        setPhase("found");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleManual = () => {
    const found = MEDS.find(m => m.id.toString().includes(manualCode));
    if (found) { setFoundMed(found); setPhase("found"); }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Camera viewfinder */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] max-h-[55vh] flex items-center justify-center border-2 border-slate-800">
        {/* Simulated camera bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-80" />

        {phase === "scanning" && (
          <>
            {/* Corner brackets */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-3 border-l-3 border-amber-500 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-12 h-12 border-t-3 border-r-3 border-amber-500 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-3 border-l-3 border-amber-500 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-3 border-r-3 border-amber-500 rounded-br-lg" />
            {/* Scan line */}
            <div className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-scanLine shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
            {/* Text */}
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <p className="text-amber-400/80 text-sm font-medium animate-pulse">Pointez vers le code-barres CIP13</p>
            </div>
            {/* Flash toggle */}
            <button onClick={() => setFlashOn(!flashOn)}
              className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-all ${flashOn ? "bg-amber-500 text-black" : "bg-black/50 text-white/70"}`}>
              {Icons.flash}
            </button>
          </>
        )}

        {phase === "found" && foundMed && (
          <div className="text-center p-8 z-10 animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
              <span className="text-green-400">{Icons.check}</span>
            </div>
            <p className="text-green-400 font-bold text-lg mb-1">Médicament identifié</p>
            <p className="text-white font-black text-xl">{foundMed.name} {foundMed.dosage}</p>
            <p className="text-slate-400 text-sm">{foundMed.dci}</p>
            <button onClick={() => onSelect(foundMed)}
              className="mt-5 px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-base transition-all active:scale-95 shadow-lg shadow-amber-900/40">
              Voir la fiche complète
            </button>
            <button onClick={() => { setPhase("scanning"); setFoundMed(null); }}
              className="mt-2 block mx-auto text-sm text-slate-500 hover:text-slate-300">
              Scanner un autre médicament
            </button>
          </div>
        )}
      </div>

      {/* Manual entry */}
      <div className="p-4 bg-slate-800/30 border-2 border-slate-700/25 rounded-xl space-y-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Saisie manuelle CIP13</p>
        <div className="flex gap-2">
          <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)}
            placeholder="3400936295704"
            className="flex-1 px-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 rounded-xl text-white font-mono placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 text-sm"
            maxLength={13} inputMode="numeric" />
          <button onClick={handleManual}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all active:scale-95">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: INTERACTIONS ─────
const InteractionsTab = ({ onSelect }) => {
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const addMed = (med) => {
    if (!selectedMeds.find(m => m.id === med.id) && selectedMeds.length < 8) {
      setSelectedMeds([...selectedMeds, med]);
    }
    setShowPicker(false);
  };

  const removeMed = (id) => setSelectedMeds(selectedMeds.filter(m => m.id !== id));

  const detectedInteractions = useMemo(() => {
    const results = [];
    for (let i = 0; i < selectedMeds.length; i++) {
      for (let j = i + 1; j < selectedMeds.length; j++) {
        const a = selectedMeds[i].id, b = selectedMeds[j].id;
        const found = KNOWN_INTERACTIONS.find(
          int => (int.med1 === a && int.med2 === b) || (int.med1 === b && int.med2 === a)
        );
        if (found) results.push({ ...found, medA: selectedMeds[i], medB: selectedMeds[j] });
      }
    }
    return results.sort((a, b) => {
      const order = { critical: 0, major: 1, moderate: 2, none: 3 };
      return order[a.level] - order[b.level];
    });
  }, [selectedMeds]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-lg font-black text-white">Vérificateur d'interactions</h2>
        <p className="text-xs text-slate-500 mt-0.5">Ajoutez les médicaments trouvés chez la victime</p>
      </div>

      {/* Selected meds */}
      <div className="flex flex-wrap gap-2">
        {selectedMeds.map(m => (
          <div key={m.id} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-slate-800/60 border-2 border-slate-700/40 rounded-xl">
            <span className="text-sm">{m.icon}</span>
            <span className="text-sm font-semibold text-slate-200">{m.name}</span>
            <span className="text-[10px] text-slate-500">{m.dosage}</span>
            <button onClick={() => removeMed(m.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">{Icons.close}</button>
          </div>
        ))}
        <button onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 border-2 border-dashed border-slate-700 hover:border-amber-500/40 rounded-xl text-slate-500 hover:text-amber-400 transition-all active:scale-95">
          {Icons.plus}
          <span className="text-sm font-semibold">Ajouter</span>
        </button>
      </div>

      {/* Results */}
      {selectedMeds.length >= 2 && (
        <div className="space-y-2 animate-fadeIn">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">
            {detectedInteractions.length} interaction{detectedInteractions.length !== 1 && "s"} détectée{detectedInteractions.length !== 1 && "s"}
          </p>
          {detectedInteractions.map((int, i) => {
            const lvl = INTERACTION_LEVELS[int.level];
            return (
              <div key={i} className={`p-3.5 rounded-xl border-2 ${lvl.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lvl.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: lvl.color }}>{lvl.label}</span>
                </div>
                <p className="text-sm text-slate-200 font-semibold mb-1">
                  {int.medA.name} + {int.medB.name}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">{int.desc}</p>
              </div>
            );
          })}
          {detectedInteractions.length === 0 && (
            <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl text-center">
              <p className="text-green-400 font-semibold text-sm">Aucune interaction connue détectée</p>
              <p className="text-green-400/60 text-xs mt-1">Vérifiez toujours auprès du CRRA 15</p>
            </div>
          )}
        </div>
      )}

      {selectedMeds.length < 2 && (
        <div className="text-center py-10 text-slate-600">
          <p className="text-3xl mb-2">⚡</p>
          <p className="text-sm">Ajoutez au moins 2 médicaments pour vérifier les interactions</p>
        </div>
      )}

      {/* Picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end animate-fadeIn">
          <div className="w-full max-h-[70vh] bg-slate-900 border-t-2 border-slate-700 rounded-t-2xl overflow-auto p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-300">Sélectionner un médicament</p>
              <button onClick={() => setShowPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400">{Icons.close}</button>
            </div>
            {MEDS.filter(m => !selectedMeds.find(s => s.id === m.id)).map(m => (
              <MedListItem key={m.id} med={m} onClick={addMed} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB: FAVORITES ─────
const FavoritesTab = ({ favorites, toggleFav, onSelect }) => {
  const favMeds = MEDS.filter(m => favorites.has(m.id));
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-lg font-black text-white">Favoris</h2>
        <p className="text-xs text-slate-500 mt-0.5">Médicaments fréquemment rencontrés sur votre secteur</p>
      </div>
      {favMeds.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-slate-400 font-medium">Aucun favori</p>
          <p className="text-slate-600 text-sm mt-1">Ajoutez des médicaments depuis leur fiche détaillée</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {favMeds.map(m => (
            <MedListItem key={m.id} med={m} onClick={onSelect} isFav onToggleFav={toggleFav} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TAB: SETTINGS ─────
const SettingsTab = () => {
  const [glovesMode, setGlovesMode] = useState(false);
  const [nightMode, setNightMode] = useState(true);

  const Toggle = ({ on, onToggle }) => (
    <button onClick={onToggle} className={`w-12 h-7 rounded-full transition-all flex items-center px-0.5 ${on ? "bg-amber-500" : "bg-slate-700"}`}>
      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  const SettingRow = ({ icon, label, desc, toggle }) => (
    <div className="flex items-center gap-3 p-3.5 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
      {toggle}
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-lg font-black text-white">Paramètres</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configuration de l'application</p>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">Affichage terrain</p>
        <SettingRow icon={Icons.moon} label="Mode nuit" desc="Thème sombre optimisé (activé par défaut)" toggle={<Toggle on={nightMode} onToggle={() => setNightMode(!nightMode)} />} />
        <SettingRow icon={Icons.glove} label="Mode gants" desc="Cibles tactiles agrandies (56×56px min)" toggle={<Toggle on={glovesMode} onToggle={() => setGlovesMode(!glovesMode)} />} />
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">Base de données</p>
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Source</span>
            <span className="text-slate-200 font-medium">ANSM Open Data</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Version</span>
            <span className="text-slate-200 font-medium">2026.03</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Spécialités</span>
            <span className="text-slate-200 font-medium">{MEDS.length} (démo)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Stockage local</span>
            <span className="text-slate-200 font-medium">~18 Mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Dernière MAJ</span>
            <span className="text-green-400 font-medium">29/03/2026</span>
          </div>
          <button className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/30 rounded-xl text-sm text-slate-300 font-semibold transition-all active:scale-95">
            Mettre à jour la base
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold px-0.5">À propos</p>
        <div className="p-4 bg-slate-800/30 border-2 border-slate-700/20 rounded-xl text-center space-y-1">
          <p className="font-black text-base">MED<span className="text-amber-500">OPS</span> <span className="text-xs text-slate-600 font-normal">v0.1.0</span></p>
          <p className="text-xs text-slate-500">Aide à l'identification médicamenteuse</p>
          <p className="text-xs text-slate-500">pour les Sapeurs-Pompiers</p>
          <p className="text-[10px] text-slate-700 mt-2">Orionis Solutions SAS · 2026</p>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────
export default function MedOps() {
  const [tab, setTab] = useState("search");
  const [selectedMed, setSelectedMed] = useState(null);
  const [favorites, setFavorites] = useState(new Set([2, 5, 9]));

  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelect = (med) => {
    setSelectedMed(med);
    setTab("detail");
  };

  const handleBack = () => {
    setSelectedMed(null);
    setTab("search");
  };

  const tabs = [
    { id: "search", icon: Icons.search, label: "Recherche" },
    { id: "scan", icon: Icons.scan, label: "Scanner" },
    { id: "interactions", icon: Icons.interactions, label: "Interactions" },
    { id: "favorites", icon: Icons.star, label: "Favoris" },
    { id: "settings", icon: Icons.settings, label: "Réglages" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0c1220] to-slate-950 text-white" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;900&display=swap');
        @keyframes scanLine { 0%,100%{top:24px} 50%{top:calc(100% - 24px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .animate-scanLine { animation: scanLine 2.5s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        .border-3 { border-width: 3px; }
      `}</style>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b-2 border-slate-800/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <span className="text-sm font-black text-white">M</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none">
                MED<span className="text-amber-500">OPS</span>
              </h1>
              <p className="text-[9px] text-slate-600 tracking-[0.15em] uppercase">Sapeurs-Pompiers</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Offline</span>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {tab === "detail" && selectedMed ? (
          <DetailView med={selectedMed} onBack={handleBack} isFav={favorites.has(selectedMed.id)} toggleFav={toggleFav} />
        ) : tab === "search" ? (
          <SearchTab onSelect={handleSelect} favorites={favorites} toggleFav={toggleFav} />
        ) : tab === "scan" ? (
          <ScanTab onSelect={handleSelect} />
        ) : tab === "interactions" ? (
          <InteractionsTab onSelect={handleSelect} />
        ) : tab === "favorites" ? (
          <FavoritesTab favorites={favorites} toggleFav={toggleFav} onSelect={handleSelect} />
        ) : tab === "settings" ? (
          <SettingsTab />
        ) : null}
      </main>

      {/* ─── Bottom Nav ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t-2 border-slate-800/60">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(t => {
            const active = tab === t.id || (tab === "detail" && t.id === "search");
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== "search") setSelectedMed(null); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? "text-amber-500" : "text-slate-600 hover:text-slate-400"}`}>
                {t.icon}
                <span className="text-[9px] font-semibold uppercase tracking-wider">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
