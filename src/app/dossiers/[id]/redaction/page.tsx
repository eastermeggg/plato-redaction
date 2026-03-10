"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Search,
  X,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { getDossier, getTemplatesForType } from "@/data/mock";
import {
  ACTE_TYPE_LABELS,
  type ActeType,
  type Piece,
  type Template,
} from "@/data/types";
import { cn, formatShortDate } from "@/lib/utils";

type GenerationState = "idle" | "generating" | "done";

export default function RedactionPage() {
  const params = useParams();
  const dossier = getDossier(params.id as string)!;

  const [acteType, setActeType] = useState<ActeType>("assignation");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [selectedPieces, setSelectedPieces] = useState<Piece[]>([]);
  const [instructions, setInstructions] = useState("");
  const [pieceSearch, setPieceSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [generationState, setGenerationState] = useState<GenerationState>("idle");

  const templates = useMemo(
    () => getTemplatesForType(acteType),
    [acteType]
  );

  const filteredPieces = useMemo(() => {
    const selected = new Set(selectedPieces.map((p) => p.id));
    return dossier.pieces.filter(
      (p) =>
        !selected.has(p.id) &&
        p.name.toLowerCase().includes(pieceSearch.toLowerCase())
    );
  }, [dossier.pieces, selectedPieces, pieceSearch]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase())
    );
  }, [templates, templateSearch]);

  function addPiece(piece: Piece) {
    setSelectedPieces((prev) => [...prev, piece]);
    setPieceSearch("");
  }

  function removePiece(pieceId: string) {
    setSelectedPieces((prev) => prev.filter((p) => p.id !== pieceId));
  }

  function handleGenerate() {
    setGenerationState("generating");
    // Simulate generation
    setTimeout(() => {
      setGenerationState("done");
    }, 2500);
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-gray-200 px-6 py-3">
        <Link
          href={`/dossiers/${dossier.id}`}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          retour
        </Link>
        <span className="text-sm font-semibold">Rédiger un acte</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Form */}
        <div className="w-[480px] flex-shrink-0 overflow-y-auto border-r border-gray-200 p-6">
          {/* Act type */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-semibold">
              Type d&apos;acte à rédiger
            </legend>
            <div className="relative">
              <select
                value={acteType}
                onChange={(e) => {
                  setActeType(e.target.value as ActeType);
                  setSelectedTemplate(null);
                }}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
              >
                {Object.entries(ACTE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </fieldset>

          {/* Template selector */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-semibold">
              Sélectionnez un modèle de référence
            </legend>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Recherchez une pièce..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    selectedTemplate?.id === tpl.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{tpl.name}</span>
                  {selectedTemplate?.id === tpl.id && (
                    <Check className="ml-auto h-4 w-4 text-brand-500" />
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Pieces selector */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-semibold">
              Pièces du dossier utilisées
            </legend>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Recherchez une pièce..."
                value={pieceSearch}
                onChange={(e) => setPieceSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
            </div>

            {/* Dropdown results */}
            {pieceSearch && filteredPieces.length > 0 && (
              <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                {filteredPieces.map((piece) => (
                  <button
                    key={piece.id}
                    onClick={() => addPiece(piece)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{piece.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected pieces */}
            <div className="space-y-1">
              {selectedPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate text-sm">{piece.name}</span>
                  </div>
                  <button
                    onClick={() => removePiece(piece.id)}
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick-add all */}
            {selectedPieces.length === 0 && (
              <button
                onClick={() => setSelectedPieces([...dossier.pieces])}
                className="mt-2 text-sm text-brand-500 hover:text-brand-600"
              >
                + Ajouter toutes les pièces du dossier
              </button>
            )}
          </fieldset>

          {/* Instructions */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-semibold">Instructions</legend>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ajoutez des instructions spécifiques pour la génération de l'acte..."
              rows={5}
              className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            />
          </fieldset>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generationState === "generating"}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors",
              generationState === "generating"
                ? "bg-gray-400 cursor-not-allowed"
                : generationState === "done"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-900 hover:bg-gray-800"
            )}
          >
            {generationState === "generating" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {generationState === "done" && <Check className="h-4 w-4" />}
            {generationState === "generating"
              ? "Génération en cours..."
              : generationState === "done"
              ? "Acte généré — Télécharger .docx"
              : "Générer l'acte"}
          </button>
        </div>

        {/* Right panel — Document preview */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <DocumentPreview
            dossier={dossier}
            acteType={acteType}
            generationState={generationState}
          />
        </div>
      </div>
    </div>
  );
}

function DocumentPreview({
  dossier,
  acteType,
  generationState,
}: {
  dossier: ReturnType<typeof getDossier>;
  acteType: ActeType;
  generationState: GenerationState;
}) {
  if (!dossier) return null;

  if (generationState === "idle") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-400">
          <FileText className="mx-auto mb-3 h-12 w-12" />
          <p className="text-sm">
            Configurez les paramètres et cliquez sur &quot;Générer l&apos;acte&quot;
          </p>
          <p className="text-xs">
            L&apos;aperçu du document s&apos;affichera ici
          </p>
        </div>
      </div>
    );
  }

  if (generationState === "generating") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-400">
          <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin" />
          <p className="text-sm">Génération du document en cours...</p>
        </div>
      </div>
    );
  }

  // Generated preview (mock content)
  return (
    <div className="mx-auto max-w-[700px] rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
      <div className="border-l-4 border-brand-500 pl-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {ACTE_TYPE_LABELS[acteType]}
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
        <p>
          Le {formatShortDate(new Date().toISOString())}, Madame{" "}
          {dossier.clientFirstName}{" "}
          <span className="font-semibold">
            {dossier.clientName.toUpperCase()}
          </span>
          , née le {formatShortDate(dossier.birthDate)}, a été victime d&apos;un
          accident de la circulation alors qu&apos;elle circulait à vélo rue
          Victor Hugo à Lyon{" "}
          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-600">
            [Pièce 1]
          </span>
          , un véhicule conduit par Monsieur Jean DUBOIS a effectué un
          dépassement non maîtrisé et a percuté la victime{" "}
          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-600">
            [Pièce 2]
          </span>
          .
        </p>

        <p>
          Transportée en urgence au CHU de Lyon, fracture ouverte du tibia
          droit. Consolidation au 1<sup>er</sup> sept. 2024{" "}
          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-600">
            [Pièce 3]
          </span>
          .
        </p>

        <hr className="my-6 border-gray-200" />

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left font-semibold">
                Postes de préjudice
              </th>
              <th className="pb-2 text-right font-semibold">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2">
                Chiffre du projet (3 000 €/mois). Arrêt total 18 mois. Partiel
                : 12 480 €.
              </td>
              <td className="py-2 text-right font-medium">12 480,00 €</td>
            </tr>
            <tr>
              <td className="py-2">Chirurgie + Soins</td>
              <td className="py-2 text-right font-medium">8 040,00 €</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td className="pt-3 font-semibold">Total</td>
              <td className="pt-3 text-right font-semibold">20 520,00 €</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
