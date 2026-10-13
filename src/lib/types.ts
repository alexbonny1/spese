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

export type SecurityType = 'Azioni' | 'ETF' | 'Crypto' | 'Obbligazioni' | 'Fondi';
export type Currency = 'EUR' | 'USD';

export interface Security {
  sym: string;
  name: string;
  type: SecurityType;
  ex: string;
  cur: Currency;
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
}
