# 🏥 MedOps — Roadmap de développement

> **Application d'aide à l'identification médicamenteuse pour les Sapeurs-Pompiers**
> PWA Offline-First · Base ANSM Open Data · Scan CIP13

---

## 🎯 Vision produit

MedOps permet aux sapeurs-pompiers en intervention SAP/VSAV d'identifier rapidement les médicaments trouvés au domicile des victimes, de comprendre leur usage, leur posologie et d'adopter la bonne conduite à tenir en cas de surdosage ou d'interaction dangereuse — le tout **sans connexion réseau**.

---

## 📐 Stack technique

| Composant | Technologie |
| --- | --- |
| Framework | **Next.js 16** (App Router) |
| Langage | TypeScript strict |
| UI | Tailwind CSS 4 |
| Backend / BDD | **Supabase** (PostgreSQL) |
| Base locale offline | IndexedDB (via Dexie.js 4) |
| Sync offline | Supabase → IndexedDB (custom) |
| PWA / Service Worker | **Serwist** (Workbox) |
| Recherche fuzzy | **MiniSearch** |
| Scan code-barres | html5-qrcode |
| Source de données | Base publique ANSM (open data) |
| Hébergement | Vercel |
| Tests | Vitest + Playwright |

---

## 🗓️ Phases de développement

---

### ✅ Phase 0 — Fondations (Semaines 1-2) — TERMINEE 29/03/2026

**Objectif** : Socle technique opérationnel et pipeline de données.

- [x] **Initialisation projet**
  - Next.js 16 + TypeScript strict + Tailwind CSS 4
  - Supabase (PostgreSQL) : 7 tables, index, RLS policies
  - Serwist PWA : service worker, manifest.ts, cache-first
  - Structure feature-based (45 fichiers, ~2 900 lignes)

- [x] **Pipeline de données ANSM** (`scripts/import-ansm.ts`)
  - Téléchargement + parsing des 4 fichiers TSV ANSM
  - Nettoyage, normalisation, enrichissement DCI automatique
  - Import dans Supabase : **15 816 spécialités, 20 881 CIP13, 32 395 compositions, 8 479 alertes**

- [x] **Base de données locale (IndexedDB)**
  - 10 stores Dexie.js avec index
  - Chargement initial depuis Supabase + sync différentielle
  - Écran de chargement avec barre de progression

---

### ✅ Phase 1 — Recherche & Consultation (Semaines 3-5) — TERMINEE 29/03/2026

**Objectif** : Fonctionnalité cœur — trouver et consulter un médicament.

- [x] **Écran d'accueil** — barre de recherche, 10 catégories ATC, historique récent, indicateur offline
- [x] **Moteur de recherche** — MiniSearch fuzzy (Levenshtein), prefix matching, boost nom/DCI/ATC, debounce 150ms
- [x] **Fiche médicament détaillée** — header, badges ATC/classe/AMM/voie, composition SA, surdosage/CAT, alertes ANSM, bilan SAMU, favoris, disclaimer
- [x] **Navigation par classes thérapeutiques** — 10 catégories avec comptage dynamique, filtrage par préfixes ATC
- [x] **Favoris** — persistance IndexedDB, toggle depuis fiche ou liste

---

### ✅ Phase 2 — Scanner CIP13 (Semaines 6-7) — TERMINEE 29/03/2026

**Objectif** : Identification instantanée par scan de la boîte.

- [x] **Scanner code-barres** — html5-qrcode, overlay coins ambrés + ligne scan animée, flash/torche, feedback haptique, cooldown anti-doublon, gestion erreurs caméra
- [x] **Saisie manuelle CIP13** — input numérique, validation Luhn temps réel, auto-submit à 13 chiffres, affichage formaté
- [x] **Historique des scans** — liste chronologique 20 derniers, dates relatives, suppression, navigation vers fiche

---

### ✅ Phase 3 — Aide opérationnelle avancée (Semaines 8-10) — TERMINEE 03/04/2026

**Objectif** : Outils d'aide à la décision pour l'équipage.

- [x] **Vérificateur d'interactions** — picker modal avec recherche, détection croisée par DCI, code couleur 4 niveaux, CAT par interaction, bouton copie bilan CRRA 15. 31 interactions en base (10 contre-indiquées, 9 déconseillées, 8 précaution, 4 à prendre en compte)

