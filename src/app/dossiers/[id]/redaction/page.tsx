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
  ThumbsUp,
  ThumbsDown,
  Send,
  Zap,
  Circle,
  CheckCircle2,
  Upload,
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
  description: string;
  status: "pending" | "active" | "done";
}

const INITIAL_STEPS: GenerationStep[] = [
  {
    label: "Lecture des pièces",
    description: "Analyse du rapport d'expertise et des documents joints",
    status: "pending",
  },
  {
    label: "Extraction des données",
    description: "Identification des postes de préjudice, montants, dates clés",
    status: "pending",
  },
  {
    label: "Application du template",
    description: "Structuration selon votre modèle de conclusions",
    status: "pending",
  },
  {
    label: "Rédaction de l'argumentaire",
    description: "Construction de la discussion juridique poste par poste",
    status: "pending",
  },
  {
    label: "Mise en forme finale",
    description: "Vérification de la cohérence et formatage du document",
    status: "pending",
  },
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
  const [thumbs, setThumbs] = useState<"up" | "down" | null>(null);
  const [feedback, setFeedback] = useState("");

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
    setThumbs(null);
    setFeedback("");

    const newSteps: GenerationStep[] = INITIAL_STEPS.map((s) => ({
      ...s,
      status: "pending",
    }));
    newSteps[0].status = "active";
    setSteps(newSteps);

    clearStepTimers();

    const delays = [800, 1800, 2800, 4200, 5800];
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
        <span className="text-sm font-medium">
          {generationState === "done" && acteLabel
            ? `Nom de l'acte généré - ${acteLabel}`
            : "Rédiger un acte"}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ──────── Left column — Parameters ──────── */}
        <div className="flex w-[400px] flex-shrink-0 flex-col border-r border-plato-bd">
          <div className="flex-1 overflow-y-auto p-6 pb-0">
            {/* ── A. Modèle de référence ── */}
            <section className="mb-6">
              <h3 className="mb-1 text-sm font-semibold text-plato-dk">
                Sélectionnez un modèle de référence
              </h3>
              <p className="mb-3 text-xs text-plato-dk4">
                Votre modèle structure la rédaction : ton, vocabulaire, style.
              </p>

              {!hasTemplates ? (
                /* No templates yet → empty state + drop zone */
                <button
                  onClick={() => setTemplatesImported(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-plato-dk px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Ajouter un premier modèle
                </button>
              ) : selectedTemplate ? (
                /* A template is selected → show it as a card */
                <div className="flex items-center gap-2.5 rounded-lg border border-plato-bd px-4 py-3">
                  <FileText className="h-4 w-4 flex-shrink-0 text-plato-dk4" />
                  <span className="flex-1 truncate text-sm font-medium text-plato-dk">
                    {selectedTemplate.fileName}
                  </span>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-shrink-0 text-plato-dk4 hover:text-plato-dk"
                  >
                    <X className="h-4 w-4" />
                  </button>
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

                  <button className="mt-2 text-xs font-medium text-brand-500 hover:underline">
                    + Ajouter un nouveau modèle
                  </button>
                </div>
              )}
            </section>

            {/* ── B. Pièces du dossier ── */}
            <section className="mb-6">
              <h3 className="mb-1 text-sm font-semibold text-plato-dk">
                Ajouter des pièces de contexte
              </h3>
              <p className="mb-3 text-xs text-plato-dk4">
                Plus le contexte est complet, plus l&apos;acte sera précis.
              </p>

              {/* Search */}
              <div ref={pieceRef} className="relative mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-plato-dk4" />
                  <input
                    type="text"
                    placeholder="Recherchez une pièce du dossier.."
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

              {/* Upload hint */}
              <div className="flex items-center gap-2 text-xs text-plato-dk4">
                <Upload className="h-3.5 w-3.5" />
                <span>
                  Déposez ou{" "}
                  <span className="font-medium text-plato-dk underline cursor-pointer">
                    Parcourez
                  </span>{" "}
                  pour ajouter des documents.
                </span>
              </div>

              {/* Added pieces list */}
              {addedPieces.length > 0 && (
                <div className="mt-3 divide-y divide-plato-bd rounded-lg border border-plato-bd">
                  {addedPieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                      <span className="font-medium text-plato-dk">{piece.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── C. Instructions ── */}
            <section className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-plato-dk">
                Instructions
              </h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Exemple : adopter un ton offensif / modéré / conciliant, défendre la position de la victime / de l'assureur, insister sur tel poste de préjudice, minimiser tel autre.."
                rows={6}
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
                "+ Générer l'acte"
              )}
            </button>
          </div>
        </div>

        {/* ──────── Right column — Preview ──────── */}
        <div className="flex-1 overflow-hidden bg-plato-bg">
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
                thumbs={thumbs}
                setThumbs={setThumbs}
                feedback={feedback}
                setFeedback={setFeedback}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Empty / Idle state ────────── */

function IdleState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-5 w-5 text-plato-dk4" />
        </div>
        <p className="text-base font-semibold text-plato-dk">
          Rédigez un acte en contexte
        </p>
        <p className="mt-2 text-sm leading-relaxed text-plato-dk4">
          Plato génère votre acte à partir des préjudices. Sélectionnez un
          modèle et lancez la génération.
        </p>
      </div>
    </div>
  );
}

/* ────────── Generating loader ────────── */

const GENERATION_TIPS = [
  "Plato s'appuie sur les données du rapport pour chiffrer chaque poste de préjudice.",
  "L'argumentaire est structuré poste par poste pour faciliter votre relecture.",
  "Vous pourrez ajuster le document librement après la génération.",
  "Les montants sont calculés d'après le référentiel et les éléments du dossier.",
  "Chaque génération est unique et tient compte de vos instructions.",
];

function GeneratingState({ steps }: { steps: GenerationStep[] }) {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const activeStep = steps.find((s) => s.status === "active") ?? steps[0];

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % GENERATION_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Main card */}
        <div className="rounded-2xl border border-plato-bd bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-plato-dk">
              Rédaction en cours
            </h3>
            <p className="mt-1 text-sm text-plato-dk4">
              {activeStep.description}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs text-plato-dk4">
              <span>{activeStep.label}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-300",
                  step.status === "active" && "bg-brand-50/60",
                  step.status === "done" && "opacity-60"
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {step.status === "done" && (
                    <CheckCircle2 className="h-4.5 w-4.5 text-accent-green" />
                  )}
                  {step.status === "active" && (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-brand-500" />
                  )}
                  {step.status === "pending" && (
                    <Circle className="h-4.5 w-4.5 text-plato-dk4/40" />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm leading-tight",
                      step.status === "done" && "text-plato-dk",
                      step.status === "active" && "font-medium text-plato-dk",
                      step.status === "pending" && "text-plato-dk4"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.status === "active" && (
                    <p className="mt-0.5 text-xs text-plato-dk4">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rotating tip */}
        <div className="mt-4 rounded-xl border border-plato-bd bg-white px-5 py-3.5 text-center">
          <p className="text-xs font-medium text-plato-dk4">
            <Zap className="mr-1.5 -mt-0.5 inline-block h-3.5 w-3.5 text-brand-500" />
            {GENERATION_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────── Done state — document preview ────────── */

function DoneState({
  dossier,
  template,
  thumbs,
  setThumbs,
  feedback,
  setFeedback,
}: {
  dossier: ReturnType<typeof getDossier>;
  template: Template | null;
  thumbs: "up" | "down" | null;
  setThumbs: (t: "up" | "down" | null) => void;
  feedback: string;
  setFeedback: (f: string) => void;
}) {
  if (!dossier || !template) return null;

  const acteLabel = ACTE_TYPE_LABELS[template.acteType];

  return (
    <div className="mx-auto max-w-[780px]">
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-plato-bd bg-white px-5 py-3">
        <span className="text-sm font-medium text-plato-dk">
          Nom de l&apos;acte généré - {acteLabel}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setThumbs(thumbs === "up" ? null : "up")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                thumbs === "up"
                  ? "text-plato-dk"
                  : "text-plato-dk4 hover:text-plato-dk"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setThumbs(thumbs === "down" ? null : "down")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                thumbs === "down"
                  ? "text-plato-dk"
                  : "text-plato-dk4 hover:text-plato-dk"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>

          <button className="flex items-center gap-1.5 rounded-lg border border-plato-dk px-4 py-2 text-sm font-medium text-plato-dk hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Télécharger
          </button>
        </div>
      </div>

      {/* Feedback bar — appears when a thumb is selected */}
      {thumbs !== null && (
        <div className="mb-4 flex gap-2 rounded-lg border border-plato-bd bg-white px-4 py-2.5">
          <input
            type="text"
            placeholder="Un commentaire ? (optionnel)"
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
