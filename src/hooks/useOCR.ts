"use client";

import { useState, useCallback, useRef } from "react";
import { search, type SearchResult } from "@/lib/search/engine";

export type OCRStatus =
  | "idle"
  | "loading-engine"
  | "recognizing"
  | "extracting"
  | "done"
  | "error";

export interface OCRResult {
  rawText: string;
  cleanedWords: string[];
  candidates: SearchResult[];
}

/**
 * Hook OCR : photo → extraction texte → recherche automatique dans la base MedOps
 *
 * Utilise Tesseract.js (OCR local, aucune donnée envoyée au cloud)
 */
export function useOCR() {
  const [status, setStatus] = useState<OCRStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<import("tesseract.js").Worker | null>(null);

  const processImage = useCallback(async (imageSource: string | File | Blob) => {
    setStatus("loading-engine");
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // Import dynamique de Tesseract.js (ne charge que côté client)
      const Tesseract = await import("tesseract.js");

      setStatus("recognizing");

      // Créer le worker avec le français
      const worker = await Tesseract.createWorker("fra", undefined, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });
      workerRef.current = worker;

      // Lancer la reconnaissance
      const { data } = await worker.recognize(imageSource);

      await worker.terminate();
      workerRef.current = null;

      setStatus("extracting");

      // Nettoyer le texte brut
      const rawText = data.text;

      // Extraire les mots potentiellement des noms de médicaments
      // - Garder les mots de 3+ caractères
      // - Supprimer la ponctuation
      // - Supprimer les chiffres isolés
      const words = rawText
        .replace(/[^a-zA-ZÀ-ÿ0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .map((w) => w.trim())
        .filter(Boolean);

      // Dédupliquer
      const uniqueWords = [...new Set(words.map((w) => w.toUpperCase()))];

      // Rechercher chaque mot dans la base MedOps
      const allCandidates: SearchResult[] = [];
      const seenCIS = new Set<string>();

      for (const word of uniqueWords) {
        const results = search(word, 3);
        for (const r of results) {
          if (!seenCIS.has(r.codeCIS) && r.score > 2) {
            seenCIS.add(r.codeCIS);
            allCandidates.push(r);
          }
        }
      }

      // Aussi tenter des combinaisons de 2 mots consécutifs (ex: "DOLIPRANE 1000")
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        const results = search(bigram, 3);
        for (const r of results) {
          if (!seenCIS.has(r.codeCIS) && r.score > 3) {
            seenCIS.add(r.codeCIS);
            allCandidates.push(r);
          }
        }
      }

      // Trier par score décroissant
      allCandidates.sort((a, b) => b.score - a.score);

      const ocrResult: OCRResult = {
        rawText,
        cleanedWords: uniqueWords,
        candidates: allCandidates.slice(0, 10),
      };

      setResult(ocrResult);
      setStatus("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur OCR inconnue";
      setError(msg);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, processImage, reset };
}
