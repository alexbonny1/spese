import type { AppData, Security } from './types';
import { computeHoldings, computePiggy } from './calc';
import { fmt, MESI } from './format';
import { liveCatalogBySym } from './marketData';
import { getPeriod } from './period';

export interface RecentTx {
  id: string;
  name: string;
  amtF: string;
  color: string;
  sub: string;
}

export interface HomeVals {
  periodLabel: string;
  daysLeftLabel: string;
  spendableF: string;
  perDayF: string;
  showPerDay: boolean;
  netWorth: number;
  netWorthF: string;
  alertOn: boolean;
  alertText: string;
  incomeF: string;
  fixedF: string;
  spentF: string;
  setAsideF: string;
  /** percentuali (0-100) delle sezioni della barra del mese, relative alle entrate */
  wFixed: number;
  wSpent: number;
  wSave: number;
  wInv: number;
  /** percentuale "Disponibile" mostrata in legenda */
  pAvail: number;
  recent: RecentTx[];
}

/** Replica `renderVals()` del prototipo per la sola Home, con calendario reale. */
export function computeHome(
  data: AppData,
  today: Date,
  catalogBySym: Record<string, Security> = liveCatalogBySym(data.manualPrices),
): HomeVals {
  const period = getPeriod(today, data.payday);
  const todayDay = today.getDate();
  const sum = (arr: { amt: number }[]) => arr.reduce((x, a) => x + a.amt, 0);

  const extraIn = data.tx.filter((t) => t.amt > 0).reduce((x, t) => x + t.amt, 0);
  const incFixed = sum(data.incomes);
  const income = incFixed + (data.extra ? extraIn : 0);

  const pacTot = sum(data.pacs);
  const fixed = sum(data.fixed) + pacTot;

  const spent = -data.tx
    .filter((t) => t.amt < 0 && t.cat !== 'Investimento')
    .reduce((x, t) => x + t.amt, 0);
  const invested = -data.tx
    .filter((t) => t.cat === 'Investimento')
    .reduce((x, t) => x + t.amt, 0);

  const curMonth = period.start.getMonth() + 1;
  const curYear = period.start.getFullYear();
  const piggiesCalc = data.piggies.map((p) => computePiggy(p, curMonth, curYear));
  const quotaTot = piggiesCalc.reduce((x, p) => x + p.piggy.quota, 0);
  const saveMonth = quotaTot + piggiesCalc.reduce((x, p) => x + p.manual, 0);

  const spendable = data.initialCash + data.initialBank + income - fixed - spent - invested - saveMonth;

  const holdings = computeHoldings(data.lots, catalogBySym);
  const portfolioValue = data.initialInvested + holdings.reduce((x, h) => x + h.value, 0);
  const pgTotal = piggiesCalc.reduce((x, p) => x + p.saved, 0);
  const netWorth = spendable + pgTotal + portfolioValue;

  const perDayN = Math.max(0, spendable) / period.daysLeft;

  const pctOfIncome = (v: number) => Math.max(0, Math.min(100, income ? (v / income) * 100 : 0));

  const monthAbbrev = MESI[period.start.getMonth()];
  const sorted = [...data.tx].sort((a, b) => b.day - a.day);
  const recent: RecentTx[] = sorted.slice(0, 4).map((t) => ({
    id: t.id,
    name: t.name,
    amtF: (t.amt > 0 ? '+ ' : '− ') + fmt(t.amt),
    color: t.amt > 0 ? 'var(--color-accent-700)' : 'var(--color-text)',
    sub: `${t.cat} · ${t.day === todayDay ? 'Oggi' : t.day + ' ' + monthAbbrev}`,
  }));

  return {
    periodLabel: period.label,
    daysLeftLabel: `${period.daysLeft} giorni rimasti`,
    spendableF: (spendable < 0 ? '−' : '') + fmt(spendable),
    perDayF: fmt(perDayN),
    showPerDay: data.perDay,
    netWorth,
    netWorthF: fmt(netWorth),
    alertOn: data.alert > 0 && perDayN < data.alert,
    alertText: `Sei sotto la tua soglia di € ${data.alert} al giorno. Restano € ${fmt(perDayN)} al giorno fino a fine periodo.`,
    incomeF: fmt(income),
    fixedF: fmt(fixed),
    spentF: fmt(spent),
    setAsideF: fmt(saveMonth + invested),
    wFixed: pctOfIncome(fixed),
    wSpent: pctOfIncome(spent),
    wSave: pctOfIncome(saveMonth),
    wInv: pctOfIncome(invested),
    pAvail: Math.round(pctOfIncome(Math.max(0, spendable))),
    recent,
  };
}
