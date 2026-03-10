"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FileText,
  Loader2,
  Download,
  RefreshCw,
  Check,
  ChevronRight,
  Star,
  Send,
  Zap,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { getDossier, getTemplatesGrouped } from "@/data/mock";
import {
  ACTE_TYPE_LABELS,
  type ActeType,
  type Piece,
  type Template,
} from "@/data/types";
import { cn } from "@/lib/utils";

type GenerationState = "idle" | "generating" | "done";

interface GenerationStep {
  label: string;
  status: "pending" | "active" | "done";
}

const INITIAL_STEPS: GenerationStep[] = [
  { label: "Calculs récupérés", status: "pending" },
  { label: "Rapport d'expertise analysé", status: "pending" },
  { label: "Template appliqué", status: "pending" },
  { label: "Rédaction de la discussion...", status: "pending" },
  { label: "Mise en forme", status: "pending" },
];

export default function RedactionPage() {
  const params = useParams();
  const dossier = getDossier(params.id as string)!;

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPieceIds, setSelectedPieceIds] = useState<Set<string>>(new Set());
  const [instructions, setInstructions] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [steps, setSteps] = useState<GenerationStep[]>(INITIAL_STEPS);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showParams, setShowParams] = useState(false);

  const hasGenerated = useRef(false);
  const stepsTimerRef = useRef<NodeJS.Timeout[]>([]);

  const grouped = useMemo(() => getTemplatesGrouped(), []);

  // Filter templates by search
  const filteredGrouped = useMemo(() => {
    if (!templateSearch.trim()) return grouped;
    const q = templateSearch.toLowerCase();
    const result: Record<string, Template[]> = {};
    for (const [type, templates] of Object.entries(grouped)) {
      const filtered = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.fileName.toLowerCase().includes(q)
      );
      if (filtered.length > 0) result[type] = filtered;
    }
    return result;
  }, [grouped, templateSearch]);

  function togglePiece(pieceId: string) {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(pieceId)) next.delete(pieceId);
      else next.add(pieceId);
      return next;
    });
  }

  function clearStepTimers() {
    stepsTimerRef.current.forEach(clearTimeout);
    stepsTimerRef.current = [];
  }

  function handleGenerate() {
    if (!selectedTemplate) return;

    setGenerationState("generating");
    setRating(0);
    setFeedback("");
    setShowParams(false);

    // Reset steps
    const newSteps: GenerationStep[] = INITIAL_STEPS.map((s) => ({ ...s, status: "pending" }));
    newSteps[0].status = "active";
    setSteps(newSteps);

    clearStepTimers();

    // Simulate staggered step progression
    const delays = [600, 1200, 1800, 2400, 3200];
    delays.forEach((delay, i) => {
      const timer = setTimeout(() => {
        setSteps((prev) => {
          const updated = prev.map((s, j) => {
            if (j === i) return { ...s, status: "done" as const };
            if (j === i + 1) return { ...s, status: "active" as const };
            return s;
          });
          return updated;
        });

        // Last step → done
        if (i === delays.length - 1) {
          setTimeout(() => {
            setGenerationState("done");
            hasGenerated.current = true;
          }, 300);
        }
      }, delay);
      stepsTimerRef.current.push(timer);
    });
  }

  useEffect(() => {
    return () => clearStepTimers();
  }, []);

  const acteType = selectedTemplate?.acteType;
  const acteLabel = acteType ? ACTE_TYPE_LABELS[acteType] : null;

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-plato-bd px-6 py-3">
        <Link
          href={`/dossiers/${dossier.id}`}
          className="flex items-center gap-1 text-sm text-plato-dk6 hover:text-plato-dk"
        >
          <ArrowLeft className="h-4 w-4" />
          retour
        </Link>
        <span className="text-sm font-medium text-plato-dk6">
          {dossier.reference}
        </span>
        {acteLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-plato-dk4" />
            <span className="text-sm font-semibold">{acteLabel}</span>
          </>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ──────── Left column — Parameters ──────── */}
        <div className="flex w-[400px] flex-shrink-0 flex-col border-r border-plato-bd">
          <div className="flex-1 overflow-y-auto p-6 pb-0">
            {/* A. Template */}
            <section className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-plato-dk6">
                A. Template
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-plato-dk4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full rounded-lg border border-plato-bd py-2 pl-9 pr-4 text-sm placeholder:text-plato-dk4 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                {Object.entries(filteredGrouped).map(([type, templates]) => (
                  <div key={type}>
                    <p className="mb-1.5 text-xs font-medium text-plato-dk6">
                      {ACTE_TYPE_LABELS[type as ActeType] || type} ({templates.length})
                    </p>
                    <div className="space-y-1">
                      {templates.map((tpl) => (
                        <label
                          key={tpl.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                            selectedTemplate?.id === tpl.id
                              ? "border-brand-500 bg-brand-50 text-brand-600"
                              : "border-plato-bd hover:border-plato-dk4"
                          )}
                        >
                          <input
                            type="radio"
                            name="template"
                            checked={selectedTemplate?.id === tpl.id}
                            onChange={() => setSelectedTemplate(tpl)}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2",
                              selectedTemplate?.id === tpl.id
                                ? "border-brand-500 bg-brand-500"
                                : "border-plato-dk4"
                            )}
                          >
                            {selectedTemplate?.id === tpl.id && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="truncate">{tpl.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs">
                <button className="text-brand-500 hover:text-brand-600 font-medium">
                  + Ajouter
                </button>
                <Link
                  href="/bibliotheque"
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Bibliothèque &rarr;
                </Link>
              </div>
            </section>

            {/* B. Pièces du dossier */}
            <section className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-plato-dk6">
                B. Pièces du dossier
              </h3>
              <div className="space-y-1">
                {dossier.pieces.map((piece) => (
                  <label
                    key={piece.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-plato-bd px-3 py-2 text-sm transition-colors hover:border-plato-dk4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPieceIds.has(piece.id)}
                      onChange={() => togglePiece(piece.id)}
                      className="h-4 w-4 rounded border-plato-dk4 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="truncate">{piece.name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* C. Instructions */}
            <section className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-plato-dk6">
                C. Instructions
              </h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Insister sur le préjudice..."
                rows={4}
                className="w-full resize-y rounded-lg border border-plato-bd px-4 py-3 text-sm placeholder:text-plato-dk4 focus:border-brand-500 focus:outline-none"
              />
            </section>
          </div>

          {/* Sticky generate button */}
          <div className="border-t border-plato-bd bg-white px-6 py-4">
            <button
              onClick={handleGenerate}
              disabled={!selectedTemplate || generationState === "generating"}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                !selectedTemplate
                  ? "cursor-not-allowed bg-plato-bd text-plato-dk4"
                  : generationState === "generating"
                    ? "cursor-not-allowed bg-plato-dk4 text-white"
                    : "bg-plato-dk text-white hover:bg-gray-800"
              )}
            >
              {generationState === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Générer
                </>
              )}
            </button>
          </div>
        </div>

        {/* ──────── Right column — Preview ──────── */}
        <div className="flex-1 overflow-hidden bg-plato-bg">
          <div className="h-1 bg-brand-500" />
          <div className="h-full overflow-y-auto p-8">
            {generationState === "idle" && !hasGenerated.current && (
              <IdleState />
            )}

            {generationState === "generating" && (
              <GeneratingState steps={steps} />
            )}

            {generationState === "done" && (
              <DoneState
                dossier={dossier}
                template={selectedTemplate}
                selectedPieceIds={selectedPieceIds}
                instructions={instructions}
                rating={rating}
                setRating={setRating}
                feedback={feedback}
                setFeedback={setFeedback}
                showParams={showParams}
                setShowParams={setShowParams}
                onRegenerate={handleGenerate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Sub-components ────────── */

function IdleState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-plato-dk4">
        <FileText className="mx-auto mb-3 h-12 w-12" />
        <p className="text-sm font-medium">Aucun acte généré</p>
        <p className="mt-1 text-xs">
          Configurez les paramètres à gauche puis lancez la génération.
        </p>
      </div>
    </div>
  );
}

function GeneratingState({ steps }: { steps: GenerationStep[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-80 rounded-xl border border-plato-bd bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          <p className="text-sm font-semibold">Génération en cours...</p>
        </div>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {step.status === "done" && (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent-green" />
              )}
              {step.status === "active" && (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-brand-500" />
              )}
              {step.status === "pending" && (
                <Circle className="h-4 w-4 flex-shrink-0 text-plato-dk4" />
              )}
              <span
                className={cn(
                  "text-sm",
                  step.status === "done" && "text-plato-dk",
                  step.status === "active" && "text-plato-dk font-medium",
                  step.status === "pending" && "text-plato-dk4"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoneState({
  dossier,
  template,
  selectedPieceIds,
  instructions,
  rating,
  setRating,
  feedback,
  setFeedback,
  showParams,
  setShowParams,
  onRegenerate,
}: {
  dossier: ReturnType<typeof getDossier>;
  template: Template | null;
  selectedPieceIds: Set<string>;
  instructions: string;
  rating: number;
  setRating: (r: number) => void;
  feedback: string;
  setFeedback: (f: string) => void;
  showParams: boolean;
  setShowParams: (b: boolean) => void;
  onRegenerate: () => void;
}) {
  if (!dossier || !template) return null;

  const acteLabel = ACTE_TYPE_LABELS[template.acteType];
  const selectedPieces = dossier.pieces.filter((p) => selectedPieceIds.has(p.id));

  return (
    <div className="mx-auto max-w-[780px]">
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-plato-bd bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg bg-plato-dk px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
            <Download className="h-3.5 w-3.5" />
            Télécharger Word
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 rounded-lg border border-plato-bd px-3 py-1.5 text-xs font-medium text-plato-dk6 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-générer
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Star rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="text-plato-dk4 hover:text-brand-500 transition-colors"
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    n <= rating && "fill-brand-500 text-brand-500"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback bar (shows when rating is set) */}
      {rating > 0 && (
        <div className="mb-4 flex gap-2 rounded-lg border border-plato-bd bg-white px-4 py-2.5">
          <input
            type="text"
            placeholder="Commentaire (optionnel)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="flex-1 text-sm placeholder:text-plato-dk4 focus:outline-none"
          />
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">
            <Send className="h-3 w-3" />
            Envoyer
          </button>
        </div>
      )}

      {/* Document */}
      <div className="rounded-lg border border-plato-bd bg-white shadow-sm">
        {/* Document header */}
        <div className="border-b border-plato-bd px-8 pt-8 pb-4">
          <div className="border-l-4 border-brand-500 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-plato-dk4">
              {acteLabel}
            </p>
            <p className="mt-1 text-lg font-semibold font-serif">
              {acteLabel} ({new Date().toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })})
            </p>
          </div>
        </div>

        {/* Collapsible params summary */}
        <div className="border-b border-plato-bd">
          <button
            onClick={() => setShowParams(!showParams)}
            className="flex w-full items-center gap-2 px-8 py-3 text-xs font-medium text-plato-dk6 hover:bg-gray-50"
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                showParams && "rotate-90"
              )}
            />
            Paramètres de génération
          </button>
          {showParams && (
            <div className="px-8 pb-3 text-xs text-plato-dk6 space-y-1">
              <p>
                <span className="font-medium">Template :</span> {template.fileName}
              </p>
              <p>
                <span className="font-medium">Pièces :</span>{" "}
                {selectedPieces.length > 0
                  ? selectedPieces.map((p) => p.name).join(", ")
                  : "Aucune"}
              </p>
              {instructions && (
                <p>
                  <span className="font-medium">Instructions :</span>{" "}
                  &ldquo;{instructions}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Document body */}
        <div className="px-8 py-8 space-y-6 text-sm leading-relaxed text-plato-dk">
          <h2 className="text-lg font-bold font-serif">I. FAITS</h2>
          <p className="rounded-lg bg-plato-bg px-4 py-3 text-plato-dk6 italic">
            [À COMPLÉTER]
          </p>

          <h2 className="text-lg font-bold font-serif">II. PROCÉDURE</h2>
          <p className="rounded-lg bg-plato-bg px-4 py-3 text-plato-dk6 italic">
            [À COMPLÉTER]
          </p>

          <h2 className="text-lg font-bold font-serif">III. DISCUSSION</h2>

          <div className="space-y-4">
            <h3 className="font-semibold">A. Déficit fonctionnel temporaire (DFT)</h3>
            <p>
              L&apos;expert a retenu un DFT total de classe III pour une durée de 6 mois,
              soit du 3 février 2026 au 15 juin 2026. Sur la base d&apos;une indemnisation
              de 28&nbsp;&euro;/jour, il est demandé :
            </p>
            <p className="font-semibold">
              Montant : 12&nbsp;400&nbsp;&euro;
            </p>

            <h3 className="font-semibold">B. Souffrances endurées</h3>
            <p>
              Cotées 4/7 par l&apos;expert. L&apos;importance des souffrances subies
              justifie une indemnisation à hauteur de :
            </p>
            <p className="font-semibold">
              Montant : 18&nbsp;000&nbsp;&euro;
            </p>

            <h3 className="font-semibold">C. Dépenses de santé actuelles (DSA)</h3>
            <p>
              Ensemble des frais médicaux restés à charge, tels que détaillés dans le
              chiffrage Plato :
            </p>
            <p className="font-semibold">
              Montant : {dossier.chiffrageTotal}&nbsp;&euro;
            </p>
          </div>

          <hr className="my-6 border-plato-bd" />

          <h2 className="text-lg font-bold font-serif">IV. PAR CES MOTIFS</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plato-bd">
                <th className="pb-2 text-left font-semibold">Poste</th>
                <th className="pb-2 text-right font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plato-bd">
              <tr>
                <td className="py-2">DFT</td>
                <td className="py-2 text-right font-medium">12&nbsp;400&nbsp;&euro;</td>
              </tr>
              <tr>
                <td className="py-2">Souffrances endurées</td>
                <td className="py-2 text-right font-medium">18&nbsp;000&nbsp;&euro;</td>
              </tr>
              <tr>
                <td className="py-2">DSA</td>
                <td className="py-2 text-right font-medium">{dossier.chiffrageTotal}&nbsp;&euro;</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-plato-dk">
                <td className="pt-3 font-bold">Total</td>
                <td className="pt-3 text-right font-bold">
                  {(12400 + 18000 + dossier.chiffrageTotal).toLocaleString("fr-FR")}&nbsp;&euro;
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
