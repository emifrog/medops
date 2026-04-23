"use client";

import dynamic from "next/dynamic";
import { Logo } from "@/components/ui/Logo";

const AppShell = dynamic(
  () => import("@/components/layout/AppShell").then((m) => m.AppShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Logo className="w-16 h-16 rounded-2xl shadow-lg shadow-amber-900/30 mb-6" />
        <h1 className="text-xl font-black mb-2">
          MED<span className="text-amber-500">OPS</span>
        </h1>
        <p className="text-slate-500 text-sm animate-pulse">
          Initialisation...
        </p>
      </div>
    ),
  },
);

export function AppShellLoader({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
