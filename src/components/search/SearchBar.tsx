"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear?: () => void;
  showClear?: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onClear,
  showClear,
}: SearchBarProps) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Nom, DCI, code ATC..."
        aria-label="Rechercher un médicament"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="w-full pl-11 pr-10 py-3.5 bg-slate-800/70 border-2 border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 focus:bg-slate-800 transition-all duration-200 text-base"
        autoFocus
      />
      {showClear && (
        <button
          onClick={onClear ?? (() => onQueryChange(""))}
          aria-label="Effacer la recherche"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/80 text-slate-400 hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
