"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { loadDatabase, type LoadingState } from "@/lib/db/loader";
import { buildIndex, invalidateIndexCache } from "@/lib/search/engine";
import { purgeHistory } from "@/lib/db/history";

interface DatabaseContextValue {
  state: LoadingState;
  searchReady: boolean;
  reload: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

/**
 * Provider React pour l'état global de la base de données.
 *
 * Centralise le chargement IndexedDB + indexation MiniSearch en une seule
 * instance. Sans ce provider, chaque composant appelant useDatabase()
 * relance loadDatabase() (fetch version Supabase + re-indexation), ce qui
 * consomme inutilement des requêtes Supabase et génère des re-renders en
 * cascade.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadingState>({ status: "idle" });
  const [searchReady, setSearchReady] = useState(false);

  const init = useCallback(async () => {
    await loadDatabase(setState);
    try {
      await buildIndex();
      setSearchReady(true);
    } catch {
      // Index peut échouer si la base est vide (premier lancement offline)
    }
    // Purge de l'historique en arrière-plan (non bloquant)
    purgeHistory().catch(() => {});
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const reload = useCallback(async () => {
    setState({ status: "idle" });
    setSearchReady(false);
    // Force un rebuild de l'index même si la version ne change pas
    await invalidateIndexCache();
    await init();
  }, [init]);

  return (
    <DatabaseContext.Provider value={{ state, searchReady, reload }}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Hook pour accéder à l'état de la base depuis n'importe quel composant.
 *
 * Doit être appelé à l'intérieur d'un <DatabaseProvider>. En dehors du
 * provider, retourne un état "idle" (pas d'erreur, mais aucune donnée).
 * Ce comportement permet un rendu graceful pendant le mount initial.
 */
export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    // Fallback : aucun provider monté
    return {
      state: { status: "idle" },
      searchReady: false,
      reload: async () => {},
    };
  }
  return ctx;
}
