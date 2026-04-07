"use client";

import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center md:justify-center animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full md:max-w-2xl max-h-[80vh] md:max-h-[85vh] bg-slate-900 border-t-2 md:border-2 border-slate-700 rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col animate-[slideUp_0.2s_ease-out] md:animate-[fadeIn_0.15s_ease-out]">
        <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-800">
          <p
            id="modal-title"
            className="text-sm md:text-base font-bold text-slate-200"
          >
            {title}
          </p>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
