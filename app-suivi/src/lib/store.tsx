import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { dansJours, uid } from './dates';
import { Dossier, DossierInput, FORMULES, PHASES } from './types';

const CLE = 'dayne-suivi/dossiers/v1';

type Store = {
  pret: boolean;
  dossiers: Dossier[];
  get: (id: string) => Dossier | undefined;
  creer: (input: DossierInput) => string;
  modifier: (id: string, patch: Partial<Dossier>) => void;
  supprimer: (id: string) => void;
  ajouterTache: (id: string, texte: string) => void;
  basculerTache: (id: string, tacheId: string) => void;
  supprimerTache: (id: string, tacheId: string) => void;
  ajouterNote: (id: string, texte: string) => void;
  supprimerNote: (id: string, noteId: string) => void;
  importer: (json: string) => number;
  exporter: () => string;
  creerExemple: () => string;
};

const Ctx = createContext<Store | null>(null);

/** Garantit qu'un objet lu (stockage ou import) a bien la forme d'un Dossier */
function normaliser(x: any): Dossier | null {
  if (!x || typeof x !== 'object' || typeof x.client !== 'string') return null;
  const now = new Date().toISOString();
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    id: str(x.id) || uid(),
    reference: str(x.reference),
    client: x.client,
    telephone: str(x.telephone),
    email: str(x.email),
    adresse: str(x.adresse),
    formule: FORMULES.includes(x.formule) ? x.formule : 'SÉCURISER',
    phase: PHASES.includes(x.phase) ? x.phase : 'Prospect',
    prochaineAction: str(x.prochaineAction),
    echeance: str(x.echeance),
    honorairesHT: str(x.honorairesHT),
    budgetTravaux: str(x.budgetTravaux),
    taches: Array.isArray(x.taches)
      ? x.taches
          .filter((t: any) => t && typeof t.texte === 'string')
          .map((t: any) => ({ id: str(t.id) || uid(), texte: t.texte, faite: !!t.faite }))
      : [],
    journal: Array.isArray(x.journal)
      ? x.journal
          .filter((n: any) => n && typeof n.texte === 'string')
          .map((n: any) => ({ id: str(n.id) || uid(), date: str(n.date) || now, texte: n.texte }))
      : [],
    createdAt: str(x.createdAt) || now,
    updatedAt: str(x.updatedAt) || now,
  };
}

export function DossiersProvider({ children }: { children: ReactNode }) {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [pret, setPret] = useState(false);
  const charge = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CLE)
      .then((brut) => {
        if (!brut) return;
        const liste = JSON.parse(brut);
        if (Array.isArray(liste)) setDossiers(liste.map(normaliser).filter(Boolean) as Dossier[]);
      })
      .catch((e) => console.warn('Lecture des dossiers impossible', e))
      .finally(() => {
        charge.current = true;
        setPret(true);
      });
  }, []);

  useEffect(() => {
    if (!charge.current) return;
    AsyncStorage.setItem(CLE, JSON.stringify(dossiers)).catch((e) =>
      console.warn('Sauvegarde impossible', e),
    );
  }, [dossiers]);

  const maj = useCallback((id: string, f: (d: Dossier) => Dossier) => {
    setDossiers((l) =>
      l.map((d) => (d.id === id ? { ...f(d), updatedAt: new Date().toISOString() } : d)),
    );
  }, []);

  const creer = useCallback((input: DossierInput) => {
    const now = new Date().toISOString();
    const d: Dossier = { ...input, id: uid(), taches: [], journal: [], createdAt: now, updatedAt: now };
    setDossiers((l) => [d, ...l]);
    return d.id;
  }, []);

  const creerExemple = useCallback(() => {
    const now = new Date().toISOString();
    const d: Dossier = {
      id: uid(),
      reference: 'DAY-2026-001',
      client: 'Exemple – Maison Martin',
      telephone: '0600000000',
      email: 'client@exemple.fr',
      adresse: '12 rue des Pyrénées, 64000 Pau',
      formule: 'CONCEVOIR',
      phase: 'Conception',
      prochaineAction: 'Présenter l’esquisse au client en visio',
      echeance: dansJours(3),
      honorairesHT: '4 800',
      budgetTravaux: '180 000',
      taches: [
        { id: uid(), texte: 'Relevé de l’existant', faite: true },
        { id: uid(), texte: 'Étude de sol commandée', faite: true },
        { id: uid(), texte: 'Esquisse v1', faite: false },
        { id: uid(), texte: 'Estimation budgétaire', faite: false },
      ],
      journal: [{ id: uid(), date: now, texte: 'Dossier d’exemple créé. Vous pouvez le supprimer à tout moment.' }],
      createdAt: now,
      updatedAt: now,
    };
    setDossiers((l) => [d, ...l]);
    return d.id;
  }, []);

  const store = useMemo<Store>(
    () => ({
      pret,
      dossiers,
      get: (id) => dossiers.find((d) => d.id === id),
      creer,
      creerExemple,
      modifier: (id, patch) => maj(id, (d) => ({ ...d, ...patch })),
      supprimer: (id) => setDossiers((l) => l.filter((d) => d.id !== id)),
      ajouterTache: (id, texte) =>
        maj(id, (d) => ({ ...d, taches: [...d.taches, { id: uid(), texte, faite: false }] })),
      basculerTache: (id, tid) =>
        maj(id, (d) => ({
          ...d,
          taches: d.taches.map((t) => (t.id === tid ? { ...t, faite: !t.faite } : t)),
        })),
      supprimerTache: (id, tid) =>
        maj(id, (d) => ({ ...d, taches: d.taches.filter((t) => t.id !== tid) })),
      ajouterNote: (id, texte) =>
        maj(id, (d) => ({
          ...d,
          journal: [{ id: uid(), date: new Date().toISOString(), texte }, ...d.journal],
        })),
      supprimerNote: (id, nid) =>
        maj(id, (d) => ({ ...d, journal: d.journal.filter((n) => n.id !== nid) })),
      exporter: () => JSON.stringify({ app: 'dayne-suivi', version: 1, dossiers }, null, 2),
      importer: (json) => {
        const brut = JSON.parse(json);
        const liste = Array.isArray(brut) ? brut : brut?.dossiers;
        if (!Array.isArray(liste)) throw new Error('Format non reconnu');
        const valides = liste.map(normaliser).filter(Boolean) as Dossier[];
        setDossiers((l) => {
          const parId = new Map(l.map((d) => [d.id, d]));
          valides.forEach((d) => parId.set(d.id, d));
          return [...parId.values()];
        });
        return valides.length;
      },
    }),
    [pret, dossiers, creer, creerExemple, maj],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useDossiers() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useDossiers doit être utilisé dans <DossiersProvider>');
  return s;
}
