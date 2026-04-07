# MedOps — Plan d'action

> **Version :** 5.0 · **Date :** 07 avril 2026
> **Stack :** Next.js 16 + Supabase + Tailwind CSS 4 + Serwist PWA
> **Dépôt :** https://github.com/emifrog/medops

---

## Tableau de bord

| Phase | Contenu | Statut | Date |
|---|---|---|---|
| Phase 1 — Fondations | Next.js 16, Supabase, Serwist, Dexie.js, pipeline ANSM | ✅ | 29/03 |
| Phase 2 — Recherche & Consultation | MiniSearch fuzzy, catégories ATC, fiches détaillées, favoris | ✅ | 29/03 |
| Phase 3 — Scanner & Données enrichies | Scanner CIP13, Photo OCR, 30 fiches CAT, 31 interactions | ✅ | 03/04 |
| Phase 4 — Indications & Alertes visuelles | 60 indications simples, badges gravité, migration Supabase | ✅ | 07/04 |
| Phase 5 — Mode intervention | Workflow guidé, bilan structuré CRRA 15, chrono, traçabilité | ⬜ | — |

**Base Supabase :** 15 816 spécialités · 20 881 CIP13 · 32 395 compositions · 8 479 alertes · 15 814 DCI · 30 fiches CAT/surdosage · 60 indications · 31 interactions

**Codebase :** 49 fichiers · ~3 700 lignes TypeScript · 8 commits

---

## Ce qui est livré (Phases 1-4)

### Infrastructure
- [x] Next.js 16 (App Router) + TypeScript strict + Tailwind CSS 4
- [x] Supabase PostgreSQL : 7 tables, index, RLS (lecture publique)
- [x] Serwist PWA : service worker, manifest.ts, cache-first (désactivé en dev)
- [x] Dexie.js 4 : 10 stores IndexedDB, chargement initial + sync différentielle
- [x] Client Supabase lazy (compatible SSR/prerender Vercel)
- [x] Déploiement Vercel (route group `(main)` supprimé pour compatibilité)

### Pipeline de données
- [x] Script `import-ansm.ts` : téléchargement + parsing TSV ANSM → Supabase
- [x] URLs ANSM mises à jour (`/download/file/`), encodage UTF-8, filtrage CIS invalides
- [x] Enrichissement automatique DCI depuis compositions (15 814 / 15 816)
- [x] Script `seed-surdosage.ts` : 30 fiches CAT (dose toxique, symptômes, antidote, CAT, gravité)
- [x] Script `seed-interactions.ts` : 31 interactions (10 CI, 9 déconseillées, 8 précaution, 4 APC)
- [x] Script `seed-indications.ts` : 60 indications en langage simple
- [x] Migration SQL `002_add_indication.sql`

### Recherche & Navigation
- [x] MiniSearch : fuzzy (Levenshtein), prefix, boost nom×3/DCI×2/ATC×1.5, debounce 150ms
- [x] 10 catégories thérapeutiques ATC avec comptage dynamique
- [x] Historique récent (10 derniers consultés, carrousel horizontal)
- [x] Bottom nav 5 onglets avec `aria-current`, focus-visible
- [x] Header : logo, compteur spécialités, indicateur en ligne/hors ligne

### Fiche médicament (`/med/[cis]`)
- [x] Header : nom, DCI, dosage, forme, labo
- [x] Badges : ATC, catégorie, classe, statut AMM, voie
- [x] Section indication (depuis table `surdosage.indication`)
- [x] Section composition (substances actives SA)
- [x] Section surdosage/CAT (dose toxique, symptômes, antidote, CAT, orientation)
- [x] Section alertes ANSM (individuelles, avec dates et liens)
- [x] Bouton favori + bouton bilan SAMU (copie presse-papiers)
- [x] Disclaimer réglementaire

### Scanner (`/scan`)
- [x] **Mode Photo OCR** (par défaut) : Tesseract.js français, photo → extraction texte → recherche MiniSearch
- [x] **Mode Code-barres** : html5-qrcode, overlay ambre, flash/torche, feedback haptique, cooldown
- [x] Saisie manuelle CIP13 : validation Luhn temps réel, auto-submit, affichage formaté
- [x] Historique des scans (20 derniers, dates relatives, suppression)

### Vérificateur d'interactions (`/interactions`)
- [x] Picker modal avec recherche fuzzy, sélection multi (max 10)
- [x] Détection croisée par DCI, 4 niveaux de gravité avec code couleur
- [x] CAT par interaction, bouton copier le bilan

### Alertes visuelles
- [x] Badge `⚠️ Létal` (rouge) / `⚠️ Élevé` (orange) dans toutes les listes
- [x] Indication en sous-titre (remplace DCI · forme quand disponible)
- [x] Hook `useSurdosageMap` : croisement résultats × fiches CAT par DCI

### Accessibilité & UX
- [x] ARIA : labels, current, pressed, live, invalid, describedby, roles
- [x] Focus-visible amber sur tous les éléments interactifs
- [x] Transitions duration-150/200 harmonisées
- [x] Accents français corrigés partout
- [x] Bordures border-2 homogènes

---

## Architecture actuelle

