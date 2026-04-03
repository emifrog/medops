"use client";

import { useState, useEffect, useCallback } from "react";
import { loadDatabase, type LoadingState } from "@/lib/db/loader";
import { buildIndex } from "@/lib/search/engine";

export function useDatabase() {
  const [state, setState] = useState<LoadingState>({ status: "idle" });
  const [searchReady, setSearchReady] = useState(false);

  const init = useCallback(async () => {
    await loadDatabase(setState);

    // Construire l'index de recherche une fois la base chargée
    try {
      await buildIndex();
      setSearchReady(true);
    } catch {
      // L'index échoue si la base est vide, c'est OK
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const reload = useCallback(async () => {
    setState({ status: "idle" });
    setSearchReady(false);
    await init();
  }, [init]);

  return { state, searchReady, reload };
}
