import { CATALOG_BY_SYM } from '../data/catalog';
import { computeHoldings } from './calc';
import { fmt, fq, pct, signColor, signedEuro } from './format';
import type { AppData, Security } from './types';

export interface HoldingRow {
  sym: string;
  name: string;
  sub: string;
  valueF: string;
  gainPctF: string;
  color: string;
}

export interface PacRow {
  id: string;
  label: string;
  sub: string;
  amtF: string;
}

export interface InvestmentsVals {
  pfValueF: string;
  pfCostF: string;
  pfGainF: string;
  pfGainPctF: string;
  pfGainColor: string;
  pfTaxF: string;
  pfDivF: string;
  pfNetF: string;
  holdRows: HoldingRow[];
  pacRows: PacRow[];
  hasPacs: boolean;
}

function fo(c: Security, v: number): string {
  return (c.cur === 'USD' ? '$ ' : '€ ') + fmt(v);
}

/** Replica la sezione Fisse › Investimenti (riepilogo portafoglio) di `renderVals()`. */
export function computeInvestments(data: AppData, catalogBySym: Record<string, Security> = CATALOG_BY_SYM): InvestmentsVals {
  const holdings = computeHoldings(data.lots, catalogBySym);
  const pf = holdings.reduce(
    (a, h) => ({ value: a.value + h.value, cost: a.cost + h.cost, tax: a.tax + h.tax, divNet: a.divNet + h.divNet }),
    { value: 0, cost: 0, tax: 0, divNet: 0 },
  );
  const pfGain = pf.value - pf.cost;

  const holdRows: HoldingRow[] = [...holdings]
    .sort((a, b) => b.value - a.value)
    .map((h) => ({
      sym: h.c.sym,
      name: h.c.name,
      sub: `${fq(h.qty)} quote · PMC ${fo(h.c, h.avgO)}`,
      valueF: fmt(h.value),
      gainPctF: pct(h.gainPct),
      color: signColor(h.gain),
    }));

  const pacRows: PacRow[] = data.pacs.map((p) => {
    const c = catalogBySym[p.sym];
    return {
      id: p.id,
      label: `${p.sym} · ${c?.name ?? ''}`,
      sub: `Ogni mese il giorno ${p.day} · conta nelle spese fisse`,
      amtF: fmt(p.amt),
    };
  });

  return {
    pfValueF: fmt(pf.value),
    pfCostF: fmt(pf.cost),
    pfGainF: signedEuro(pfGain),
    pfGainPctF: pct(pf.cost ? (pfGain / pf.cost) * 100 : 0),
    pfGainColor: signColor(pfGain),
    pfTaxF: fmt(pf.tax),
    pfDivF: fmt(pf.divNet),
    pfNetF: fmt(pf.value - pf.tax),
    holdRows,
    pacRows,
    hasPacs: data.pacs.length > 0,
  };
}
