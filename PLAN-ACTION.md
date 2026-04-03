# MedOps — Plan d'action complet

> **Version :** 3.0 · **Date :** 03 avril 2026
> **Stack :** Next.js 16 + Supabase + PWA Offline-First (Serwist)
> **Scope :** MVP (Phases 1 a 4)
>
> | Phase | Statut | Date |
> |---|---|---|
> | Phase 1 — Fondations | ✅ TERMINEE | 29/03/2026 |
> | Phase 2 — Recherche & Consultation | ✅ TERMINEE | 29/03/2026 |
> | Phase 3 — Scanner CIP13 | ✅ TERMINEE | 29/03/2026 |
> | Phase 4 — Donnees enrichies | ✅ TERMINEE | 03/04/2026 |
>
> **Base Supabase :** 15 816 specialites · 20 881 CIP13 · 32 395 compositions · 8 479 alertes · 15 814 DCI · 30 fiches CAT/surdosage · 31 interactions

---

## Stack technique retenue

| Composant | Technologie | Justification |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG, routing intégré, écosystème riche |
| Langage | TypeScript strict | Fiabilité critique pour un outil médical |
| UI | Tailwind CSS 4 | Prototypage rapide, thème sombre natif |
| Backend / BDD | Supabase (PostgreSQL) | Auth, Storage, Edge Functions, API REST auto |
| Base locale offline | IndexedDB via Dexie.js 4 | Cache offline performant, recherche indexée |
| Sync offline | Architecture custom (Supabase → IndexedDB) | Supabase n'a pas de sync offline natif |
| PWA / Service Worker | Serwist (successeur de next-pwa) | Recommandé par Next.js 15, basé sur Workbox |
| Recherche fuzzy | MiniSearch | Léger, fonctionne côté client sur IndexedDB |
| Scan code-barres | html5-qrcode | Maintenu activement, supporte EAN-13 + DataMatrix |
| Tests | Vitest + Playwright | Unitaires + E2E |
| Linting | ESLint (flat config) + Prettier | Qualité code |
| Hébergement | Vercel | Intégration native Next.js + Supabase |

---

## Architecture de données : online + offline

```
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                           │
│                                                         │
│  PostgreSQL          Storage           Edge Functions    │
│  ┌──────────┐    ┌────────────┐    ┌─────────────────┐  │
│  │medications│    │ ANSM JSON  │    │ Pipeline import │  │
│  │substances │    │ files      │    │ ANSM (CRON)     │  │
│  │CIP13      │    │ (gzip)     │    │                 │  │
│  │interactions│   └────────────┘    └─────────────────┘  │
│  │alerts     │                                          │
│  │surdosage  │    Auth (optionnel futur)                │
│  └──────────┘                                           │
└───────────────────────┬─────────────────────────────────┘
                        │ Fetch initial + sync delta
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   CLIENT (PWA)                          │
│                                                         │
│  Service Worker (Serwist/Workbox)                       │
│  ┌─────────────────────────────────────────────┐        │
│  │ Cache-First : app shell, assets, JS/CSS     │        │
│  │ StaleWhileRevalidate : données JSON         │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  IndexedDB (Dexie.js) — SOURCE DE VÉRITÉ LOCALE        │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐              │
│  │medications│ │substances│ │presentations│              │
│  └──────────┘ └──────────┘ └────────────┘              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │interactions│ │surdosage│ │  alerts  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ favorites│ │ history  │ │scanHistory│               │
│  └──────────┘ └──────────┘ └──────────┘               │
│                                                         │
│  MiniSearch (index fuzzy en mémoire)                    │
└─────────────────────────────────────────────────────────┘
```

**Principe :** Supabase est la source de vérité globale. IndexedDB est la source de vérité locale. L'app fonctionne 100% offline après le premier chargement. Quand le réseau est disponible, une sync différentielle met à jour IndexedDB depuis Supabase.

---

## Phase 1 — Fondations (Semaines 1-2) ✅ TERMINEE (29/03/2026)

