"use client";

import { useState, useEffect, useRef } from "react";
import { search, type SearchResult } from "@/lib/search/engine";

export function useSearch(query: string, debounceMs = 150) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const found = search(query, 20);
      setResults(found);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  return results;
}
