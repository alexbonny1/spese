import { computeHoldings, toEur, USD_EUR_RATE } from './calc';
import { computeChartFromSeries } from './chart';
import { fmt, fq, MESI, pct, signColor, signedEuro } from './format';
import { getCachedQuote, hasQuoteError, isManualSecurity, liveCatalogBySym } from './marketData';
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
  /** true quando i dati di mercato reali sono arrivati e si può mostrare il resto */
  ready: boolean;
  /** true se il recupero dei dati di mercato è fallito */
  errored: boolean;
  /** true per i titoli con prezzo aggiornato a mano (nessun feed gratuito disponibile) */
  isManual: boolean;
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
  chartStartF: string;
  minF: string;
  maxF: string;
  owned: boolean;
  pacNote: string;
  position: AssetPosition | null;
}

/** Replica la costruzione di `asV`/`posV` in `renderVals()` per il Dettaglio titolo. */
export function computeAssetDetail(data: AppData, sym: string): AssetDetail | null {
  const catalogBySym = liveCatalogBySym(data.manualPrices);
  const c = catalogBySym[sym];
  if (!c) return null;

  const isManual = isManualSecurity(sym);
  const quote = getCachedQuote(sym);
  const ready = isManual ? c.price > 0 : !!quote;
  const errored = !isManual && hasQuoteError(sym);
  const chart = quote ? computeChartFromSeries(quote.series) : { pts: '', area: '', min: 0, max: 0 };
  const chartStart = quote?.series[0]?.t;
  const chartStartF = chartStart ? `${MESI[new Date(chartStart).getMonth()]} ${new Date(chartStart).getFullYear()}` : '';
  const tr = 0.26;
  const pac = data.pacs.find((p) => p.sym === c.sym);

  const holdings = computeHoldings(data.lots, catalogBySym);
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
      divLabel: 'Dividendi annui stimati',
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
    ready,
    errored,
    isManual,
    priceF: fo(c, c.price),
    priceEurF: fmt(c.price / USD_EUR_RATE),
    isUsd: c.cur === 'USD',
    r1yF: isManual ? '—' : pct(c.r1y),
    ytdF: isManual ? '—' : pct(c.ytd),
    color: isManual ? 'var(--color-text)' : signColor(c.r1y),
    yldLabel: 'Dividendo annuo',
    yldF: isManual ? '—' : c.yld ? c.yld.toFixed(2).replace('.', ',') + '%' : '—',
    trF: (tr * 100).toString().replace('.', ',') + '%',
    chartPts: chart.pts,
    chartArea: chart.area,
    chartStartF,
    minF: fo(c, chart.min),
    maxF: fo(c, chart.max),
    owned: !!h,
    pacNote: pac ? `PAC attivo: € ${fmt(pac.amt)} ogni mese il giorno ${pac.day}` : '',
    position,
  };
}