- [x] **Fiches réflexes surdosage** — 30 DCI couvertes : paracétamol, morphine, tramadol, codéine, alprazolam, bromazépam, diazépam, zopiclone, zolpidem, bisoprolol, propranolol, amlodipine, diltiazem, apixaban, rivaroxaban, warfarine, metformine, insuline, amitriptyline, valproate, carbamazépine, lévothyroxine, colchicine, lithium, digoxine, salbutamol, prednisone, amiodarone, clopidogrel, ibuprofène. Dose toxique, symptômes, CAT, antidote, gravité, orientation

- [x] **Mode « Bilan SAMU »** — ✅ bouton copie presse-papiers (nom, DCI, classe, CAT, antidote, orientation)

- [x] **Favoris** — ✅ étoile toggle, persistance IndexedDB, page dédiée

- [ ] **Annotations** — notes personnelles, listes personnalisées (post-MVP)

---

### ✅ Phase 4 — Indications, alertes visuelles, données embarquées (Semaines 10-12) — TERMINEE 07/04/2026

**Objectif** : Rendre l'app immédiatement utile et autonome dès l'installation.

- [x] **Indications en langage simple** — 60 DCI couvertes (30 avec CAT + 30 extra : IEC, sartans, statines, IPP, ISRS, diurétiques, antiépileptiques, antibiotiques, etc.). Affichée en sous-titre dans les résultats et en première section de la fiche détaillée.

- [x] **Alertes visuelles par gravité dans les résultats** — Badge `⚠️ Létal` (rouge) et `⚠️ Élevé` (orange) visible dans toutes les listes (recherche, catégories, favoris). Hook `useSurdosageMap` pour croisement DCI × fiches CAT en mémoire.

- [ ] **Données embarquées dans le build** — script préparé, à finaliser (export JSON compressé dans `public/data/`, fallback dans le loader si pas de réseau au premier lancement)

---

### 🔷 Phase 5 — Mode intervention (Semaines 13-15)

**Objectif** : Workflow guidé pour structurer le recueil médicamenteux en intervention.

- [ ] **Page "Nouvelle intervention"** (`/intervention`)
  - Chronomètre automatique démarré à l'ouverture
  - Workflow : Identifier → Vérifier interactions → Transmettre bilan
  - Liste des médicaments trouvés avec badge gravité + indication
  - Vérificateur d'interactions intégré (alimenté automatiquement)

- [ ] **Bilan d'intervention structuré**
  - Génération automatique : liste médicaments + interactions + alertes surdosage
  - Format structuré pour transmission CRRA 15
  - Bouton "Copier" + bouton "Partager" (Web Share API)

- [ ] **Horodatage et traçabilité**
  - Chaque action horodatée (scan, recherche, ajout/retrait)
  - Historique des interventions consultable depuis les réglages
  - Export texte/PDF pour rapport d'intervention
  - Géolocalisation optionnelle

---

### 🔷 Phase 6 — Mode terrain & UX avancée (Semaines 16-18)

**Objectif** : Optimisation pour les conditions réelles d'intervention.

- [ ] **Mode nuit / haute visibilité**
  - Thème sombre profond (défaut) pour intervention nocturne
  - Mode haute visibilité (contrastes renforcés, tailles augmentées)
  - Respect WCAG AAA pour tous les textes critiques

- [ ] **Mode gants**
  - Cibles tactiles minimum 56x56px
  - Espacement renforcé entre éléments interactifs
  - Gestes simplifiés (pas de double-tap, pas de pinch)

- [ ] **Installation PWA**
  - Prompt d'installation natif (banner personnalisé)
  - Splash screen aux couleurs MedOps
  - Icône adaptative Android / iOS

---

### 🔷 Phase 7 — Qualité & Déploiement (Semaines 19-20)

**Objectif** : Fiabilité, tests et mise en production.

- [ ] **Tests**
  - Tests unitaires Vitest (moteur de recherche, parsing ANSM, interactions)
  - Tests d'intégration (flux scan → fiche, recherche → résultat)
  - Tests E2E Playwright (parcours utilisateur complets)
  - Tests de performance offline (Lighthouse PWA score > 95)
  - Tests d'accessibilité (axe-core)
  - Tests sur appareils réels (Android divers + iOS Safari)

- [ ] **Sécurité & conformité**
  - Aucune donnée personnelle collectée (privacy by design)
  - Aucune donnée médicale patient stockée
  - CSP headers strictes
  - Mentions légales et avertissement réglementaire
  - Conformité RGPD (pas de tracking, pas de cookies tiers)

- [ ] **Documentation**
  - README technique complet
  - Guide d'utilisation pour les équipages
  - Documentation API du pipeline ANSM
  - Guide de contribution (si open source)

