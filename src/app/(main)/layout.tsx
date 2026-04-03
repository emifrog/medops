"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { useDatabase } from "@/hooks/useDatabase";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, reload } = useDatabase();

  // Afficher l'écran de chargement tant que la base n'est pas prête
  if (state.status !== "ready") {
    return <LoadingScreen state={state} onRetry={reload} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0c1220] to-slate-950">
      <Header dbVersion={state.version} dbCount={state.count} />
      <main className="max-w-lg mx-auto px-4 py-4 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
