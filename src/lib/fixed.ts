import type { AppData, FixedExpense, Security } from './types';
import { CATALOG_BY_SYM } from '../data/catalog';
import { fmt, MESI } from './format';

export interface FixedRow {
  id: string;
  day: number;
  name: string;
  amt: number;
  amtF: string;
  /** solo per righe di spesa fissa e PAC */
  status?: string;
  kind: 'inc' | 'fix' | 'pac';
}

/** Quanto pesa sullo spendibile ogni mese: intero se mensile, 1/12 se annuale. */
export function monthlyAmt(f: Pick<FixedExpense, 'amt' | 'freq'>): number {
  return f.freq === 'annual' ? f.amt / 12 : f.amt;
}

export interface FixedScreenVals {
  incFixedTotF: string;
  incRows: FixedRow[];
  fixedTotF: string;
  fixRows: FixedRow[];
}

function statusFor(day: number, todayDay: number): string {
  if (day <= todayDay) return 'Già addebitata';
  if (day - todayDay === 1) return 'Domani';
  return `Tra ${day - todayDay} giorni`;
}

/** Giorni alla prossima occorrenza annuale (mese/giorno), spostando all'anno dopo se già passata. */
function daysToAnnual(month: number, day: number, today: Date): number {
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  return Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
}

function statusForAnnual(month: number, day: number, today: Date): string {
  const n = daysToAnnual(month, day, today);
  const when = `${day} ${MESI[month - 1]}`;
  if (n === 0) return `Ogni anno il ${when} · oggi`;
  if (n === 1) return `Ogni anno il ${when} · domani`;
  return `Ogni anno il ${when} · tra ${n} giorni`;
}

/** Replica la sezione Fisse › Spese fisse di `renderVals()` del prototipo. */
export function computeFixedScreen(
  data: AppData,
  today: Date,
  catalogBySym: Record<string, Security> = CATALOG_BY_SYM,
): FixedScreenVals {
  const todayDay = today.getDate();
  const sum = (arr: { amt: number }[]) => arr.reduce((x, a) => x + a.amt, 0);

  const incFixed = sum(data.incomes);
  const fixedTotal = data.fixed.reduce((x, f) => x + monthlyAmt(f), 0) + sum(data.pacs);

  const incRows: FixedRow[] = [...data.incomes]
    .sort((a, b) => a.day - b.day)
    .map((x) => ({ id: x.id, day: x.day, name: x.name, amt: x.amt, amtF: fmt(x.amt), kind: 'inc' as const }));

  const fixRows: FixedRow[] = [...data.fixed]
    .sort((a, b) => a.day - b.day)
    .map((x) => ({
      id: x.id, day: x.day, name: x.name, amt: x.amt, amtF: fmt(x.amt),
      status:
        x.freq === 'annual'
          ? `${statusForAnnual(x.month ?? 1, x.day, today)} · € ${fmt(monthlyAmt(x))}/mese`
          : statusFor(x.day, todayDay),
      kind: 'fix' as const,
    }));
  for (const p of data.pacs) {
    const c = catalogBySym[p.sym];
    if (!c) continue;
    fixRows.push({
      id: p.id, day: p.day, name: `PAC ${c.sym}`, amt: p.amt, amtF: fmt(p.amt),
      status: 'Investimento ricorrente', kind: 'pac' as const,
    });
  }
  fixRows.sort((a, b) => a.day - b.day);

  return { incFixedTotF: fmt(incFixed), incRows, fixedTotF: fmt(fixedTotal), fixRows };
}
