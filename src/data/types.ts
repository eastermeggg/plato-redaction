export interface Dossier {
  id: string;
  reference: string;
  clientName: string;
  clientFirstName: string;
  age: number;
  gender: "Homme" | "Femme";
  birthDate: string;
  accidentDate: string;
  consolidationDate?: string;
  liquidationDate?: string;
  chiffrageTotal: number;
  pieces: Piece[];
  actes: Acte[];
}

export interface Piece {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface Acte {
  id: string;
  type: ActeType;
  title: string;
  createdAt: string;
  templateName: string;
  piecesCount: number;
  status: "generated" | "draft";
}

export type ActeType =
  | "assignation"
  | "demande-amiable"
  | "conclusions"
  | "requete"
  | "mise-en-demeure";

export interface Template {
  id: string;
  name: string;
  fileName: string;
  acteType: ActeType;
  uploadedAt?: string;
}

export const ACTE_TYPE_LABELS: Record<ActeType, string> = {
  assignation: "Assignation",
  "demande-amiable": "Demande amiable",
  conclusions: "Conclusions",
  requete: "Requête",
  "mise-en-demeure": "Mise en demeure",
};
