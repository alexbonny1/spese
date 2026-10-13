import type { AppData, Security } from './types';
import { CATALOG_BY_SYM } from '../data/catalog';
import { fmt } from './format';

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

/** Replica la sezione Fisse › Spese fisse di `renderVals()` del prototipo. */
export function computeFixedScreen(
  data: AppData,
  today: Date,
  catalogBySym: Record<string, Security> = CATALOG_BY_SYM,
): FixedScreenVals {
  const todayDay = today.getDate();
  const sum = (arr: { amt: number }[]) => arr.reduce((x, a) => x + a.amt, 0);

  const incFixed = sum(data.incomes);
  const fixedTotal = sum(data.fixed) + sum(data.pacs);

  const incRows: FixedRow[] = [...data.incomes]
    .sort((a, b) => a.day - b.day)
    .map((x) => ({ id: x.id, day: x.day, name: x.name, amt: x.amt, amtF: fmt(x.amt), kind: 'inc' as const }));

  const fixRows: FixedRow[] = [...data.fixed]
    .sort((a, b) => a.day - b.day)
    .map((x) => ({
      id: x.id, day: x.day, name: x.name, amt: x.amt, amtF: fmt(x.amt),
      status: statusFor(x.day, todayDay), kind: 'fix' as const,
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
