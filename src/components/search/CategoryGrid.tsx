"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Category } from "@/lib/utils/categories";

interface CategoryGridProps {
  categories: Category[];
  onSelect: (category: Category) => void;
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    async function loadCounts() {
      const allMeds = await db.medications.toArray();
      const map = new Map<string, number>();

      for (const cat of categories) {
        const count = allMeds.filter((m) =>
          cat.atcPrefixes.some((prefix) => m.codeATC.startsWith(prefix)),
        ).length;
        map.set(cat.id, count);
      }

      setCounts(map);
    }

    loadCounts();
  }, [categories]);

  return (
    <section aria-label="Classes thérapeutiques">
      <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-2.5 px-0.5">
        Classes thérapeutiques
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {categories.map((cat) => {
          const count = counts.get(cat.id) ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="flex items-center gap-2.5 p-3 bg-slate-800/30 hover:bg-slate-800/70 border-2 border-slate-700/25 hover:border-slate-600/50 rounded-xl transition-all duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              <span className="text-lg" aria-hidden="true">{cat.icon}</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-300 leading-tight">
                  {cat.label}
                </p>
                <p className="text-[10px] text-slate-600">
                  {count > 0
                    ? `${count} spécialité${count > 1 ? "s" : ""}`
                    : "—"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
