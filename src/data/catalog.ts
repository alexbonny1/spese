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
 *
 * IWDA e QDVE sono ETF UCITS europei reali (nessun feed gratuito trovato,
 * stessa restrizione): usano `feed: { provider: 'manual' }`, prezzo
 * aggiornato a mano dall'utente invece che recuperato live.
 */
export const CATALOG_STATIC: SecurityStatic[] = [
  { sym: 'AAPL', name: 'Apple', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'AAPL' } },
  { sym: 'MSFT', name: 'Microsoft', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'MSFT' } },
  { sym: 'NVDA', name: 'NVIDIA', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'NVDA' } },
  { sym: 'AMZN', name: 'Amazon', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'AMZN' } },
  { sym: 'GOOGL', name: 'Alphabet A', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'GOOGL' } },
  { sym: 'TSLA', name: 'Tesla', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'TSLA' } },
  { sym: 'ASML', name: 'ASML Holding', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'ASML' } },
  { sym: 'URTH', name: 'iShares MSCI World', type: 'ETF', ex: 'NYSE Arca', cur: 'USD', feed: { provider: 'td', symbol: 'URTH' } },
  { sym: 'ACWI', name: 'iShares MSCI ACWI (All World)', type: 'ETF', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'ACWI' } },
  { sym: 'VOO', name: 'Vanguard S&P 500', type: 'ETF', ex: 'NYSE Arca', cur: 'USD', feed: { provider: 'td', symbol: 'VOO' } },
  { sym: 'QQQ', name: 'Invesco QQQ (Nasdaq 100)', type: 'ETF', ex: 'NASDAQ', cur: 'USD', feed: { provider: 'td', symbol: 'QQQ' } },
  { sym: 'VWO', name: 'Vanguard FTSE Emerging Markets', type: 'ETF', ex: 'NYSE Arca', cur: 'USD', feed: { provider: 'td', symbol: 'VWO' } },
  { sym: 'VYM', name: 'Vanguard High Dividend Yield', type: 'ETF', ex: 'NYSE Arca', cur: 'USD', feed: { provider: 'td', symbol: 'VYM' } },
  { sym: 'IWDA', name: 'iShares Core MSCI World (IE00B4L5Y983)', type: 'ETF', ex: 'Manuale', cur: 'EUR', feed: { provider: 'manual' } },
  { sym: 'QDVE', name: 'iShares S&P 500 IT Sector (IE00B3WJKG14)', type: 'ETF', ex: 'Manuale', cur: 'EUR', feed: { provider: 'manual' } },
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
