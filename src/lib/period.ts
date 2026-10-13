import { MESI, MESI_FULL } from './format';

export interface Period {
  /** primo giorno del periodo corrente */
  start: Date;
  /** ultimo giorno del periodo corrente */
  end: Date;
  /** giorni che restano da oggi (incluso) al giorno prima del prossimo stipendio */
  daysLeft: number;
  label: string;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Il periodo va dal giorno dello stipendio al giorno prima del prossimo.
 * Usa Date invece dell'aritmetica su "31 giorni" del prototipo, così
 * funziona correttamente anche attraverso mesi di lunghezza diversa.
 */
export function getPeriod(today: Date, payday: number): Period {
  const t = startOfDay(today);
  const day = t.getDate();
  const start = day >= payday
    ? new Date(t.getFullYear(), t.getMonth(), payday)
    : new Date(t.getFullYear(), t.getMonth() - 1, payday);
  const next = new Date(start.getFullYear(), start.getMonth() + 1, payday);
  const end = new Date(next.getTime() - 86400000);
  const daysLeft = Math.round((next.getTime() - t.getTime()) / 86400000);
  const label = payday === 1
    ? `${MESI_FULL[start.getMonth()]} ${start.getFullYear()}`
    : `${start.getDate()} ${MESI[start.getMonth()]} – ${end.getDate()} ${MESI[end.getMonth()]}`;
  return { start, end, daysLeft, label };
}
