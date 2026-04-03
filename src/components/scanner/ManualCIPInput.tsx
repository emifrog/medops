"use client";

import { useState, useRef, useEffect } from "react";
import { isValidCIP13, formatCIP13 } from "@/lib/utils/cip13";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ManualCIPInputProps {
  onSubmit: (cip13: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function ManualCIPInput({
  onSubmit,
  loading,
  error,
}: ManualCIPInputProps) {
  const [code, setCode] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isComplete = code.length === 13;
  const isValid = isComplete && isValidCIP13(code);

  useEffect(() => {
    if (code.length > 0 && code.length < 13) {
      setValidationMsg(`${code.length}/13 chiffres`);
    } else if (isComplete && !isValid) {
      setValidationMsg("Checksum invalide — vérifiez le code");
    } else {
      setValidationMsg("");
    }
  }, [code, isComplete, isValid]);

  useEffect(() => {
    if (isValid && !loading) {
      onSubmit(code);
    }
  }, [isValid, code, loading, onSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
    setCode(val);
  };

  const handleSubmit = () => {
    if (!isComplete) {
      setValidationMsg("Le code CIP13 doit contenir 13 chiffres");
      return;
    }
    if (!isValid) {
      setValidationMsg("Code CIP13 invalide (checksum incorrect)");
      return;
    }
    onSubmit(code);
  };

  const handleClear = () => {
    setCode("");
    setValidationMsg("");
    inputRef.current?.focus();
  };

  const errorId = "cip13-error";

  return (
    <div className="p-4 bg-slate-800/30 border-2 border-slate-700/25 rounded-xl space-y-3">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
        Saisie manuelle CIP13
      </p>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="3400936295704"
            aria-label="Code CIP13"
            aria-invalid={isComplete && !isValid}
            aria-describedby={validationMsg || error ? errorId : undefined}
            className={`w-full px-4 py-3 bg-slate-900/60 border-2 rounded-xl text-white font-mono placeholder:text-slate-700 focus:outline-none text-sm transition-all duration-200 ${
              isComplete && isValid
                ? "border-green-500/50 focus:border-green-500/70"
                : isComplete && !isValid
                  ? "border-red-500/50 focus:border-red-500/70"
                  : "border-slate-700/50 focus:border-amber-500/50"
            }`}
            inputMode="numeric"
            maxLength={13}
          />
          {isComplete && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 ${isValid ? "text-green-400" : "text-red-400"}`}
              aria-hidden="true"
            >
              {isValid ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <XMarkIcon className="w-5 h-5" />
              )}
            </span>
          )}
        </div>
        <button
          onClick={isComplete ? handleSubmit : handleClear}
          disabled={loading}
          aria-label={code.length > 0 && !isComplete ? "Effacer" : "Valider le code CIP13"}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all duration-150 active:scale-95 min-w-14 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : code.length > 0 && !isComplete ? (
            "✕"
          ) : (
            "OK"
          )}
        </button>
      </div>

      {/* Affichage formaté */}
      {code.length > 0 && (
        <p className="text-xs font-mono text-slate-500 px-1" aria-hidden="true">
          {formatCIP13(code.padEnd(13, "·"))}
        </p>
      )}

      {/* Messages d'erreur */}
      {(validationMsg || error) && (
        <p
          id={errorId}
          role="alert"
          className={`text-xs px-1 ${
            error || (isComplete && !isValid)
              ? "text-red-400"
              : "text-slate-600"
          }`}
        >
          {error || validationMsg}
        </p>
      )}
    </div>
  );
}
