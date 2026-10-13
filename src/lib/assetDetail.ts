import { CATALOG_BY_SYM } from '../data/catalog';
import { computeHoldings, toEur, USD_EUR_RATE } from './calc';
import { computeChart } from './chart';
import { fmt, fq, pct, signColor, signedEuro } from './format';
import type { AppData, Security } from './types';

function fo(c: Security, v: number): string {
  return (c.cur === 'USD' ? '$ ' : '€ ') + fmt(v);
}

export interface AssetLotRow {
  id: string;
  qtyF: string;
  priceF: string;
  date: string;
  feeF: string;
  totF: string;
}

export interface AssetPosition {
  valueF: string;
  gainPctF: string;
  color: string;
  qtyF: string;
  avgF: string;
  feeF: string;
  costF: string;
  gainF: string;
  taxF: string;
  netF: string;
  divLabel: string;
  divF: string;
  divNetF: string;
  lots: AssetLotRow[];
}

export interface AssetDetail {
  sym: string;
  name: string;
  type: string;
  ex: string;
  priceF: string;
  priceEurF: string;
  isUsd: boolean;
  r1yF: string;
  ytdF: string;
  color: string;
  yldLabel: string;
  yldF: string;
  trF: string;
  chartPts: string;
  chartArea: string;
  minF: string;
  maxF: string;
  owned: boolean;
  pacNote: string;
  position: AssetPosition | null;
}

/** Replica la costruzione di `asV`/`posV` in `renderVals()` per il Dettaglio titolo. */
export function computeAssetDetail(data: AppData, sym: string): AssetDetail | null {
  const c = CATALOG_BY_SYM[sym];
  if (!c) return null;

  const chart = computeChart(c.sym, c.price, c.r1y);
  const tr = c.type === 'Obbligazioni' ? 0.125 : 0.26;
  const pac = data.pacs.find((p) => p.sym === c.sym);

  const holdings = computeHoldings(data.lots, CATALOG_BY_SYM);
  const h = holdings.find((x) => x.c.sym === c.sym);

  let position: AssetPosition | null = null;
  if (h) {
    position = {
      valueF: fmt(h.value),
      gainPctF: pct(h.gainPct),
      color: signColor(h.gain),
      qtyF: fq(h.qty),
      avgF: fo(c, h.avgO) + (c.cur === 'USD' ? ` (€ ${fmt(h.avgO / USD_EUR_RATE)})` : ''),
      feeF: fmt(h.fee),
      costF: fmt(h.cost),
      gainF: signedEuro(h.gain),
      taxF: fmt(h.tax),
      netF: fmt(h.net),
      divLabel: c.type === 'Obbligazioni' ? 'Cedole annue stimate' : 'Dividendi annui stimati',
      divF: fmt(h.div),
      divNetF: fmt(h.divNet),
      lots: h.lots
        .slice()
        .reverse()
        .map((l) => ({
          id: l.id,
          qtyF: fq(l.qty),
          priceF: fo(c, l.price),
          date: l.date,
          feeF: fmt(l.fee),
          totF: fmt(toEur(c, l.qty * l.price) + l.fee),
        })),
    };
  }

  return {
    sym: c.sym,
    name: c.name,
    type: c.type,
    ex: c.ex,
    priceF: fo(c, c.price),
    priceEurF: fmt(c.price / USD_EUR_RATE),
    isUsd: c.cur === 'USD',
    r1yF: pct(c.r1y),
    ytdF: pct(c.ytd),
    color: signColor(c.r1y),
    yldLabel: c.type === 'Obbligazioni' ? 'Cedola annua' : 'Dividendo annuo',
    yldF: c.yld ? c.yld.toFixed(2).replace('.', ',') + '%' : '—',
    trF: (tr * 100).toString().replace('.', ',') + '%',
    chartPts: chart.pts,
    chartArea: chart.area,
    minF: fo(c, chart.min),
    maxF: fo(c, chart.max),
    owned: !!h,
    pacNote: pac ? `PAC attivo: € ${fmt(pac.amt)} ogni mese il giorno ${pac.day}` : '',
    position,
  };
}
