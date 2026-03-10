"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FileText,
  Loader2,
  Download,
  RefreshCw,
  ChevronRight,
  Star,
  Send,
  Zap,
  Circle,
  CheckCircle2,
  Upload,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { getDossier, getAllTemplates } from "@/data/mock";
import {
  ACTE_TYPE_LABELS,
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

  // Template state — start with no templates imported (proto demo)
  const [templatesImported, setTemplatesImported] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  // Pieces state — auto-add "Rapport d'expertise" on mount
  const [addedPieceIds, setAddedPieceIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const rapport = dossier.pieces.find((p) =>
      p.name.toLowerCase().includes("rapport")
    );
    if (rapport) initial.add(rapport.id);
    return initial;
  });
  const [pieceSearch, setPieceSearch] = useState("");
  const [pieceDropdownOpen, setPieceDropdownOpen] = useState(false);
  const pieceRef = useRef<HTMLDivElement>(null);

  // Instructions + generation
  const [instructions, setInstructions] = useState("");
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [steps, setSteps] = useState<GenerationStep[]>(INITIAL_STEPS);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showParams, setShowParams] = useState(false);

  const hasGenerated = useRef(false);
  const stepsTimerRef = useRef<NodeJS.Timeout[]>([]);

  const allTemplates = useMemo(() => getAllTemplates(), []);

  // Filtered templates for search dropdown
  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return allTemplates;
    const q = templateSearch.toLowerCase();
    return allTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.fileName.toLowerCase().includes(q)
    );
  }, [allTemplates, templateSearch]);

  // Pieces: added list + available for search
  const addedPieces = useMemo(
    () => dossier.pieces.filter((p) => addedPieceIds.has(p.id)),
    [dossier.pieces, addedPieceIds]
  );
  const availablePieces = useMemo(() => {
    const q = pieceSearch.toLowerCase();
    return dossier.pieces.filter(
      (p) => !addedPieceIds.has(p.id) && p.name.toLowerCase().includes(q)
    );
  }, [dossier.pieces, addedPieceIds, pieceSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (templateRef.current && !templateRef.current.contains(e.target as Node))
        setTemplateDropdownOpen(false);
      if (pieceRef.current && !pieceRef.current.contains(e.target as Node))
        setPieceDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addPiece(id: string) {
    setAddedPieceIds((prev) => new Set(prev).add(id));
    setPieceSearch("");
    setPieceDropdownOpen(false);
  }

  function removePiece(id: string) {
    setAddedPieceIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
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

    const newSteps: GenerationStep[] = INITIAL_STEPS.map((s) => ({
      ...s,
      status: "pending",
    }));
    newSteps[0].status = "active";
    setSteps(newSteps);

    clearStepTimers();

    const delays = [600, 1200, 1800, 2400, 3200];
    delays.forEach((delay, i) => {
      const timer = setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, j) => {
            if (j === i) return { ...s, status: "done" as const };
            if (j === i + 1) return { ...s, status: "active" as const };
            return s;
          })
        );
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
  const hasTemplates = templatesImported && allTemplates.length > 0;

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
            {/* ── A. Modèle de référence ── */}
            <section className="mb-6">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-plato-dk6">
                Modèle de référence
              </h3>
              <p className="mb-3 text-xs text-plato-dk4">
                Votre modèle structure la rédaction : ton, plan et formulations
                adaptés à votre pratique.
              </p>

              {!hasTemplates ? (
                /* No templates yet → empty state + drop zone */
                <div className="rounded-lg border border-dashed border-plato-bd bg-plato-bg p-5">
                  <div className="mb-4 text-center">
                    <Upload className="mx-auto mb-2 h-6 w-6 text-plato-dk4" />
                    <p className="text-sm font-medium text-plato-dk">
                      Importez vos propres modèles
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-plato-dk4">
                      Ajoutez vos conclusions, assignations ou dires types
                      (Word, PDF). Plato s&apos;appuie sur votre modèle pour
                      reproduire votre ton, votre plan et vos formulations.
                    </p>
                  </div>
                  <button
                    onClick={() => setTemplatesImported(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-plato-bd bg-white px-4 py-2.5 text-sm font-medium text-plato-dk hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Ajouter un modèle
                  </button>
                </div>
              ) : selectedTemplate ? (
                /* A template is selected → show it as a card */
                <div className="rounded-lg border border-brand-500 bg-brand-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-brand-500" />
                      <div>
                        <p className="text-sm font-medium text-brand-600">
                          {selectedTemplate.fileName}
                        </p>
                        <p className="text-xs text-plato-dk6">
                          {ACTE_TYPE_LABELS[selectedTemplate.acteType]}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-plato-dk4 hover:text-plato-dk"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Templates exist but none selected → search + dropdown */
                <div ref={templateRef} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-plato-dk4" />
                    <input
                      type="text"
                      placeholder="Rechercher un modèle..."
                      value={templateSearch}
                      onChange={(e) => {
                        setTemplateSearch(e.target.value);
                        setTemplateDropdownOpen(true);
                      }}
                      onFocus={() => setTemplateDropdownOpen(true)}
                      className="w-full rounded-lg border border-plato-bd py-2.5 pl-9 pr-4 text-sm placeholder:text-plato-dk4 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  {templateDropdownOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-plato-bd bg-white shadow-lg">
                      {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={() => {
                              setSelectedTemplate(tpl);
                              setTemplateSearch("");
                              setTemplateDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                          >
                            <FileText className="h-4 w-4 flex-shrink-0 text-plato-dk4" />
                            <div>
                              <p className="font-medium">{tpl.fileName}</p>
                              <p className="text-xs text-plato-dk6">
                                {ACTE_TYPE_LABELS[tpl.acteType]}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-plato-dk4">
                          Aucun modèle trouvé
                        </p>
                      )}
                    </div>
                  )}

                  {/* Drop zone below search */}
                  <div className="mt-3">
                    <DropZone label="Déposez ou cliquez pour ajouter un modèle" compact />
                  </div>
                </div>
              )}
            </section>

            {/* ── B. Pièces du dossier ── */}
            <section className="mb-6">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-plato-dk6">
                Pièces de contexte
              </h3>
              <p className="mb-3 text-xs text-plato-dk4">
                Ces documents enrichissent la génération : rapports d&apos;expertise,
                factures, certificats... Plus le contexte est complet, plus l&apos;acte
                sera précis.
              </p>

              {/* Search */}
              <div ref={pieceRef} className="relative mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-plato-dk4" />
                  <input
                    type="text"
                    placeholder="Recherchez une pièce..."
                    value={pieceSearch}
                    onChange={(e) => {
                      setPieceSearch(e.target.value);
                      setPieceDropdownOpen(true);
                    }}
                    onFocus={() => setPieceDropdownOpen(true)}
                    className="w-full rounded-lg border border-plato-bd py-2.5 pl-9 pr-4 text-sm placeholder:text-plato-dk4 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {pieceDropdownOpen && availablePieces.length > 0 && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-plato-bd bg-white shadow-lg">
                    {availablePieces.map((piece) => (
                      <button
                        key={piece.id}
                        onClick={() => addPiece(piece.id)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4 flex-shrink-0 text-plato-dk4" />
                        <span>{piece.name}</span>
                        <span className="ml-auto text-xs text-plato-dk4">
                          {piece.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <DropZone label="Déposez ou cliquez pour ajouter un justificatif" compact />

              {/* Added pieces list */}
              {addedPieces.length > 0 && (
                <div className="mt-3 divide-y divide-plato-bd rounded-lg border border-plato-bd">
                  {addedPieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="group flex items-center gap-2.5 px-4 py-2.5 text-sm"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0 text-plato-dk4" />
                      <span className="font-medium">{piece.name}</span>
                      <span className="text-xs text-plato-dk4">{piece.type}</span>
                      <div className="ml-auto flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="text-plato-dk4 hover:text-plato-dk">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removePiece(piece.id)}
                          className="text-plato-dk4 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── C. Instructions ── */}
            <section className="mb-6">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-plato-dk6">
                Instructions
              </h3>
              <p className="mb-3 text-xs text-plato-dk4">
                Précisez la position à défendre, le ton souhaité, les points à développer ou à éviter.
              </p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={"Exemples d'instructions :\n• Adopter un ton offensif / modéré / conciliant\n• Défendre la position de la victime / de l'assureur\n• Insister sur tel poste de préjudice, minimiser tel autre\n• Citer la jurisprudence Civ. 2e, 14 avril 2016\n• Ne pas développer le poste DFT"}
                rows={5}
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
                addedPieceIds={addedPieceIds}
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

/* ────────── Reusable drop zone ────────── */

function DropZone({
  label,
  compact,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-plato-bd bg-plato-bg transition-colors hover:border-plato-dk4 cursor-pointer",
        compact ? "px-4 py-4" : "px-6 py-8"
      )}
    >
      <Upload className={cn("text-plato-dk4 mb-2", compact ? "h-5 w-5" : "h-6 w-6")} />
      <p className={cn("text-center text-plato-dk6", compact ? "text-xs" : "text-sm")}>
        Déposez ou{" "}
        <span className="font-semibold text-brand-500 underline">cliquez</span>{" "}
        pour ajouter
      </p>
    </div>
  );
}

/* ────────── Empty / Idle state ────────── */

function IdleState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-plato-dk4" />
        <p className="text-base font-semibold text-plato-dk">
          Rédigez un acte en contexte
        </p>
        <p className="mt-2 text-sm leading-relaxed text-plato-dk6">
          Plato génère votre acte à partir des postes de préjudice que vous avez
          créés. Les pièces justificatives de chaque poste et les montants du
          chiffrage sont automatiquement récupérés pour alimenter la rédaction.
        </p>
        <p className="mt-3 text-sm text-plato-dk6">
          Sélectionnez un modèle et lancez la génération.
        </p>
      </div>
    </div>
  );
}

/* ────────── Generating loader ────────── */

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

/* ────────── Done state — document preview ────────── */

function DoneState({
  dossier,
  template,
  addedPieceIds,
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
  addedPieceIds: Set<string>;
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
  const selectedPieces = dossier.pieces.filter((p) => addedPieceIds.has(p.id));

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

      {/* Feedback bar */}
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
                <span className="font-medium">Modèle :</span> {template.fileName}
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
            <p className="font-semibold">Montant : 12&nbsp;400&nbsp;&euro;</p>

            <h3 className="font-semibold">B. Souffrances endurées</h3>
            <p>
              Cotées 4/7 par l&apos;expert. L&apos;importance des souffrances subies
              justifie une indemnisation à hauteur de :
            </p>
            <p className="font-semibold">Montant : 18&nbsp;000&nbsp;&euro;</p>

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