- [ ] **Déploiement**
  - CI/CD GitHub Actions
  - Déploiement Vercel (ou auto-hébergé selon stratégie Orionis)
  - Monitoring (Sentry pour les erreurs)
  - Pipeline de mise à jour automatique de la base ANSM

---

## 🔮 Évolutions futures (post-MVP)

| Priorité | Fonctionnalité | Description |
| --- | --- | --- |
| 🟡 P1 | Reconnaissance visuelle | Identification par photo du comprimé (forme, couleur, gravure) via modèle IA local |
| 🟡 P1 | Protocoles départementaux | Import des protocoles opérationnels SDIS personnalisés |
| 🟡 P1 | Mode multi-victimes | Gestion simultanée de plusieurs bilans médicamenteux |
| 🟢 P2 | Recherche vocale | Dictée du nom du médicament (Web Speech API) |
| 🟢 P2 | Export PDF bilan | Génération d'un PDF structuré pour le rapport d'intervention |
| 🟢 P2 | Synchronisation équipage | Partage en temps réel des médicaments identifiés entre membres de l'équipage (WebRTC P2P) |
| 🔵 P3 | API SDIS | Intégration avec les logiciels opérationnels (ARTEMIS, SyGAL…) |
| 🔵 P3 | Base Vidal / BCB | Enrichissement avec des sources payantes (nécessite licence) |
| 🔵 P3 | Multilingue | Interface en anglais pour les zones frontalières / touristiques |

---

## 📊 KPIs de succès

| Métrique | Objectif |
| --- | --- |
| Temps de recherche (saisie → fiche) | < 3 secondes |
| Temps de scan CIP13 → fiche | < 2 secondes |
| Score Lighthouse PWA | > 95/100 |
| Taille de la base offline | < 25 Mo |
| Couverture des spécialités AMM France | > 95% (~15 000) |
| Disponibilité offline | 100% après premier chargement |
| Taille cibles tactiles | ≥ 48x48px (mode gants : 56x56px) |

---

## 🏗️ Architecture simplifiée

```
medops/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/             # Layout principal
│   │   │   ├── page.tsx        # Accueil + recherche
│   │   │   ├── med/[id]/       # Fiche médicament
│   │   │   ├── scan/           # Scanner CIP13
│   │   │   ├── interactions/   # Vérificateur interactions
│   │   │   ├── favorites/      # Favoris
│   │   │   └── settings/       # Paramètres
│   │   ├── layout.tsx          # Root layout + providers
│   │   └── manifest.ts         # PWA manifest
│   ├── components/
│   │   ├── ui/                 # Composants génériques
│   │   ├── search/             # SearchBar, Autocomplete, Results
│   │   ├── medication/         # MedCard, MedDetail, InfoBlock
│   │   ├── scanner/            # CameraScanner, ManualInput
│   │   └── shared/             # Header, Navigation, StatusBar
│   ├── lib/
│   │   ├── db/                 # Dexie.js config, stores, migrations
│   │   ├── ansm/               # Pipeline import, parsing, normalisation
│   │   ├── search/             # Moteur fuzzy search, indexation
│   │   └── utils/              # Helpers, formatters
│   ├── hooks/                  # Custom hooks (useSearch, useScan, useOffline)
│   └── types/                  # TypeScript types & interfaces
├── scripts/
│   └── import-ansm.ts          # Script d'import base ANSM
├── public/
│   ├── data/                   # Base ANSM compilée (JSON)
│   └── icons/                  # Icônes PWA
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── GUIDE_UTILISATEUR.md
    └── ARCHITECTURE.md
```

---

## 📝 Notes importantes

- **Source de données** : La base publique du médicament (base-donnees-publique.medicaments.gouv.fr) est en open data et mise à jour mensuellement par l'ANSM. L'utilisation est libre et gratuite.
- **Responsabilité** : MedOps est un outil d'aide à l'identification. Il ne se substitue en aucun cas à l'avis du médecin régulateur du CRRA 15 ni aux protocoles opérationnels départementaux.
- **Confidentialité** : Aucune donnée patient n'est collectée ni stockée. L'application fonctionne intégralement en local.
- **Cible initiale** : Sapeurs-pompiers SDIS en intervention SAP/VSAV. Extension possible aux premiers répondants, infirmiers sapeurs-pompiers, et médecins de sapeurs-pompiers.

---

*MedOps — Un projet Orionis Solutions SAS*
*Dernière mise à jour : 07 avril 2026*
