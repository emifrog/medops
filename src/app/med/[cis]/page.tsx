"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMedication } from "@/hooks/useMedication";
import { useFavorites } from "@/hooks/useFavorites";
import { MedDetail } from "@/components/medication/MedDetail";
import { MedDetailSkeleton } from "@/components/ui/Skeleton";

export default function MedicationPage({
  params,
}: {
  params: Promise<{ cis: string }>;
}) {
  const { cis } = use(params);
  const router = useRouter();
  const { medication, loading } = useMedication(cis);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) {
    return <MedDetailSkeleton />;
  }

  if (!medication) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-slate-400 font-medium">Medicament introuvable</p>
        <p className="text-slate-600 text-sm mt-1">Code CIS : {cis}</p>
      </div>
    );
  }

  return (
    <MedDetail
      medication={medication}
      onBack={() => router.back()}
      isFavorite={isFavorite(medication.codeCIS)}
      onToggleFavorite={() => toggleFavorite(medication.codeCIS)}
    />
  );
}