```
medops/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + AppShellLoader
│   │   ├── manifest.ts             # PWA manifest
│   │   ├── sw.ts                   # Service Worker (Serwist)
│   │   ├── globals.css             # Tailwind + thème + animations
│   │   ├── page.tsx                # Accueil + recherche + catégories
│   │   ├── med/[cis]/page.tsx      # Fiche médicament
│   │   ├── scan/page.tsx           # Scanner (photo OCR + code-barres)
│   │   ├── interactions/page.tsx   # Vérificateur interactions
│   │   ├── favorites/page.tsx      # Favoris
│   │   └── settings/page.tsx       # Réglages
│   ├── components/
│   │   ├── layout/                 # AppShell, AppShellLoader, Header, BottomNav, LoadingScreen
│   │   ├── ui/                     # Badge, InfoSection, Toggle
│   │   ├── search/                 # SearchBar, SearchResults, CategoryGrid
│   │   ├── medication/             # MedListItem, MedDetail
│   │   └── scanner/                # CameraScanner, PhotoScanner, ManualCIPInput, ScanHistory
│   ├── hooks/                      # useDatabase, useSearch, useMedication, useCIPLookup,
│   │                                 useFavorites, useHistory, useInteractions, useOCR,
│   │                                 useOfflineStatus, useSurdosageMap, useCategoryMeds
│   ├── lib/
│   │   ├── supabase/               # client.ts (lazy), server.ts, types.ts
│   │   ├── db/                     # index.ts, schema.ts, loader.ts
│   │   ├── search/                 # engine.ts (MiniSearch)
│   │   └── utils/                  # categories.ts, cip13.ts, formatters.ts
│   └── types/                      # medication.ts, interaction.ts, surdosage.ts
├── scripts/
│   ├── import-ansm.ts              # Pipeline ANSM → Supabase
│   ├── seed-surdosage.ts           # 30 fiches CAT
│   ├── seed-interactions.ts        # 31 interactions
│   └── seed-indications.ts         # 60 indications simples
├── supabase/migrations/
│   ├── 001_initial_schema.sql      # 7 tables + index + RLS
│   └── 002_add_indication.sql      # Colonne indication
├── next.config.ts                  # Serwist (disable en dev)
└── .env.example
```

---

## Phase 5 — Mode intervention (Prochaine étape)

> Workflow guidé pour structurer le recueil médicamenteux en intervention SAP/VSAV.

### 5.1 Page "Nouvelle intervention" (`/intervention`)

- [ ] Bouton "Démarrer une intervention" accessible depuis l'accueil
- [ ] Chronomètre automatique dès l'ouverture
- [ ] Workflow en 3 étapes :
  1. **Identifier** : scanner ou rechercher les médicaments un par un
  2. **Vérifier** : interactions croisées alimentées automatiquement
  3. **Transmettre** : bilan complet pour le CRRA 15
- [ ] Liste des médicaments trouvés avec badge gravité + indication
- [ ] Bouton "Voir la fiche" et "Retirer" pour chaque médicament

### 5.2 Bilan d'intervention structuré

- [ ] Génération automatique :
  ```
  ═══ BILAN MÉDICAMENTEUX ═══
  Date : 07/04/2026 — 14h32 · Durée : 8 min

  MÉDICAMENTS TROUVÉS (4) :
  1. DOLIPRANE 1000mg (Paracétamol) — Antalgique
  2. KARDEGIC 75mg (Aspirine) — Antiagrégant
  3. ELIQUIS 5mg (Apixaban) — AOD
  4. BISOPROLOL 5mg — Bêtabloquant

  ⛔ INTERACTIONS CRITIQUES :
  • Aspirine + Apixaban — Risque hémorragique majeur

  ⚠️ ALERTES SURDOSAGE :
  • Apixaban (VITALE) — Pas d'antidote disponible
  • Bisoprolol (VITALE) — Antidote : Glucagon IV

  ═══ Généré par MedOps ═══
  ```
- [ ] Bouton "Copier le bilan" + bouton "Partager" (Web Share API)
- [ ] Historique des interventions dans les réglages

### 5.3 Horodatage et traçabilité

- [ ] Chaque action horodatée (scan, recherche, ajout/retrait)
- [ ] Table IndexedDB `interventions`
- [ ] Export texte pour rapport d'intervention
- [ ] Géolocalisation optionnelle

---

## Phases futures

### Phase 6 — Mode terrain & UX avancée

- [ ] Mode gants : cibles tactiles 56px, espacement renforcé
- [ ] Mode haute visibilité : contrastes WCAG AAA, tailles augmentées
- [ ] Données embarquées dans le build (offline dès l'installation)
- [ ] Prompt d'installation PWA personnalisé

### Phase 7 — Qualité & Production

- [ ] Tests Vitest (recherche, parsing, interactions, CIP13)
- [ ] Tests E2E Playwright (parcours complets)
- [ ] CI/CD GitHub Actions (lint + tests sur PR, deploy sur main)
- [ ] CRON mensuel mise à jour ANSM
- [ ] Documentation technique + guide utilisateur

---

## Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Données CAT absentes de l'ANSM | **Critique** | ✅ Résolu : 30 fiches manuelles + 60 indications |
| Thesaurus interactions en PDF | **Élevé** | ✅ Résolu : 31 interactions saisies manuellement |
| Next.js 16 + webpack route groups | **Modéré** | ✅ Résolu : suppression du route group `(main)` |
| Taille base > 25 Mo au 1er chargement | **Modéré** | À faire : données embarquées dans le build |
| iOS Safari purge IndexedDB | **Élevé** | À faire : reconstitution auto + avertissement |
| Supabase free tier (500K req/mois) | **Faible** | OK : trafic majoritairement offline |