### 1.1 Initialisation du projet Next.js 15

- [ ] Créer le projet :
  ```bash
  npx create-next-app@latest medops --typescript --tailwind --eslint --app --src-dir
  ```
- [ ] Configurer TypeScript strict (`strict: true`, `noUncheckedIndexedAccess: true`)
- [ ] Configurer Tailwind CSS 4 avec le thème sombre MedOps :
  - Background : `#0c1220` (slate-950)
  - Accent : `#f59e0b` (amber-500)
  - Danger : `#ef4444` (red-500)
- [ ] Configurer ESLint (flat config) + Prettier
- [ ] Configurer Husky + lint-staged (pre-commit)
- [ ] Définir les alias de chemins (`@/components`, `@/lib`, etc.)
- [ ] Structure du projet (voir section Architecture ci-dessous)

### 1.2 Configuration Supabase

- [ ] Créer le projet Supabase (dashboard ou CLI)
- [ ] Installer le SDK : `npm install @supabase/supabase-js`
- [ ] Configurer le client Supabase (`src/lib/supabase/client.ts`)
- [ ] Variables d'environnement :
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Côté serveur uniquement
  ```
- [ ] Créer le schéma PostgreSQL :

  ```sql
  -- Table principale : spécialités
  CREATE TABLE medications (
    code_cis TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dci TEXT,
    dosage TEXT,
    forme TEXT,
    voie TEXT,
    labo TEXT,
    statut_amm TEXT,
    classe TEXT,
    code_atc TEXT,
    search_text TEXT,          -- Concaténation normalisée pour recherche
    conservation TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Compositions (DCI / substances actives)
  CREATE TABLE substances (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code_cis TEXT REFERENCES medications(code_cis),
    dci TEXT NOT NULL,
    dosage TEXT,
    nature TEXT,               -- SA (substance active) / FT (fraction thérapeutique)
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Présentations (codes CIP)
  CREATE TABLE presentations (
    cip13 TEXT PRIMARY KEY,
    cip7 TEXT,
    code_cis TEXT REFERENCES medications(code_cis),
    libelle TEXT,
    prix TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Interactions médicamenteuses (Thesaurus ANSM)
  CREATE TABLE interactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    substance1 TEXT NOT NULL,
    substance2 TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('contre-indiquee','deconseillee','precaution','a-prendre-en-compte')),
    description TEXT,
    cat TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Fiches surdosage / CAT
  CREATE TABLE surdosage (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dci TEXT NOT NULL UNIQUE,
    dose_toxique TEXT,
    symptomes TEXT[],
    cat TEXT[],
    antidote TEXT,
    gravite TEXT CHECK (gravite IN ('faible','moderee','elevee','vitale')),
    delai_action TEXT,
    orientation TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Alertes ANSM
  CREATE TABLE alerts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code_cis TEXT REFERENCES medications(code_cis),
    date_debut DATE,
    date_fin DATE,
    texte TEXT,
    lien TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Métadonnées de version
  CREATE TABLE data_version (
    id INT PRIMARY KEY DEFAULT 1,
    version TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] Configurer les Row Level Security (RLS) policies :
  - Lecture publique (anon) sur toutes les tables de données
  - Écriture réservée au `service_role` (pipeline d'import)
- [ ] Créer les index PostgreSQL pour la recherche :
  ```sql
  CREATE INDEX idx_medications_search ON medications USING gin(to_tsvector('french', search_text));
  CREATE INDEX idx_medications_name ON medications(name);
  CREATE INDEX idx_medications_dci ON medications(dci);
  CREATE INDEX idx_medications_atc ON medications(code_atc);
  CREATE INDEX idx_presentations_cis ON presentations(code_cis);
  CREATE INDEX idx_substances_cis ON substances(code_cis);
  CREATE INDEX idx_interactions_sub1 ON interactions(substance1);
  CREATE INDEX idx_interactions_sub2 ON interactions(substance2);
  ```

### 1.3 Configuration PWA avec Serwist

- [ ] Installer Serwist :
  ```bash
  npm install @serwist/next
  npm install -D serwist
  ```
- [ ] Configurer `next.config.mjs` avec `withSerwistInit` :
  - `swSrc: "src/app/sw.ts"`
  - `swDest: "public/sw.js"`
- [ ] Mettre à jour `tsconfig.json` :
  - Ajouter `"@serwist/next/typings"` dans `types`
  - Ajouter `"webworker"` dans `lib`
- [ ] Ajouter `public/sw*` au `.gitignore`
- [ ] Créer `src/app/sw.ts` — Service Worker :
  - Precache : app shell, CSS, JS critiques
  - CacheFirst : assets statiques, icônes, polices
  - StaleWhileRevalidate : données JSON depuis Supabase Storage
  - Fallback offline : page de fallback si route non cachée
- [ ] Créer `src/app/manifest.ts` :
  ```typescript
  import type { MetadataRoute } from 'next';
  export default function manifest(): MetadataRoute.Manifest {
    return {
      name: 'MedOps — Identification Médicamenteuse',
      short_name: 'MedOps',
      description: 'Aide à l\'identification médicamenteuse pour les Sapeurs-Pompiers',
      start_url: '/',
      display: 'standalone',
      background_color: '#0c1220',
      theme_color: '#f59e0b',
      orientation: 'portrait',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    };
  }
  ```
- [ ] Créer les icônes PWA (192, 512, maskable)
- [ ] Mettre à jour `src/app/layout.tsx` avec les métadonnées PWA
- [ ] Tester l'installation sur Android Chrome + iOS Safari

### 1.4 Pipeline de données ANSM

> **Source :** https://base-donnees-publique.medicaments.gouv.fr/telechargement.php
> **Format :** TSV (tab-separated), encodage ISO-8859-1

- [ ] Créer le script `scripts/import-ansm.ts` (exécuté en Node.js)
- [ ] Télécharger et parser les fichiers :

| Fichier ANSM | Table Supabase | Champs clés |
|---|---|---|
| `CIS_bdpm.csv` | `medications` | Code CIS, nom, forme, voie, statut AMM, labo |
| `CIS_CIP_bdpm.csv` | `presentations` | CIP13, CIP7, libellé, prix |
| `CIS_COMPO_bdpm.csv` | `substances` | Code CIS, DCI, dosage, nature |
| `CIS_InfoImportantes.csv` | `alerts` | Code CIS, dates, texte, lien |

- [ ] Gérer l'encodage ISO-8859-1 → UTF-8 (`iconv-lite`)
- [ ] Normaliser les données :
  - Nettoyage espaces, casse
  - Génération du champ `search_text` (nom + DCI + CIP13)
  - Extraction code ATC quand disponible
- [ ] Insérer en batch dans Supabase via `service_role` :
  - Upsert par clé primaire
  - Mise à jour de `data_version`
- [ ] Exporter aussi en JSON compressé dans Supabase Storage :
  - `ansm-data/medications.json.gz`
  - `ansm-data/presentations.json.gz`
  - `ansm-data/version.json`
  - (pour le chargement initial côté client, plus rapide qu'un query de 15 000 rows)
- [ ] Mesurer la taille totale (objectif : < 20 Mo gzip)
- [ ] Documenter le pipeline

### 1.5 Base de données locale (IndexedDB / Dexie.js)

- [ ] Installer Dexie.js 4
- [ ] Créer `src/lib/db/index.ts` — instance Dexie :

| Store | Clé primaire | Index | Description |
|---|---|---|---|
| `medications` | `codeCIS` | `name`, `dci`, `searchText`, `codeATC` | Spécialités |
| `presentations` | `cip13` | `codeCIS` | CIP13 → CIS |
| `substances` | `++id` | `dci`, `codeCIS` | Compositions |
| `interactions` | `++id` | `substance1`, `substance2`, `level` | Interactions |
| `surdosage` | `dci` | `gravite` | Fiches CAT |
| `alerts` | `++id` | `codeCIS` | Alertes ANSM |
| `favorites` | `codeCIS` | — | Favoris utilisateur |
| `history` | `++id` | `codeCIS`, `date` | Historique consultations |
| `scanHistory` | `++id` | `cip13`, `date` | Historique scans |
| `meta` | `key` | — | Version base, date sync |

- [ ] Implémenter le chargement initial (`src/lib/db/loader.ts`) :
  1. Vérifier si la base locale existe et sa version
  2. Si absente ou obsolète : fetch JSON depuis Supabase Storage
  3. Insertion bulk dans IndexedDB (`bulkPut`)
  4. Barre de progression pendant le chargement
  5. Stocker la version dans le store `meta`
- [ ] Implémenter la sync différentielle :
  - Comparer `meta.version` locale avec `data_version` Supabase
  - Si nouvelle version : fetch les records avec `updated_at > last_sync`
  - Upsert dans IndexedDB
  - Mettre à jour `meta`
- [ ] Créer les hooks d'accès :
  - `useDatabase()` — état (loading, ready, error, version, nbMeds)
  - `useMedication(codeCIS)` — fiche complète avec substances
  - `useCIPLookup(cip13)` — résolution CIP13 → médicament

---

## Phase 2 — Recherche & Consultation (Semaines 3-4) ✅ TERMINEE (29/03/2026)

### 2.1 Moteur de recherche

- [ ] Installer MiniSearch
- [ ] Créer `src/lib/search/engine.ts` :
  - Indexation depuis IndexedDB : `name`, `dci`, `searchText`
  - Fuzzy matching : distance Levenshtein ≤ 2
  - Boost : nom commercial x3, DCI x2, ATC x1
  - Préfixe matching ("doli" → "doliprane")
- [ ] Construire l'index au démarrage (depuis IndexedDB, en mémoire)
- [ ] Hook `useSearch(query)` :
  - Debounce 150ms
  - Résultats triés par score de pertinence
  - Highlight des termes matchés
- [ ] Recherche CIP13 : lookup direct IndexedDB (`presentations` store)
- [ ] Recherche code ATC : filtrage par préfixe

### 2.2 Écran d'accueil (`src/app/(main)/page.tsx`)

- [ ] Header sticky :
  - Logo MedOps (gradient ambre → rouge)
  - Indicateur offline (vert = base chargée, rouge = base absente)
  - Compteur de spécialités + version base
- [ ] Barre de recherche globale (toujours visible, sticky sous le header)
- [ ] Grille des classes thérapeutiques (navigation par famille ATC)
- [ ] Section "Consultés récemment" (10 derniers depuis `history` store)
- [ ] Liste complète scrollable en fallback

### 2.3 Fiche médicament détaillée (`src/app/(main)/med/[cis]/page.tsx`)

- [ ] Route dynamique : `/med/[cis]`
- [ ] Récupération données : IndexedDB local (offline) avec fallback Supabase (online)
- [ ] Header :
  - Nom commercial, DCI, dosage, forme galénique, laboratoire
  - Bouton retour
- [ ] Badges : code ATC, classe thérapeutique, statut AMM
- [ ] Sections dépliables (composant `InfoSection`) :

| Section | Source | Priorité |
|---|---|---|
| 💊 Indication | Table `surdosage` + RCP | P0 |
| 📋 Posologie | Table `surdosage` + RCP | P1 |
| 🚫 Contre-indications | RCP (à enrichir) | P0 |
| ⚡ Interactions majeures | Table `interactions` | P2 |
| 🚨 Surdosage / CAT | Table `surdosage` | P1 |
| 📦 Conservation | Table `medications` | P0 |
| ⚠️ Alertes ANSM | Table `alerts` | P0 |

- [ ] Bouton favori → toggle dans `favorites` IndexedDB
- [ ] Bouton "Bilan SAMU" → copie structurée presse-papiers :
  ```
  BILAN MÉDIC. — [NOM] [DOSAGE]
  DCI: [DCI]
  Classe: [CLASSE]
  Indication: [INDICATION]
  Surdosage/CAT: [CAT]
  ```
- [ ] Avertissement réglementaire permanent
- [ ] Ajout automatique dans `history` store

### 2.4 Navigation

- [ ] Bottom navigation bar (5 onglets, composant `BottomNav`) :
  1. Recherche
  2. Scanner
  3. Interactions
  4. Favoris
  5. Réglages
- [ ] Layout principal : `src/app/(main)/layout.tsx`
- [ ] Routes Next.js App Router :
  ```
  src/app/
  ├── (main)/
  │   ├── layout.tsx          # Layout avec BottomNav
  │   ├── page.tsx             # Accueil + Recherche
  │   ├── med/[cis]/page.tsx   # Fiche médicament
  │   ├── scan/page.tsx        # Scanner
  │   ├── interactions/page.tsx # Vérificateur
  │   ├── favorites/page.tsx   # Favoris
  │   └── settings/page.tsx    # Réglages
  ├── layout.tsx               # Root layout + providers
  ├── manifest.ts              # PWA manifest
  └── sw.ts                    # Service Worker
  ```

---

## Phase 3 — Scanner CIP13 (Semaines 5-6) ✅ TERMINEE (29/03/2026)

### 3.1 Scanner caméra

- [ ] Installer `html5-qrcode`
- [ ] Créer le composant `CameraScanner` (client component : `"use client"`) :
  - Demande permission caméra
  - Mode plein écran + overlay de cadrage (corners ambrés)
  - Support : EAN-13 (CIP13), Code 128, DataMatrix
  - Feedback haptique (`navigator.vibrate(200)`) + bip sonore
  - Bouton torche (flash) pour faible luminosité
- [ ] Résolution : CIP13 → lookup `presentations` IndexedDB → `codeCIS` → fiche
- [ ] Gestion erreurs :
  - Caméra refusée → saisie manuelle
  - CIP13 inconnu → message + redirection recherche textuelle
  - Pas de caméra → masquer le scanner, afficher saisie manuelle uniquement

### 3.2 Saisie manuelle CIP13

- [ ] Input numérique (`inputMode="numeric"`, max 13 chars)
- [ ] Validation format (13 chiffres) + checksum CIP13 (Luhn)
- [ ] Auto-lookup quand 13 chiffres saisis
- [ ] Feedback visuel (vert si trouvé, rouge si inconnu)

### 3.3 Historique des scans

- [ ] Store `scanHistory` : `{ cip13, codeCIS, medName, date, location? }`
- [ ] Liste chronologique sur la page scanner
- [ ] Géolocalisation optionnelle (`navigator.geolocation`)
- [ ] Export texte pour rapport d'intervention

---

## Phase 4 — Données enrichies (Semaines 7-9) ✅ TERMINEE (03/04/2026)

> **Phase la plus critique.** Les CAT/surdosage et interactions ne sont pas dans les CSV ANSM.

### 4.1 Parsing du Thesaurus des interactions ANSM

- [ ] Récupérer le Thesaurus ANSM (PDF, ~600 pages)
- [ ] Adapter un parseur existant :
  - `axel-op/parseur-thesaurus-interactions-ansm` (Java) — le plus complet
  - `scossin/IMthesaurusANSM` (R) — alternative
- [ ] Écrire un script d'extraction → JSON :
  ```typescript
  interface InteractionData {
    substance1: string;
    substance2: string;
    level: 'contre-indiquee' | 'deconseillee' | 'precaution' | 'a-prendre-en-compte';
    description: string;
    cat: string;
  }
  ```
- [ ] Insérer dans la table `interactions` Supabase
- [ ] Exporter en JSON dans Supabase Storage pour sync offline
- [ ] Implémenter le vérificateur d'interactions (page `/interactions`)

### 4.2 Fiches CAT / Surdosage — Top 100 DCI

> Rédaction manuelle ou extraction semi-automatique depuis les RCP.

- [ ] Définir la liste des 100 DCI prioritaires (à valider avec ISP/médecins SP) :

  **Antalgiques / Anti-inflammatoires :**
  paracétamol, ibuprofène, kétoprofène, tramadol, codéine, morphine, oxycodone, fentanyl, aspirine

  **Psychotropes :**
  alprazolam, bromazépam, diazépam, oxazépam, lorazépam, zopiclone, zolpidem, hydroxyzine, méprobamate

  **Antidépresseurs :**
  amitriptyline, venlafaxine, sertraline, fluoxétine, paroxétine, escitalopram, mirtazapine

  **Cardiovasculaire :**
  bisoprolol, aténolol, propranolol, amlodipine, ramipril, énalapril, losartan, valsartan, diltiazem, vérapamil, digoxine, amiodarone, flécaïnide

  **Anticoagulants / Antiagrégants :**
  apixaban, rivaroxaban, warfarine, fluindione, clopidogrel, ticagrélor, énoxaparine

  **Antidiabétiques :**
  metformine, gliclazide, glibenclamide, insuline (toutes formes), sitagliptine

  **Pneumologie :**
  salbutamol, terbutaline, fluticasone, budésonide, théophylline

  **Neurologie :**
  valproate, carbamazépine, lévétiracétam, lamotrigine, gabapentine, prégabaline, lévodopa

  **Autres :**
  lévothyroxine, prednisone, prednisolone, colchicine, méthotrexate, lithium, baclofène

- [ ] Pour chaque DCI, structurer :
  ```typescript
  interface FicheSurdosage {
    dci: string;
    doseToxique: string;
    symptomes: string[];
    cat: string[];              // Étapes ordonnées
    antidote?: string;          // Nom + posologie
    gravite: 'faible' | 'moderee' | 'elevee' | 'vitale';
    delaiAction: string;
    orientation: string;
  }
  ```
- [ ] Insérer dans la table `surdosage` Supabase
- [ ] Afficher dans la section "Surdosage / CAT" de la fiche
- [ ] Pour les DCI non couvertes : afficher "Données non disponibles — contactez le CRRA 15"

### 4.3 Extraction RCP (optionnel, bonus)

- [ ] Télécharger `CIS_RCP.zip` (153 Mo, fichiers HTML)
- [ ] Parser les sections pertinentes :
  - 4.1 : Indications
  - 4.2 : Posologie
  - 4.3 : Contre-indications
  - 4.9 : Surdosage
- [ ] Utiliser comme fallback quand la fiche manuelle n'existe pas

---

## Architecture du projet

```
medops/
├── public/
│   ├── icons/                       # Icônes PWA (192, 512, maskable)
│   ├── sounds/                      # Bip scan
│   └── sw.js                        # Service Worker généré (gitignored)
├── scripts/
│   ├── import-ansm.ts               # Pipeline import ANSM → Supabase
│   ├── parse-thesaurus.ts           # Parser interactions PDF → JSON
│   ├── seed-surdosage.ts            # Import fiches CAT dans Supabase
│   └── export-json.ts               # Export Supabase → JSON pour Storage
├── supabase/
│   ├── migrations/                  # Migrations SQL
│   │   └── 001_initial_schema.sql
│   ├── functions/                   # Edge Functions
│   │   └── update-ansm/index.ts     # CRON mensuel mise à jour ANSM
│   └── config.toml                  # Config Supabase CLI
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── layout.tsx           # Layout principal + BottomNav
│   │   │   ├── page.tsx             # Accueil + Recherche
│   │   │   ├── med/
│   │   │   │   └── [cis]/page.tsx   # Fiche médicament
│   │   │   ├── scan/page.tsx        # Scanner CIP13
│   │   │   ├── interactions/page.tsx # Vérificateur interactions
│   │   │   ├── favorites/page.tsx   # Favoris
│   │   │   └── settings/page.tsx    # Paramètres
│   │   ├── layout.tsx               # Root layout + providers + metadata
│   │   ├── manifest.ts              # PWA manifest
│   │   └── sw.ts                    # Service Worker source (Serwist)
│   ├── components/
│   │   ├── ui/                      # Badge, Toggle, Modal, InfoSection
│   │   ├── search/                  # SearchBar, SearchResults, Highlight
│   │   ├── medication/              # MedCard, MedDetail, MedListItem
│   │   ├── scanner/                 # CameraScanner, ManualCIPInput
│   │   └── layout/                  # Header, BottomNav, StatusBar, LoadingScreen
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Client-side Supabase
│   │   │   ├── server.ts            # Server-side Supabase
│   │   │   └── types.ts             # Types générés (supabase gen types)
│   │   ├── db/
│   │   │   ├── index.ts             # Instance Dexie, schéma
│   │   │   ├── schema.ts            # Définition stores + index
│   │   │   ├── loader.ts            # Chargement initial + sync
│   │   │   └── queries.ts           # Fonctions d'accès aux données
│   │   ├── search/
│   │   │   └── engine.ts            # MiniSearch config + indexation
│   │   └── utils/
│   │       ├── cip13.ts             # Validation + checksum CIP13
│   │       └── formatters.ts        # Formatage texte bilan SAMU
│   ├── hooks/
│   │   ├── useDatabase.ts           # État base (loading/ready/version)
│   │   ├── useSearch.ts             # Recherche fuzzy avec debounce
│   │   ├── useMedication.ts         # Fiche complète par CIS
│   │   ├── useCIPLookup.ts          # Résolution CIP13 → médicament
│   │   ├── useFavorites.ts          # CRUD favoris IndexedDB
│   │   ├── useScanner.ts            # Logique scan html5-qrcode
│   │   ├── useInteractions.ts       # Vérification paires de DCI
│   │   └── useOfflineStatus.ts      # Navigator.onLine + listeners
│   └── types/
│       ├── medication.ts
│       ├── interaction.ts
│       └── surdosage.ts
├── tests/
│   ├── unit/                        # Vitest
│   ├── integration/                 # Vitest
│   └── e2e/                         # Playwright
├── next.config.mjs                  # Config Next.js + Serwist
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .github/
    └── workflows/
        ├── ci.yml                   # Lint + tests sur PR
        └── update-ansm.yml          # CRON mensuel pipeline ANSM
```

---

## Risques et mitigations

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| R1 | Données CAT/surdosage absentes de l'open data ANSM | **Critique** | Rédaction manuelle des 100 DCI + extraction RCP en fallback |
| R2 | Thesaurus interactions en PDF uniquement | **Élevé** | Parseurs open source existants (Java/R) à adapter |
| R3 | Serwist + Next.js 15 : bugs documentés (React Compiler, precaching) | **Modéré** | Désactiver React Compiler, exclure les manifests problématiques du precache |
| R4 | Taille base > 25 Mo ralentit le 1er chargement | **Modéré** | Compression gzip, chargement progressif, JSON dans Supabase Storage |
| R5 | iOS Safari purge IndexedDB après inactivité | **Élevé** | Détection + reconstitution auto de la base, avertir l'utilisateur |
| R6 | Supabase free tier : limites API (500K requests/mois) | **Faible** | La majorité du trafic est offline, les requests Supabase sont rares (sync uniquement) |

---

## Jalons MVP

| Jalon | Semaine | Livrable | Critère de succès |
|---|---|---|---|
| **M1** | S2 | Socle Next.js + Supabase + PWA installable + base ANSM importée | PWA installable, Supabase peuplé, IndexedDB chargé |
| **M2** | S4 | Recherche fuzzy + fiches médicament + navigation complète | "doliprane" → fiche en < 3s offline |
| **M3** | S6 | Scanner CIP13 (caméra + manuel) → fiche | Scan boîte → fiche en < 2s |
| **M4** | S9 | 100 fiches CAT + interactions parsées + vérificateur | CAT paracétamol, BZD, BB, AOD complètes |

---

## Prochaine étape

Le plan est validé. Je peux démarrer l'implémentation de la **Phase 1.1 — Initialisation du projet Next.js 15 + Supabase + Serwist**.

Faut-il que je commence ?
