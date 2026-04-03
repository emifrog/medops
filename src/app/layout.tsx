import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MedOps — Identification Medicamenteuse",
  description:
    "Aide a l'identification medicamenteuse pour les Sapeurs-Pompiers",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MedOps",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${ibmPlex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white font-[var(--font-ibm-plex)]">
        {children}
      </body>
    </html>
  );
}
