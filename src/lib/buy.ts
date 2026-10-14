import { toEur } from './calc';
import type { Security } from './types';

export type BuyMode = 'qty' | 'amt';

export interface BuyComputed {
  qty: number;
  price: number;
  fee: number;
  /** totale in € */
  tot: number;
  pacDay: number;
  invalid: boolean;
}

function num(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

/**
 * Replica il calcolo di `bv` nello Sheet Acquisto del prototipo.
 * Modalità "qty": quote × prezzo (+ commissioni). Modalità "amt": l'importo
 * investito (commissioni incluse) determina le quote acquistabili.
 */
export function computeBuy(
  security: Security,
  mode: BuyMode,
  qtyStr: string,
  priceStr: string,
  amtStr: string,
  feeStr: string,
  pac: boolean,
  pacDayStr: string,
): BuyComputed {
  const fee = num(feeStr) || 0;
  let qty = 0;
  let price = 0;
  let tot = 0;

  if (mode === 'qty') {
    qty = num(qtyStr);
    price = num(priceStr);
    tot = qty > 0 && price > 0 ? toEur(security, qty * price) + fee : 0;
  } else {
    const amt = num(amtStr);
    price = security.price;
    qty = amt > fee ? (amt - fee) / toEur(security, price) : 0;
    tot = amt > 0 ? amt : 0;
  }

  const pacDay = parseInt(pacDayStr, 10);
  const invalid = !(qty > 0) || !(tot > 0) || (pac && !(pacDay >= 1 && pacDay <= 28));
  return { qty, price, fee, tot, pacDay, invalid };
}
