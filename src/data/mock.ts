import { Dossier, Template } from "./types";

export const MOCK_TEMPLATES: Template[] = [
  { id: "tpl-1", name: "Modèle Knispel", acteType: "assignation" },
  { id: "tpl-2", name: "Modèle Dupont", acteType: "assignation" },
  { id: "tpl-3", name: "Modèle Knispel", acteType: "demande-amiable" },
  { id: "tpl-4", name: "Modèle Martin", acteType: "conclusions" },
  { id: "tpl-5", name: "Modèle Standard", acteType: "requete" },
  { id: "tpl-6", name: "Modèle Cabinet", acteType: "mise-en-demeure" },
];

export const MOCK_DOSSIERS: Record<string, Dossier> = {
  "parapluie-042": {
    id: "parapluie-042",
    reference: "PARAPLUIE-042",
    clientName: "L.",
    clientFirstName: "Sophie",
    age: 31,
    gender: "Femme",
    birthDate: "1994-09-28",
    accidentDate: "2023-03-15",
    consolidationDate: "2024-01-12",
    liquidationDate: "2026-03-02",
    chiffrageTotal: 20520,
    pieces: [
      {
        id: "p-1",
        name: "Rapport d'expertise médicale du Dr. Bernard",
        type: "Expertise médicale",
        uploadedAt: "2024-02-15",
      },
      {
        id: "p-2",
        name: "Certificat médical initial — CHU Lyon",
        type: "Certificat médical",
        uploadedAt: "2023-03-16",
      },
      {
        id: "p-3",
        name: "Constat amiable d'accident",
        type: "Constat",
        uploadedAt: "2023-03-15",
      },
      {
        id: "p-4",
        name: "Procès-verbal de police",
        type: "PV",
        uploadedAt: "2023-03-20",
      },
      {
        id: "p-5",
        name: "Factures de soins — Kinésithérapie",
        type: "Factures",
        uploadedAt: "2024-06-10",
      },
      {
        id: "p-6",
        name: "Attestation employeur — Arrêt de travail",
        type: "Attestation",
        uploadedAt: "2023-04-01",
      },
      {
        id: "p-7",
        name: "Devis prothèse dentaire",
        type: "Devis",
        uploadedAt: "2024-08-22",
      },
    ],
    actes: [
      {
        id: "a-1",
        type: "assignation",
        title: "Assignation — Sophie L. c/ AXA",
        createdAt: "2026-03-10",
        templateName: "Modèle Knispel",
        piecesCount: 4,
      },
      {
        id: "a-2",
        type: "demande-amiable",
        title: "Demande amiable — Sophie L. c/ AXA",
        createdAt: "2026-03-08",
        templateName: "Modèle Knispel",
        piecesCount: 3,
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
