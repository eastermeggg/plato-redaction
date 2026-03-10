"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PenLine,
  Copy,
  Download,
  FileText,
  Mail,
  Plus,
} from "lucide-react";
import { getDossier } from "@/data/mock";
import { ACTE_TYPE_LABELS, type Acte } from "@/data/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = ["Détail", "Chiffrage", "Pièces", "Actes"] as const;
type Tab = (typeof TABS)[number];

const ACTE_ICONS: Record<string, React.ReactNode> = {
  assignation: <FileText className="h-5 w-5 text-brand-500" />,
  "demande-amiable": <Mail className="h-5 w-5 text-brand-500" />,
};

function ActeCard({ acte, dossierId }: { acte: Acte; dossierId: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-5 py-4 transition-colors hover:border-gray-300">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          {ACTE_ICONS[acte.type] || <FileText className="h-5 w-5 text-brand-500" />}
        </div>
        <div>
          <p className="font-medium">{acte.title}</p>
          <p className="text-sm text-gray-500">
            {formatDate(acte.createdAt)} · {acte.templateName} · {acte.piecesCount} pièces
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50">
          <Download className="h-3.5 w-3.5" />
          .docx
        </button>
        <Link
          href={`/dossiers/${dossierId}/redaction?acte=${acte.id}`}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Ouvrir
        </Link>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-gray-400">
      Onglet {label} — à venir
    </div>
  );
}

export default function DossierPage() {
  const params = useParams();
  const dossier = getDossier(params.id as string)!;
  const [activeTab, setActiveTab] = useState<Tab>("Actes");

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
            Référence{" "}
            <span className="text-brand-600">{dossier.reference}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Dossier {dossier.clientFirstName} {dossier.clientName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
            <Copy className="h-4 w-4" />
            Copier le chiffrage
          </button>
          <Link
            href={`/dossiers/${dossier.id}/redaction`}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <PenLine className="h-4 w-4" />
            Rédiger un acte
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Actes générés</h2>
            <Link
              href={`/dossiers/${dossier.id}/redaction`}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Nouvel acte
            </Link>
          </div>
          <div className="space-y-3">
            {dossier.actes.map((acte) => (
              <ActeCard key={acte.id} acte={acte} dossierId={dossier.id} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "Détail" && <PlaceholderTab label="Détail" />}
      {activeTab === "Chiffrage" && <PlaceholderTab label="Chiffrage" />}
      {activeTab === "Pièces" && <PlaceholderTab label="Pièces" />}
    </div>
  );
}
