"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  Copy,
  PenLine,
  Plus,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { getDossier } from "@/data/mock";
import { ACTE_TYPE_LABELS } from "@/data/types";
import { formatShortDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = ["Détail", "Chiffrage", "Pièces", "Actes"] as const;
type Tab = (typeof TABS)[number];

function ExportDropdown({ dossierId }: { dossierId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-plato-bd px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
      >
        Export
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-plato-bd bg-white py-1 shadow-lg">
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-plato-dk hover:bg-gray-50"
          >
            <Copy className="h-4 w-4 text-plato-dk6" />
            Copier
          </button>
          <Link
            href={`/dossiers/${dossierId}/redaction`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-plato-dk hover:bg-gray-50"
          >
            <PenLine className="h-4 w-4 text-plato-dk6" />
            Générer un acte
          </Link>
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-plato-dk4">
      Onglet {label} — à venir
    </div>
  );
}

export default function DossierPage() {
  const params = useParams();
  const dossier = getDossier(params.id as string)!;
  const [activeTab, setActiveTab] = useState<Tab>("Actes");

  const hasActes = dossier.actes.length > 0;

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-500">
            {dossier.reference}
          </p>
          <h1 className="mt-1 text-2xl font-semibold font-serif">
            Dossier {dossier.clientFirstName} {dossier.clientName}
          </h1>
        </div>
        <ExportDropdown dossierId={dossier.id} />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-plato-bd">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-plato-dk text-plato-dk"
                  : "border-transparent text-plato-dk6 hover:text-plato-dk"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Actes" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold font-serif">Actes générés</h2>

          {hasActes ? (
            <>
              <div className="overflow-hidden rounded-lg border border-plato-bd">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-plato-bd bg-plato-bg">
                      <th className="px-5 py-3 text-left font-medium text-plato-dk6">Type</th>
                      <th className="px-5 py-3 text-left font-medium text-plato-dk6">Date</th>
                      <th className="px-5 py-3 text-left font-medium text-plato-dk6">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-plato-bd">
                    {dossier.actes.map((acte) => (
                      <tr key={acte.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium">
                          {acte.title || ACTE_TYPE_LABELS[acte.type]}
                        </td>
                        <td className="px-5 py-3 text-plato-dk6">
                          {formatShortDate(acte.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 text-accent-green">
                            <CheckCircle2 className="h-4 w-4" />
                            Généré
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Link
                  href={`/dossiers/${dossier.id}/redaction`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-plato-dk px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                  Générer un nouvel acte
                </Link>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-plato-bd py-16">
              <FileText className="mb-3 h-12 w-12 text-plato-dk4" />
              <p className="text-sm font-medium text-plato-dk">
                Aucun acte généré pour ce dossier
              </p>
              <p className="mt-1 max-w-xs text-center text-sm text-plato-dk6">
                Générez votre premier acte à partir de vos calculs et exemples de rédaction.
              </p>
              <Link
                href={`/dossiers/${dossier.id}/redaction`}
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-plato-dk px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Générer un acte
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "Détail" && <PlaceholderTab label="Détail" />}
      {activeTab === "Chiffrage" && <PlaceholderTab label="Chiffrage" />}
      {activeTab === "Pièces" && <PlaceholderTab label="Pièces" />}
    </div>
  );
}
