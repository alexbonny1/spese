import type { Security, SecurityStatic } from '../lib/types';

/**
 * Catalogo titoli: solo metadati statici (nome/tipo/borsa/valuta/feed).
 * Prezzo, rendimenti e dividendo sono dati di mercato reali, recuperati live
 * via `lib/marketData.ts` (Twelve Data per azioni, CoinGecko per crypto)
 * e non più inventati qui.
 *
 * Il piano gratuito di Twelve Data copre solo le borse USA: niente azioni
 * italiane (ENI, ISP, ENEL, RACE, STLAM, UCG) né ETF UCITS europei (VWCE,
 * SWDA, CSSPX, EIMI, VHYL) — tolti dal catalogo finché non c'è una fonte
 * gratuita per loro. ASML resta perché ha una quotazione diretta su NASDAQ
 * in USD, disponibile sul piano free. Tolte anche le obbligazioni di stato
 * (BTP) e i fondi comuni italiani, per lo stesso motivo.
 */
export const CATALOG_STATIC: SecurityStatic[] = [
  { sym: 'AAPL', name: 'Apple', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'AAPL' } },
  { sym: 'MSFT', name: 'Microsoft', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'MSFT' } },
  { sym: 'NVDA', name: 'NVIDIA', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'NVDA' } },
  { sym: 'AMZN', name: 'Amazon', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'AMZN' } },
  { sym: 'GOOGL', name: 'Alphabet A', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'GOOGL' } },
  { sym: 'TSLA', name: 'Tesla', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'TSLA' } },
  { sym: 'ASML', name: 'ASML Holding', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'ASML' } },
  { sym: 'BTC', name: 'Bitcoin', type: 'Crypto', ex: 'Crypto', cur: 'USD', feed: { provider: 'cg', id: 'bitcoin' } },
  { sym: 'ETH', name: 'Ethereum', type: 'Crypto', ex: 'Crypto', cur: 'USD', feed: { provider: 'cg', id: 'ethereum' } },
  { sym: 'SOL', name: 'Solana', type: 'Crypto', ex: 'Crypto', cur: 'USD', feed: { provider: 'cg', id: 'solana' } },
];

export const CATALOG_STATIC_BY_SYM: Record<string, SecurityStatic> = Object.fromEntries(
  CATALOG_STATIC.map((c) => [c.sym, c]),
);

/** Vista "piatta" col solo tipo `Security` (prezzo/rendimenti a 0 finché non arrivano dal live). */
export const CATALOG: Security[] = CATALOG_STATIC.map((c) => ({ ...c, price: 0, r1y: 0, ytd: 0, yld: 0 }));

export const CATALOG_BY_SYM: Record<string, Security> = Object.fromEntries(
  CATALOG.map((c) => [c.sym, c]),
);
