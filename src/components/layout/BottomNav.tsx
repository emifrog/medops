"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ViewfinderCircleIcon,
  BeakerIcon,
  StarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  ViewfinderCircleIcon as ViewfinderSolid,
  BeakerIcon as BeakerSolid,
  StarIcon as StarSolid,
  Cog6ToothIcon as CogSolid,
} from "@heroicons/react/24/solid";

const tabs = [
  {
    id: "search",
    href: "/",
    label: "Recherche",
    Icon: MagnifyingGlassIcon,
    ActiveIcon: MagnifyingGlassSolid,
    matchPaths: ["/", "/med"],
  },
  {
    id: "scan",
    href: "/scan",
    label: "Scanner",
    Icon: ViewfinderCircleIcon,
    ActiveIcon: ViewfinderSolid,
    matchPaths: ["/scan"],
  },
  {
    id: "interactions",
    href: "/interactions",
    label: "Interactions",
    Icon: BeakerIcon,
    ActiveIcon: BeakerSolid,
    matchPaths: ["/interactions"],
  },
  {
    id: "favorites",
    href: "/favorites",
    label: "Favoris",
    Icon: StarIcon,
    ActiveIcon: StarSolid,
    matchPaths: ["/favorites"],
  },
  {
    id: "settings",
    href: "/settings",
    label: "Réglages",
    Icon: Cog6ToothIcon,
    ActiveIcon: CogSolid,
    matchPaths: ["/settings"],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t-2 border-slate-800/60"
      aria-label="Navigation principale"
    >
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const active = tab.matchPaths.some(
            (p) => pathname === p || (p !== "/" && pathname.startsWith(p)),
          );
          const IconComponent = active ? tab.ActiveIcon : tab.Icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500 ${
                active
                  ? "text-amber-500"
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
