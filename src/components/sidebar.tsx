"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine } from "lucide-react";
import { Dossier } from "@/data/types";
import { formatShortDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Sidebar({ dossier }: { dossier: Dossier }) {
  const pathname = usePathname();
  const isRedaction = pathname.includes("/redaction");

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
          P
        </div>
        <span className="text-lg font-semibold">Plato</span>
      </div>

      {/* Client Info */}
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold">
          {dossier.clientFirstName} {dossier.clientName}
        </h2>
        <p className="text-sm text-gray-500">
          {dossier.age} ans · {dossier.gender}
        </p>

        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Né.e le</span>
            <span>{formatShortDate(dossier.birthDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Accident</span>
            <span>{formatShortDate(dossier.accidentDate)}</span>
          </div>
          {dossier.consolidationDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Consolidation</span>
              <span>{formatShortDate(dossier.consolidationDate)}</span>
            </div>
          )}
          {dossier.liquidationDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Liquidation</span>
              <span>{formatShortDate(dossier.liquidationDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chiffrage */}
      <div className="border-b border-gray-200 px-5 py-4">
        <p className="text-xs text-gray-500">Chiffrage total</p>
        <p className="text-xl font-semibold">
          {new Intl.NumberFormat("fr-FR").format(dossier.chiffrageTotal)}&euro;
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3">
        <Link
          href={`/dossiers/${dossier.id}/redaction`}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isRedaction
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <PenLine className="h-4 w-4" />
          Rédaction
        </Link>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Alex De Boutray</p>
            <p className="text-xs text-gray-500">Cabinet</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
