# Supabase types

## Fichiers

- `types.ts` — types **rédigés à la main** (source de vérité actuelle)
- `types.generated.ts` — types **auto-générés** depuis le schéma Supabase (à générer)
- `client.ts` / `server.ts` — clients Supabase typés via `Database`

## Régénérer les types depuis Supabase

```bash
npm run supabase:types
```

Ce script utilise le CLI Supabase (installé en devDependency) et interroge le
projet `nllepowaozpsahxjvbhj` pour produire `types.generated.ts`.

**Prérequis :** être connecté au CLI (`npx supabase login` une fois).

## Bascule vers les types générés

Quand `types.generated.ts` est à jour et que vous souhaitez l'utiliser comme
source de vérité :

1. Remplacer dans `client.ts` et `server.ts` :
   ```ts
   import type { Database } from "./types";
   ```
   par
   ```ts
   import type { Database } from "./types.generated";
   ```
2. Vérifier `npm run build` passe
3. Supprimer `types.ts`

## Pourquoi garder les deux pour l'instant ?

Le fichier manuel est stable et couvre les tables actuelles. Basculer
nécessite l'accès au CLI Supabase authentifié (hors CI). Plutôt que de
forcer la bascule maintenant, on garde la possibilité et on migre quand
on voudra aussi ajouter la génération à la CI.
