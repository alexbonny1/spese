import type { AppData } from '../lib/types';

/** Stato alla primissima apertura: nessun movimento, in attesa della schermata di benvenuto. */
export function emptyData(): AppData {
  return {
    incomes: [],
    fixed: [],
    tx: [],
    piggies: [],
    lots: [],
    pacs: [],
    payday: 1,
    alert: 0,
    perDay: true,
    extra: true,
    onboarded: false,
    initialCash: 0,
    initialBank: 0,
    initialInvested: 0,
  };
}
