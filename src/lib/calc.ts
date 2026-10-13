import type { Lot, Piggy, Security } from './types';
import { fmt, fq, MESI } from './format';

export const USD_EUR_RATE = 1.08;

export interface Holding {
  c: Security;
  qty: number;
  fee: number;
  lots: Lot[];
  /** prezzo medio di carico, valuta originale */
  avgO: number;
  /** costo totale in € (incl. commissioni) */
  cost: number;
  /** valore attuale in € */
  value: number;
  gain: number;
  gainPct: number;
  /** aliquota: 12,5% obbligazioni, 26% il resto */
  tr: number;
  tax: number;
  net: number;
  div: number;
  divNet: number;
}

export function toEur(c: Security, v: number): number {
  return c.cur === 'USD' ? v / USD_EUR_RATE : v;
}

/** Aggrega i lotti per titolo e calcola costo, valore e G/P correnti. */
export function computeHoldings(lots: Lot[], catalogBySym: Record<string, Security>): Holding[] {
  const grouped = new Map<string, { c: Security; qty: number; costO: number; fee: number; lots: Lot[] }>();
  for (const l of lots) {
    const c = catalogBySym[l.sym];
    if (!c) continue;
    const h = grouped.get(l.sym) ?? { c, qty: 0, costO: 0, fee: 0, lots: [] };
    h.qty += l.qty;
    h.costO += l.qty * l.price;
    h.fee += l.fee;
    h.lots.push(l);
    grouped.set(l.sym, h);
  }
  return [...grouped.values()].map((h) => {
    const { c } = h;
    const cost = toEur(c, h.costO) + h.fee;
    const value = toEur(c, h.qty * c.price);
    const gain = value - cost;
    const tr = c.type === 'Obbligazioni' ? 0.125 : 0.26;
    const tax = Math.max(0, gain) * tr;
    const div = (value * c.yld) / 100;
    return {
      ...h,
      avgO: h.costO / h.qty,
      cost,
      value,
      gain,
      gainPct: cost ? (gain / cost) * 100 : 0,
      tr,
      tax,
      net: value - tax,
      div,
      divNet: div * (1 - tr),
    };
  });
}

export interface PiggyHistRow {
  id: string;
  date: string;
  label: string;
  amtF: string;
  color: string;
}

export interface PiggyCalc {
  piggy: Piggy;
  /** totale versato manualmente questo mese (versamenti − prelievi) */
  manual: number;
  /** saldo attuale del salvadanaio */
  saved: number;
  savedF: string;
  goalF: string;
  quotaF: string;
  left: number;
  leftF: string;
  need: number;
  needF: string;
  dateF: string;
  pct: number;
  pctF: string;
  /** larghezza barra, es. "42%" */
  w: string;
  hint: string;
  hintColor: string;
  hist: PiggyHistRow[];
}

/** curMonth: 1-12. Replica `pgCalc` del prototipo, generalizzata al mese/anno correnti reali. */
export function computePiggy(p: Piggy, curMonth: number, curYear: number): PiggyCalc {
  const manual = (p.hist ?? []).filter((e) => e.cur).reduce((x, e) => x + e.amt, 0);
  const saved = p.base + manual;
  const months = (p.ty - curYear) * 12 + (p.tm - curMonth);
  const left = Math.max(0, p.goal - saved);
  const need = months > 0 ? left / months : left;

  let hint: string;
  let hintColor: string;
  if (left <= 0) {
    hint = 'Obiettivo raggiunto';
    hintColor = 'var(--color-accent-700)';
  } else if (months <= 0) {
    hint = 'Data obiettivo passata: aggiornala';
    hintColor = 'var(--color-accent-800)';
  } else if (p.quota >= need) {
    hint = `Con questa quota arrivi in tempo (servono € ${fmt(need)}/mese)`;
    hintColor = 'var(--color-accent-700)';
  } else {
    hint = `Servono € ${fmt(need)}/mese: la quota è sotto di € ${fmt(need - p.quota)}`;
    hintColor = 'var(--color-accent-800)';
  }

  const cur = (p.hist ?? []).filter((e) => e.cur).slice().reverse();
  const past = (p.hist ?? []).filter((e) => !e.cur);
  const hist: PiggyHistRow[] = [...cur, { id: 'q', date: `1 ${MESI[curMonth - 1]}`, label: 'Quota mensile', amt: p.quota }, ...past]
    .filter((e) => e.amt !== 0)
    .map((e) => ({
      id: e.id,
      date: e.date,
      label: e.label,
      amtF: (e.amt >= 0 ? '+ ' : '− ') + fmt(e.amt),
      color: e.amt >= 0 ? 'var(--color-accent-700)' : 'var(--color-text)',
    }));

  const pct = p.goal ? Math.min(100, (saved / p.goal) * 100) : 0;
  return {
    piggy: p, manual, saved, savedF: fmt(saved), goalF: fq(p.goal), quotaF: fq(p.quota),
    left, leftF: fmt(left), need, needF: left <= 0 ? '—' : `€ ${fmt(need)}`,
    dateF: `${MESI[p.tm - 1]} ${p.ty}`, pct, pctF: Math.round(pct) + '%', w: pct + '%',
    hint, hintColor, hist,
  };
}
