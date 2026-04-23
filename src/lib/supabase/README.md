# Supabase types

## Fichiers

- `types.generated.ts` — types **auto-générés** depuis le schéma Supabase (source de vérité)
- `client.ts` / `server.ts` — clients Supabase typés via `Database`

## Régénérer les types

Après toute modification du schéma (migration SQL, nouvelle table, etc.) :

```bash
npm run supabase:types
```

Ce script utilise le CLI Supabase (installé en devDependency) et interroge
le projet distant pour produire `types.generated.ts`.

**Prérequis (une fois) :**

```bash
npx supabase login
```

## Utilisation

Importer `Database` ou le type union des tables :

```ts
import type { Database } from "@/lib/supabase/types.generated";

type SupabaseTable = keyof Database["public"]["Tables"];
type MedicationRow = Database["public"]["Tables"]["medications"]["Row"];
```

## Note

Le fichier `types.generated.ts` est committé dans le repo (pas de CI qui
le régénère à chaque build). Penser à lancer `npm run supabase:types`
et committer le résultat quand le schéma change.
