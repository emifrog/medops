"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { useDatabase } from "@/hooks/useDatabase";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, reload } = useDatabase();

  if (state.status !== "ready") {
    return <LoadingScreen state={state} onRetry={reload} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-950">
      <Header dbVersion={state.version} dbCount={state.count} />
      <main className="max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 pb-24 md:pb-6 md:pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
