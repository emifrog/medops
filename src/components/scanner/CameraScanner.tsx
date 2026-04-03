"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { BoltIcon, BoltSlashIcon } from "@heroicons/react/24/solid";

interface CameraScannerProps {
  onScan: (code: string) => void;
  active: boolean;
}

type ScannerStatus = "initializing" | "scanning" | "error";

export function CameraScanner({ onScan, active }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ScannerStatus>("initializing");
  const [flashOn, setFlashOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef(false);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (cooldownRef.current || decodedText === lastScannedRef.current) return;
      cooldownRef.current = true;
      lastScannedRef.current = decodedText;

      const digits = decodedText.replace(/\D/g, "");
      if (digits.length === 13) {
        if (navigator.vibrate) navigator.vibrate(200);
        onScan(digits);
      }

      setTimeout(() => {
        cooldownRef.current = false;
        lastScannedRef.current = "";
      }, 2000);
    },
    [onScan],
  );

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const elementId = "medops-scanner";
    let scanner: Html5Qrcode | null = null;

    async function startScanner() {
      try {
        setStatus("initializing");
        setErrorMsg("");

        scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          handleScanSuccess,
          () => {},
        );

        setStatus("scanning");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur caméra inconnue";
        if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
          setErrorMsg("Accès à la caméra refusé. Autorisez l'accès dans les paramètres.");
        } else if (msg.includes("NotFoundError") || msg.includes("device")) {
          setErrorMsg("Aucune caméra détectée sur cet appareil.");
        } else {
          setErrorMsg(msg);
        }
        setStatus("error");
      }
    }

    startScanner();

    return () => {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [active, handleScanSuccess]);

  const toggleFlash = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.applyVideoConstraints({
        // @ts-expect-error torch is a valid constraint
        advanced: [{ torch: !flashOn }],
      });
      setFlashOn(!flashOn);
    } catch {
      // Torche non supportée
    }
  }, [flashOn]);

  if (status === "error") {
    return (
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-3/4 max-h-[55vh] flex items-center justify-center border-2 border-slate-800">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 opacity-80" />
        <div className="text-center z-10 p-8" role="alert">
          <p className="text-4xl mb-4" aria-hidden="true">📷</p>
          <p className="text-red-400 font-medium text-sm mb-2">
            Caméra indisponible
          </p>
          <p className="text-slate-500 text-xs leading-relaxed max-w-60">
            {errorMsg}
          </p>
          <p className="text-slate-600 text-xs mt-4">
            Utilisez la saisie manuelle CIP13 ci-dessous
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden aspect-3/4 max-h-[55vh] border-2 border-slate-800">
      <div id="medops-scanner" ref={containerRef} className="w-full h-full" />

      {status === "scanning" && (
        <>
          {/* Coins ambrés */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t-[3px] border-l-[3px] border-amber-500 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-[3px] border-r-[3px] border-amber-500 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-[3px] border-l-[3px] border-amber-500 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-[3px] border-r-[3px] border-amber-500 rounded-br-lg pointer-events-none" />

          {/* Ligne de scan */}
          <div className="absolute left-8 right-8 h-0.5 bg-linear-to-r from-transparent via-amber-500 to-transparent animate-[scanLine_2.5s_ease-in-out_infinite] shadow-[0_0_20px_rgba(245,158,11,0.4)] pointer-events-none" />

          {/* Texte */}
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
            <p className="text-amber-400/80 text-sm font-medium animate-pulse">
              Pointez vers le code-barres CIP13
            </p>
          </div>

          {/* Flash */}
          <button
            onClick={toggleFlash}
            aria-label={flashOn ? "Désactiver la torche" : "Activer la torche"}
            aria-pressed={flashOn}
            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-150 z-10 focus-visible:outline-2 focus-visible:outline-amber-500 ${
              flashOn
                ? "bg-amber-500 text-black"
                : "bg-black/50 text-white/70 hover:text-white"
            }`}
          >
            {flashOn ? (
              <BoltIcon className="w-5 h-5" />
            ) : (
              <BoltSlashIcon className="w-5 h-5" />
            )}
          </button>
        </>
      )}

      {status === "initializing" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10" role="status">
          <p className="text-slate-400 text-sm animate-pulse">
            Démarrage de la caméra...
          </p>
        </div>
      )}
    </div>
  );
}
