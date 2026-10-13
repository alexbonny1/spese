export const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
export const MESI_FULL = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

/** "1.234,56" — punto per le migliaia, virgola per i decimali. */
export function fmt(n: number): string {
  const [i, d] = Math.abs(n).toFixed(2).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d;
}

/** Come fmt ma senza decimali finali inutili (per quantità/quote). */
export function fq(n: number): string {
  const r = Math.round(n * 10000) / 10000;
  const [i, d] = String(Math.abs(r)).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
}

/** Percentuale con segno tipografico, es. "+14,8%". */
export function pct(n: number): string {
  return (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1).replace('.', ',') + '%';
}

/** Importo con segno ed "€", es. "+ € 150,00". */
export function signedEuro(n: number): string {
  return (n >= 0 ? '+ € ' : '− € ') + fmt(n);
}

/** Colore semantico coerente col design system: verde/accent per positivo, testo per negativo. */
export function signColor(n: number): string {
  return n >= 0 ? 'var(--color-accent-700)' : 'var(--color-text)';
}
