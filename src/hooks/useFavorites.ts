"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    db.favorites.toArray().then((favs) => {
      setFavoriteIds(new Set(favs.map((f) => f.codeCIS)));
    });
  }, []);

  const toggleFavorite = useCallback(async (codeCIS: string) => {
    const exists = await db.favorites.get(codeCIS);
    if (exists) {
      await db.favorites.delete(codeCIS);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(codeCIS);
        return next;
      });
    } else {
      await db.favorites.put({ codeCIS, addedAt: new Date().toISOString() });
      setFavoriteIds((prev) => new Set(prev).add(codeCIS));
    }
  }, []);

  const isFavorite = useCallback(
    (codeCIS: string) => favoriteIds.has(codeCIS),
    [favoriteIds],
  );

  return { favoriteIds, toggleFavorite, isFavorite };
}
