import { CATALOG_STATIC } from '../data/catalog';
import { computeHoldings } from './calc';
import { fmt, pct, signColor } from './format';
import { getCachedQuote, hasQuoteError, liveCatalogBySym } from './marketData';
import type { AppData, Security, SecurityType } from './types';

export type TypeFilter = 'Tutti' | SecurityType;

export const TYPE_CHIPS: TypeFilter[] = ['Tutti', 'Azioni', 'Crypto'];

export interface SearchResultRow {
  sym: string;
  name: string;
  type: SecurityType;
  ex: string;
  ready: boolean;
  errored: boolean;
  priceF: string;
  r1yF: string;
  color: string;
  ownedLabel: string;
}

function fo(c: Security, v: number): string {
  return (c.cur === 'USD' ? '$ ' : '€ ') + fmt(v);
}

/** Replica la ricerca titoli di `renderVals()`: filtro per tipo + testo su ticker/nome. */
export function searchSecurities(data: AppData, query: string, type: TypeFilter): SearchResultRow[] {
  const catalogBySym = liveCatalogBySym();
  const holdings = computeHoldings(data.lots, catalogBySym);
  const ownedSyms = new Set(holdings.map((h) => h.c.sym));
  const q = query.trim().toLowerCase();
  return CATALOG_STATIC.filter(
    (c) => (type === 'Tutti' || c.type === type) && (!q || c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
  ).map((s) => {
    const c = catalogBySym[s.sym];
    const ready = !!getCachedQuote(s.sym);
    return {
      sym: c.sym,
      name: c.name,
      type: c.type,
      ex: c.ex,
      ready,
      errored: hasQuoteError(s.sym),
      priceF: ready ? fo(c, c.price) : '…',
      r1yF: ready ? pct(c.r1y) : '…',
      color: signColor(c.r1y),
      ownedLabel: ownedSyms.has(c.sym) ? ' · in portafoglio' : '',
    };
  });
}
