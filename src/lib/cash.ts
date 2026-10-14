import type { AppData } from './types';

export interface CashBalances {
  cash: number;
  bank: number;
}

export function netTxByMethod(data: AppData, method: 'cash' | 'card'): number {
  return data.tx.filter((t) => t.method === method).reduce((x, t) => x + t.amt, 0);
}

/** Saldo "vivo" di contanti e conto/carta: patrimonio di partenza + movimenti taggati con quel metodo. */
export function computeCashBalances(data: AppData): CashBalances {
  return {
    cash: data.initialCash + netTxByMethod(data, 'cash'),
    bank: data.initialBank + netTxByMethod(data, 'card'),
  };
}
