"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-2xl animate-[slideUp_0.2s_ease-out] bg-slate-800 border-slate-600/60"
          >
            {t.type === "success" && (
              <CheckCircleIcon className="w-5 h-5 text-green-400 shrink-0" />
            )}
            {t.type === "error" && (
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
            )}
            {t.type === "info" && (
              <InformationCircleIcon className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <p className="text-sm font-medium text-slate-200 flex-1">
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Fermer"
              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
