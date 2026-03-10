import { Dossier, Template } from "./types";

export const MOCK_TEMPLATES: Template[] = [
  // Conclusions (4)
  { id: "tpl-1", name: "Dupont_24", fileName: "Conclusions_Dupont_2024.docx", acteType: "conclusions", uploadedAt: "2024-10-03" },
  { id: "tpl-2", name: "Bernard_25", fileName: "Conclusions_Bernard_2025.docx", acteType: "conclusions", uploadedAt: "2025-01-15" },
  { id: "tpl-3", name: "Morel_25", fileName: "Conclusions_Morel_2025.docx", acteType: "conclusions", uploadedAt: "2025-02-20" },
  { id: "tpl-4", name: "Petit_24", fileName: "Conclusions_Petit_2024.docx", acteType: "conclusions", uploadedAt: "2024-11-08" },
  // Assignations (2)
  { id: "tpl-5", name: "Martin_23", fileName: "Assignation_Martin_2023.docx", acteType: "assignation", uploadedAt: "2023-06-22" },
  { id: "tpl-6", name: "Roy_25", fileName: "Assignation_Roy_2025.docx", acteType: "assignation", uploadedAt: "2025-01-10" },
  // Demandes amiables (1)
  { id: "tpl-7", name: "Leroy_25", fileName: "DA_Leroy_2025.docx", acteType: "demande-amiable", uploadedAt: "2025-02-08" },
];

export const MOCK_DOSSIERS: Record<string, Dossier> = {
  "parapluie-042": {
    id: "parapluie-042",
    reference: "19023802983",
    clientName: "Gross",
    clientFirstName: "Victor",
    age: 34,
    gender: "Homme",
    birthDate: "1991-05-24",
    accidentDate: "2026-02-03",
    consolidationDate: "2026-06-15",
    chiffrageTotal: 247,
    pieces: [
      {
        id: "p-1",
        name: "Rapport d'expertise",
        type: "Expertise",
        uploadedAt: "2026-01-15",
      },
      {
        id: "p-2",
        name: "Factures kiné",
        type: "Factures",
        uploadedAt: "2025-12-20",
      },
      {
        id: "p-3",
        name: "PV accident",
        type: "PV",
        uploadedAt: "2026-02-03",
      },
      {
        id: "p-4",
        name: "Jugement réf.",
        type: "Jugement",
        uploadedAt: "2026-01-10",
      },
    ],
    actes: [
      {
        id: "a-1",
        type: "conclusions",
        title: "Conclusions",
        createdAt: "2026-03-10",
        templateName: "Conclusions_Dupont_2024",
        piecesCount: 3,
        status: "generated",
      },
      {
        id: "a-2",
        type: "demande-amiable",
        title: "Dem. amiable",
        createdAt: "2026-03-08",
        templateName: "DA_Leroy_2025",
        piecesCount: 2,
        status: "generated",
      },
    ],
  },
};

export function getDossier(id: string): Dossier | undefined {
  return MOCK_DOSSIERS[id];
}

export function getTemplatesForType(acteType: string): Template[] {
  return MOCK_TEMPLATES.filter((t) => t.acteType === acteType);
}

export function getAllTemplates(): Template[] {
  return MOCK_TEMPLATES;
}

/** Templates grouped by acte type for the library and template picker */
export function getTemplatesGrouped(): Record<string, Template[]> {
  const grouped: Record<string, Template[]> = {};
  for (const tpl of MOCK_TEMPLATES) {
    if (!grouped[tpl.acteType]) grouped[tpl.acteType] = [];
    grouped[tpl.acteType].push(tpl);
  }
  return grouped;
}
