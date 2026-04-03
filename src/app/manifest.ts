import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MedOps — Identification Medicamenteuse",
    short_name: "MedOps",
    description:
      "Aide a l'identification medicamenteuse pour les Sapeurs-Pompiers",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1220",
    theme_color: "#f59e0b",
    orientation: "portrait",
    categories: ["medical", "health"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
