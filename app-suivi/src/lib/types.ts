export const PHASES = [
  'Prospect',
  'Diagnostic',
  'Conception',
  'Consultation',
  'Chantier',
  'Réception',
  'Levée des réserves',
  'Clôturé',
] as const;
export type Phase = (typeof PHASES)[number];

export const FORMULES = [
  'SÉCURISER',
  'CONCEVOIR',
  'Accompagnement Membre',
  'Accompagnement Premium',
  'Accompagnement Signature',
  'MOE',
  'Clé en main',
] as const;
export type Formule = (typeof FORMULES)[number];

export type Tache = { id: string; texte: string; faite: boolean };
export type NoteJournal = { id: string; date: string; texte: string };

export type Dossier = {
  id: string;
  reference: string;
  client: string;
  telephone: string;
  email: string;
  adresse: string;
  formule: Formule;
  phase: Phase;
  prochaineAction: string;
  /** Date ISO (AAAA-MM-JJ) ou chaîne vide */
  echeance: string;
  honorairesHT: string;
  budgetTravaux: string;
  taches: Tache[];
  journal: NoteJournal[];
  createdAt: string;
  updatedAt: string;
};

export type DossierInput = Omit<Dossier, 'id' | 'taches' | 'journal' | 'createdAt' | 'updatedAt'>;
