import { computePiggy, type PiggyCalc } from './calc';
import { fmt } from './format';
import { getPeriod } from './period';
import type { AppData } from './types';

export interface PiggyListRow {
  id: string;
  name: string;
  savedF: string;
  goalF: string;
  pctF: string;
  w: string;
  quotaF: string;
  dateF: string;
  hint: string;
  hintColor: string;
}

export interface RisparmiVals {
  pgTotalF: string;
  saveMonthF: string;
  rows: PiggyListRow[];
}

function periodMonthYear(data: AppData, today: Date): { month: number; year: number } {
  const period = getPeriod(today, data.payday);
  return { month: period.start.getMonth() + 1, year: period.start.getFullYear() };
}

export function computeRisparmi(data: AppData, today: Date): RisparmiVals {
  const { month, year } = periodMonthYear(data, today);
  const calcs = data.piggies.map((p) => computePiggy(p, month, year));
  const pgTotal = calcs.reduce((x, c) => x + c.saved, 0);
  const quotaTot = calcs.reduce((x, c) => x + c.piggy.quota, 0);
  const saveMonth = quotaTot + calcs.reduce((x, c) => x + c.manual, 0);
  const rows: PiggyListRow[] = calcs.map((c) => ({
    id: c.piggy.id,
    name: c.piggy.name,
    savedF: c.savedF,
    goalF: c.goalF,
    pctF: c.pctF,
    w: c.w,
    quotaF: c.quotaF,
    dateF: c.dateF,
    hint: c.hint,
    hintColor: c.hintColor,
  }));
  return { pgTotalF: fmt(pgTotal), saveMonthF: fmt(saveMonth), rows };
}

export function computePiggyDetail(data: AppData, today: Date, id: string): PiggyCalc | null {
  const piggy = data.piggies.find((p) => p.id === id);
  if (!piggy) return null;
  const { month, year } = periodMonthYear(data, today);
  return computePiggy(piggy, month, year);
}
