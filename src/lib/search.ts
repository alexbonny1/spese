import { CATALOG, CATALOG_BY_SYM } from '../data/catalog';
import { computeHoldings } from './calc';
import { fmt, pct, signColor } from './format';
import type { AppData, Security, SecurityType } from './types';

export type TypeFilter = 'Tutti' | SecurityType;

export const TYPE_CHIPS: TypeFilter[] = ['Tutti', 'Azioni', 'ETF', 'Crypto', 'Obbligazioni', 'Fondi'];

export interface SearchResultRow {
  sym: string;
  name: string;
  type: SecurityType;
  ex: string;
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
  const holdings = computeHoldings(data.lots, CATALOG_BY_SYM);
  const ownedSyms = new Set(holdings.map((h) => h.c.sym));
  const q = query.trim().toLowerCase();
  return CATALOG.filter(
    (c) => (type === 'Tutti' || c.type === type) && (!q || c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
  ).map((c) => ({
    sym: c.sym,
    name: c.name,
    type: c.type,
    ex: c.ex,
    priceF: fo(c, c.price),
    r1yF: pct(c.r1y),
    color: signColor(c.r1y),
    ownedLabel: ownedSyms.has(c.sym) ? ' · in portafoglio' : '',
  }));
}
