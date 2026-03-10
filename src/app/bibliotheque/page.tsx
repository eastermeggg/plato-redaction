"use client";

import { FileText, Plus, Upload } from "lucide-react";
import { getTemplatesGrouped } from "@/data/mock";
import { ACTE_TYPE_LABELS, type ActeType } from "@/data/types";
import { formatShortDate } from "@/lib/utils";

const ALL_TYPES: ActeType[] = [
  "conclusions",
  "assignation",
  "demande-amiable",
  "requete",
  "mise-en-demeure",
];

export default function BibliothequePage() {
  const grouped = getTemplatesGrouped();

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif">
            Mes exemples de rédaction
          </h1>
          <p className="mt-1 text-sm text-plato-dk6">
            Votre bibliothèque personnelle d&apos;exemples pour la génération d&apos;actes.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-plato-dk px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">
          <Upload className="h-4 w-4" />
          Déposer un exemple
        </button>
      </div>

      {/* Groups */}
      <div className="space-y-8">
        {ALL_TYPES.map((type) => {
          const templates = grouped[type] || [];
          return (
            <section key={type}>
              <h2 className="mb-3 text-sm font-semibold text-plato-dk6 uppercase tracking-wider">
                {ACTE_TYPE_LABELS[type]}
              </h2>

              {templates.length > 0 ? (
                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="flex items-center justify-between rounded-lg border border-plato-bd px-4 py-3 transition-colors hover:border-plato-dk4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-plato-dk4" />
                        <span className="text-sm font-medium">{tpl.fileName}</span>
                      </div>
                      {tpl.uploadedAt && (
                        <span className="text-xs text-plato-dk6">
                          {formatShortDate(tpl.uploadedAt)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-plato-dk4 italic">
                  Aucun exemple déposé
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
