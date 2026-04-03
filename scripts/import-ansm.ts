/**
 * Pipeline d'import ANSM → Supabase
 *
 * Télécharge les fichiers TSV de la base publique du médicament,
 * les parse et les insère dans Supabase PostgreSQL.
 *
 * Usage : npx tsx scripts/import-ansm.ts
 *
 * Nécessite les variables d'environnement :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import iconv from "iconv-lite";

// ─── Configuration ─────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Variables d'environnement manquantes :");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL =
  "https://base-donnees-publique.medicaments.gouv.fr/download/file/";

const ALERTS_URL =
  "https://base-donnees-publique.medicaments.gouv.fr/download/CIS_InfoImportantes.txt";

const FILES = {
  medications: "CIS_bdpm.txt",
  presentations: "CIS_CIP_bdpm.txt",
  compositions: "CIS_COMPO_bdpm.txt",
} as const;

const DOWNLOAD_DIR = path.join(process.cwd(), "scripts", ".ansm-data");
const BATCH_SIZE = 500;

// ─── Helpers ───────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url: string, filename: string): Promise<string> {
  const filepath = path.join(DOWNLOAD_DIR, filename);
  return new Promise((resolve, reject) => {
    console.log(`  ⬇️  Téléchargement ${filename}...`);

    function fetch(fetchUrl: string, redirects = 0) {
      if (redirects > 5) { reject(new Error(`Trop de redirections pour ${filename}`)); return; }
      https.get(fetchUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetch(res.headers.location!, redirects + 1);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} pour ${filename}`));
          return;
        }
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(filepath); });
      }).on("error", reject);
    }

    fetch(url);
  });
}

function parseFile(filepath: string): string[][] {
  const raw = fs.readFileSync(filepath);
  // Les fichiers ANSM sont désormais en UTF-8 ; fallback latin1 si nécessaire
  let text: string;
  try {
    text = raw.toString("utf-8");
    // Vérifier si le décodage UTF-8 a produit des caractères de remplacement
    if (text.includes("\uFFFD")) {
      text = iconv.decode(raw, "latin1");
    }
  } catch {
    text = iconv.decode(raw, "latin1");
  }
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split("\t").map((col) => col.trim()));
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function upsertBatch(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict });

    if (error) {
      console.error(`  ❌ Erreur upsert ${table} (batch ${i}):`, error.message);
      throw error;
    }
  }
}

// ─── Parsers par fichier ───────────────────────────────

function parseMedications(rows: string[][]) {
  return rows
    .filter((cols) => /^\d{5,8}$/.test(cols[0] ?? ""))  // Code CIS = 5 à 8 chiffres
    .map((cols) => {
      const codeCIS = cols[0] ?? "";
      const name = cols[1] ?? "";
      const forme = cols[2] ?? "";
      const voie = cols[3] ?? "";
      const statutAMM = cols[4] ?? "";
      const labo = cols[10] ?? "";

      return {
        code_cis: codeCIS,
        name: name,
        dci: null as string | null,
        forme: forme,
        voie: voie,
        statut_amm: statutAMM,
        labo: labo,
        search_text: normalize(`${name} ${forme} ${labo}`),
        updated_at: new Date().toISOString(),
      };
    });
}

function parsePresentations(rows: string[][]) {
  return rows.map((cols) => ({
    code_cis: cols[0] ?? "",
    cip7: cols[1] ?? "",
    libelle: cols[2] ?? "",
    cip13: cols[6] ?? "",
    prix: cols[9] ?? "",
    updated_at: new Date().toISOString(),
  })).filter(p => p.cip13.length > 0);
}

function parseCompositions(rows: string[][]) {
  return rows.map((cols) => ({
    code_cis: cols[0] ?? "",
    dci: cols[3] ?? "",       // col 3 = DCI / nom de substance
    nature: cols[6] ?? "",    // col 6 = SA (substance active) / FT
    dosage: cols[4] ?? "",    // col 4 = dosage
    updated_at: new Date().toISOString(),
  }));
}

function parseAlerts(rows: string[][]) {
  return rows.map((cols) => ({
    code_cis: cols[0] ?? "",
    date_debut: cols[1] || null,
    date_fin: cols[2] || null,
    texte: cols[3] ?? "",
    lien: cols[4] ?? "",
    updated_at: new Date().toISOString(),
  }));
}

// ─── Main ──────────────────────────────────────────────

async function main() {
  console.log("🏥 MedOps — Pipeline d'import ANSM\n");

  ensureDir(DOWNLOAD_DIR);

  // 1. Télécharger les fichiers
  console.log("📥 Téléchargement des fichiers ANSM...");
  const paths: Record<string, string> = {};
  for (const [key, filename] of Object.entries(FILES)) {
    paths[key] = await download(BASE_URL + filename, filename);
  }
  // Alertes : URL spéciale (générée dynamiquement)
  paths.alerts = await download(ALERTS_URL, "CIS_InfoImportantes.txt");
  console.log("  ✅ Téléchargement terminé\n");

  // 1b. Nettoyer les éventuelles données invalides d'un import précédent
  console.log("🧹 Nettoyage des données invalides...");
  // Supprimer les medications dont le code_cis n'est pas numérique
  const { error: cleanErr } = await supabase.rpc("exec_sql", {
    sql: "DELETE FROM alerts WHERE code_cis !~ '^[0-9]+$'; DELETE FROM substances WHERE code_cis !~ '^[0-9]+$'; DELETE FROM presentations WHERE code_cis !~ '^[0-9]+$'; DELETE FROM medications WHERE code_cis !~ '^[0-9]+$';"
  });
  if (cleanErr) {
    // Fallback : suppression directe si rpc n'existe pas
    console.log("  ⚠️  RPC non disponible, nettoyage via API...");
    // Récupérer les codes invalides et les supprimer
    const { data: invalidMeds } = await supabase
      .from("medications")
      .select("code_cis")
      .not("code_cis", "like", "6%")
      .not("code_cis", "like", "4%")
      .not("code_cis", "like", "3%")
      .not("code_cis", "like", "2%")
      .not("code_cis", "like", "1%")
      .not("code_cis", "like", "5%")
      .not("code_cis", "like", "7%")
      .not("code_cis", "like", "8%")
      .not("code_cis", "like", "9%")
      .limit(1000);
    if (invalidMeds && invalidMeds.length > 0) {
      const invalidCodes = invalidMeds.map((m) => m.code_cis);
      for (const code of invalidCodes) {
        await supabase.from("alerts").delete().eq("code_cis", code);
        await supabase.from("substances").delete().eq("code_cis", code);
        await supabase.from("presentations").delete().eq("code_cis", code);
        await supabase.from("medications").delete().eq("code_cis", code);
      }
      console.log(`  ✅ ${invalidCodes.length} entrées invalides supprimées`);
    } else {
      console.log("  ✅ Base propre");
    }
  } else {
    console.log("  ✅ Nettoyage SQL terminé");
  }
  console.log("");

  // 2. Parser et insérer les médicaments
  console.log("💊 Import des spécialités...");
  const medRows = parseFile(paths.medications!);
  const medications = parseMedications(medRows);
  await upsertBatch("medications", medications, "code_cis");
  console.log(`  ✅ ${medications.length} spécialités importées\n`);

  // 3. Compositions (substances) — filtrer les CIS invalides
  console.log("🧬 Import des compositions...");
  const compoRows = parseFile(paths.compositions!);
  const allCompositions = parseCompositions(compoRows);
  const validCISSet = new Set(medications.map((m) => m.code_cis));
  const compositions = allCompositions.filter((c) => validCISSet.has(c.code_cis));
  const skippedCompo = allCompositions.length - compositions.length;
  if (skippedCompo > 0) console.log(`  ⚠️  ${skippedCompo} compositions ignorées (CIS inconnu)`);

  // Vider et réinsérer (pas de clé primaire stable)
  const { error: delSub } = await supabase.from("substances").delete().neq("id", 0);
  if (delSub) console.error("  ⚠️ Erreur suppression substances:", delSub.message);
  await upsertBatch("substances", compositions, "id");
  console.log(`  ✅ ${compositions.length} compositions importées\n`);

  // 4. Mettre à jour les DCI dans medications (depuis compositions)
  console.log("🔗 Enrichissement DCI + search_text...");
  const dciMap = new Map<string, string>();
  for (const c of compositions) {
    if (c.nature === "SA" && c.code_cis && !dciMap.has(c.code_cis)) {
      dciMap.set(c.code_cis, c.dci);
    }
  }
  // Enrichir les objets medications en mémoire puis re-upsert la totalité
  let enrichCount = 0;
  for (const med of medications) {
    const dci = dciMap.get(med.code_cis);
    if (dci) {
      med.dci = dci;
      med.search_text = normalize(`${med.name} ${dci} ${med.forme} ${med.labo}`);
      enrichCount++;
    }
  }
  // Re-upsert avec toutes les colonnes intactes
  await upsertBatch("medications", medications, "code_cis");
  console.log(`  ✅ ${enrichCount} médicaments enrichis avec DCI\n`);

  // 5. Présentations (CIP) — filtrer les CIS invalides
  console.log("📦 Import des présentations CIP...");
  const presRows = parseFile(paths.presentations!);
  const allPresentations = parsePresentations(presRows);
  const presentations = allPresentations.filter((p) => validCISSet.has(p.code_cis));
  const skippedPres = allPresentations.length - presentations.length;
  if (skippedPres > 0) console.log(`  ⚠️  ${skippedPres} présentations ignorées (CIS inconnu)`);
  await upsertBatch("presentations", presentations, "cip13");
  console.log(`  ✅ ${presentations.length} présentations importées\n`);

  // 6. Alertes — filtrer les CIS invalides
  console.log("⚠️  Import des alertes...");
  const alertRows = parseFile(paths.alerts!);
  const allAlerts = parseAlerts(alertRows);
  const alerts = allAlerts.filter((a) => validCISSet.has(a.code_cis));
  const { error: delAlert } = await supabase.from("alerts").delete().neq("id", 0);
  if (delAlert) console.error("  ⚠️ Erreur suppression alertes:", delAlert.message);
  await upsertBatch("alerts", alerts, "id");
  console.log(`  ✅ ${alerts.length} alertes importées\n`);

  // 7. Mettre à jour la version
  const version = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  await supabase.from("data_version").upsert({ id: 1, version, updated_at: new Date().toISOString() });
  console.log(`📋 Version de la base : ${version}`);

  console.log("\n✅ Import ANSM terminé avec succès !");
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
