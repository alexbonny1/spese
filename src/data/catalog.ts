import type { Security } from '../lib/types';

/** Catalogo titoli di esempio (prezzi e rendimenti non aggiornati). */
export const CATALOG: Security[] = [
  { sym: 'AAPL', name: 'Apple', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', price: 228.5, r1y: 22.4, ytd: 16.8, yld: 0.44 },
  { sym: 'MSFT', name: 'Microsoft', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', price: 425.3, r1y: 14.1, ytd: 10.2, yld: 0.72 },
  { sym: 'NVDA', name: 'NVIDIA', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', price: 132.8, r1y: 118.5, ytd: 96.3, yld: 0.03 },
  { sym: 'AMZN', name: 'Amazon', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', price: 186.4, r1y: 31.2, ytd: 22.6, yld: 0 },
  { sym: 'GOOGL', name: 'Alphabet A', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', price: 167.2, r1y: 19.8, ytd: 18.1, yld: 0.48 },
  { sym: 'TSLA', name: 'Tesla', type: 'Azioni', ex: 'NASDAQ', cur: 'USD', price: 241.0, r1y: -4.6, ytd: -2.9, yld: 0 },
  { sym: 'ENI', name: 'Eni', type: 'Azioni', ex: 'Borsa Italiana', cur: 'EUR', price: 14.12, r1y: -6.2, ytd: -3.1, yld: 7.1 },
  { sym: 'ISP', name: 'Intesa Sanpaolo', type: 'Azioni', ex: 'Borsa Italiana', cur: 'EUR', price: 3.92, r1y: 38.4, ytd: 28.7, yld: 7.6 },
  { sym: 'ENEL', name: 'Enel', type: 'Azioni', ex: 'Borsa Italiana', cur: 'EUR', price: 7.18, r1y: 14.9, ytd: 6.2, yld: 6.0 },
  { sym: 'RACE', name: 'Ferrari', type: 'Azioni', ex: 'Borsa Italiana', cur: 'EUR', price: 432.6, r1y: 32.7, ytd: 26.4, yld: 0.6 },
  { sym: 'STLAM', name: 'Stellantis', type: 'Azioni', ex: 'Borsa Italiana', cur: 'EUR', price: 12.4, r1y: -41.3, ytd: -38.0, yld: 12.4 },
  { sym: 'UCG', name: 'UniCredit', type: 'Azioni', ex: 'Borsa Italiana', cur: 'EUR', price: 38.5, r1y: 52.1, ytd: 40.2, yld: 5.4 },
  { sym: 'ASML', name: 'ASML Holding', type: 'Azioni', ex: 'Euronext', cur: 'EUR', price: 712.4, r1y: -2.8, ytd: 4.1, yld: 0.9 },
  { sym: 'VWCE', name: 'Vanguard FTSE All-World Acc', type: 'ETF', ex: 'Borsa Italiana', cur: 'EUR', price: 124.6, r1y: 24.3, ytd: 19.5, yld: 0 },
  { sym: 'SWDA', name: 'iShares Core MSCI World Acc', type: 'ETF', ex: 'Borsa Italiana', cur: 'EUR', price: 98.4, r1y: 25.1, ytd: 20.2, yld: 0 },
  { sym: 'CSSPX', name: 'iShares Core S&P 500 Acc', type: 'ETF', ex: 'Borsa Italiana', cur: 'EUR', price: 562.1, r1y: 30.6, ytd: 24.8, yld: 0 },
  { sym: 'EIMI', name: 'iShares Core MSCI EM IMI Acc', type: 'ETF', ex: 'Borsa Italiana', cur: 'EUR', price: 33.2, r1y: 13.4, ytd: 9.8, yld: 0 },
  { sym: 'VHYL', name: 'Vanguard FTSE All-World High Div', type: 'ETF', ex: 'Borsa Italiana', cur: 'EUR', price: 66.8, r1y: 18.2, ytd: 13.5, yld: 3.1 },
  { sym: 'BTC', name: 'Bitcoin', type: 'Crypto', ex: 'Crypto', cur: 'USD', price: 62400, r1y: 58.3, ytd: 47.6, yld: 0 },
  { sym: 'ETH', name: 'Ethereum', type: 'Crypto', ex: 'Crypto', cur: 'USD', price: 2450, r1y: -5.4, ytd: 7.2, yld: 0 },
  { sym: 'SOL', name: 'Solana', type: 'Crypto', ex: 'Crypto', cur: 'USD', price: 145.2, r1y: 92.1, ytd: 48.0, yld: 0 },
  { sym: 'BTPV28', name: 'BTP Valore ott 2028', type: 'Obbligazioni', ex: 'MOT', cur: 'EUR', price: 101.2, r1y: 4.1, ytd: 3.4, yld: 3.6 },
  { sym: 'BTP33', name: 'BTP 4,35% nov 2033', type: 'Obbligazioni', ex: 'MOT', cur: 'EUR', price: 104.8, r1y: 6.3, ytd: 4.9, yld: 4.35 },
  { sym: 'BTPI30', name: 'BTP Italia mag 2030', type: 'Obbligazioni', ex: 'MOT', cur: 'EUR', price: 99.6, r1y: 2.8, ytd: 2.1, yld: 1.6 },
  { sym: 'AMGEQ', name: 'Amundi Global Equity A', type: 'Fondi', ex: 'Fondo', cur: 'EUR', price: 18.42, r1y: 17.6, ytd: 13.2, yld: 0 },
  { sym: 'EURIT', name: 'Eurizon Azioni Italia R', type: 'Fondi', ex: 'Fondo', cur: 'EUR', price: 9.87, r1y: 21.3, ytd: 15.9, yld: 0 },
];

export const CATALOG_BY_SYM: Record<string, Security> = Object.fromEntries(
  CATALOG.map((c) => [c.sym, c]),
);
