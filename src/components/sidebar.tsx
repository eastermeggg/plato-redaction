"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, BookOpen, Settings } from "lucide-react";
import { Dossier } from "@/data/types";
import { formatShortDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SidebarProps {
  dossier?: Dossier;
}

const NAV_ITEMS = [
  { href: "/dossiers/parapluie-042", label: "Dossiers", icon: FolderOpen },
  { href: "/bibliotheque", label: "Mes exemples", icon: BookOpen },
  { href: "#", label: "Paramètres", icon: Settings },
];

export function Sidebar({ dossier }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-plato-bd bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plato-dk text-sm font-bold text-white">
          P
        </div>
        <span className="text-lg font-semibold font-serif">Plato</span>
      </div>

      {/* Client Info — only when in dossier context */}
      {dossier && (
        <>
          <div className="border-b border-plato-bd px-5 py-4">
            <p className="font-mono text-xs text-plato-dk6">{dossier.reference}</p>
            <h2 className="mt-1 text-lg font-semibold">
              {dossier.clientFirstName} {dossier.clientName}
            </h2>
            <p className="text-sm text-plato-dk6">
              {formatShortDate(dossier.birthDate)} · {dossier.gender === "Homme" ? "M" : "F"}
            </p>

            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-plato-dk6">Accident</span>
                <span>{formatShortDate(dossier.accidentDate)}</span>
              </div>
              {dossier.consolidationDate && (
                <div className="flex justify-between">
                  <span className="text-plato-dk6">Consolidation</span>
                  <span>{formatShortDate(dossier.consolidationDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Chiffrage */}
          <div className="border-b border-plato-bd px-5 py-4">
            <p className="text-xs text-plato-dk6">Chiffrage total</p>
            <p className="text-xl font-semibold">
              {new Intl.NumberFormat("fr-FR").format(dossier.chiffrageTotal)}&nbsp;&euro;
            </p>
          </div>
        </>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href !== "#" && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-plato-dk"
                  : "text-plato-dk6 hover:bg-gray-50 hover:text-plato-dk"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-plato-bd px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600">
            V
          </div>
          <div>
            <p className="text-sm font-medium">Victor</p>
            <p className="text-xs text-plato-dk6">Déconnexion</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
