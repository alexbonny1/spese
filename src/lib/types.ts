export interface Income {
  id: string;
  name: string;
  amt: number;
  day: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  amt: number;
  day: number;
}

export interface Transaction {
  id: string;
  name: string;
  cat: string;
  /** positive = entrata, negative = uscita */
  amt: number;
  day: number;
  lotId?: string;
}

export interface PiggyHistEntry {
  id: string;
  date: string;
  label: string;
  amt: number;
  /** true = versamento/prelievo manuale del mese corrente, non ancora archiviato */
  cur?: boolean;
}

export interface Piggy {
  id: string;
  name: string;
  goal: number;
  /** mese target, 1-12 */
  tm: number;
  ty: number;
  quota: number;
  base: number;
  hist: PiggyHistEntry[];
}

export interface Lot {
  id: string;
  sym: string;
  qty: number;
  /** prezzo nella valuta originale del titolo */
  price: number;
  fee: number;
  date: string;
}

export interface Pac {
  id: string;
  sym: string;
  amt: number;
  day: number;
}

export type SecurityType = 'Azioni' | 'ETF' | 'Crypto';
export type Currency = 'EUR' | 'USD';

/**
 * Da dove recuperare il prezzo: Twelve Data (azioni/ETF), CoinGecko (crypto),
 * o "manuale" per i titoli senza un feed gratuito (es. ETF UCITS europei non
 * coperti dal piano free) — il prezzo lo aggiorna l'utente a mano.
 */
export type FeedRef =
  | { provider: 'td'; symbol: string; mic?: string }
  | { provider: 'cg'; id: string }
  | { provider: 'manual' };

export interface SecurityStatic {
  sym: string;
  name: string;
  type: SecurityType;
  ex: string;
  cur: Currency;
  feed: FeedRef;
}

export interface Security extends SecurityStatic {
  /** Questi quattro campi sono dati di mercato reali, recuperati live e messi in cache; 0 finché non sono ancora arrivati. */
  price: number;
  r1y: number;
  ytd: number;
  yld: number;
}

export interface AppData {
  incomes: Income[];
  fixed: FixedExpense[];
  tx: Transaction[];
  piggies: Piggy[];
  lots: Lot[];
  pacs: Pac[];
  /** giorno dello stipendio, 1-28 */
  payday: number;
  /** soglia avviso € al giorno, 0 = disattivato */
  alert: number;
  perDay: boolean;
  extra: boolean;
  /** true dopo la schermata di benvenuto (patrimonio iniziale impostato) */
  onboarded: boolean;
  /** contanti dichiarati in fase di benvenuto: si somma allo spendibile */
  initialCash: number;
  /** saldo conto dichiarato in fase di benvenuto: si somma allo spendibile */
  initialBank: number;
  /** valore investito già in essere, non legato a titoli specifici: si somma al patrimonio investito */
  initialInvested: number;
  /** prezzo (€) aggiornato a mano per i titoli con feed "manual", per simbolo */
  manualPrices: Record<string, number>;
}
