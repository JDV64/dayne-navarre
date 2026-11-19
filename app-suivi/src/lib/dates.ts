const MS_JOUR = 86_400_000;

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function aMinuit(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
}

/** "AAAA-MM-JJ" → Date locale (sans décalage de fuseau) */
export function fromISODate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

/** "JJ/MM/AAAA" → "AAAA-MM-JJ" ; "" si vide ; null si invalide */
export function parseFR(saisie: string): string | null {
  const s = saisie.trim();
  if (!s) return '';
  const m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2}|\d{4})$/.exec(s);
  if (!m) return null;
  const j = Number(m[1]);
  const mo = Number(m[2]);
  let a = Number(m[3]);
  if (a < 100) a += 2000;
  const d = new Date(a, mo - 1, j);
  if (d.getFullYear() !== a || d.getMonth() !== mo - 1 || d.getDate() !== j) return null;
  return toISODate(d);
}

export function formatFR(iso: string): string {
  const d = fromISODate(iso);
  if (!d) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatLong(iso: string): string {
  const d = fromISODate(iso);
  if (!d) return '';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

export function formatHorodatage(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Jours restants avant l'échéance (négatif = en retard), null si pas d'échéance */
export function joursRestants(iso: string): number | null {
  const d = fromISODate(iso);
  if (!d) return null;
  return Math.round((aMinuit(d).getTime() - aMinuit(new Date()).getTime()) / MS_JOUR);
}

export function libelleEcheance(iso: string): string {
  const n = joursRestants(iso);
  if (n === null) return 'Pas d’échéance';
  if (n < -1) return `En retard de ${-n} j`;
  if (n === -1) return 'En retard depuis hier';
  if (n === 0) return 'Aujourd’hui';
  if (n === 1) return 'Demain';
  if (n < 7) return `Dans ${n} j`;
  return formatLong(iso);
}

export function dansJours(n: number): string {
  return toISODate(new Date(Date.now() + n * MS_JOUR));
}
