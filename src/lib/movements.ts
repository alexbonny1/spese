import type { AppData } from './types';
import { fmt, MESI_FULL_LOWER, signColor } from './format';

export type MovementFilter = 'all' | 'in' | 'out';

export interface MovementRow {
  id: string;
  name: string;
  cat: string;
  amtF: string;
  color: string;
  isInv: boolean;
}

export interface MovementGroup {
  label: string;
  totF: string;
  items: MovementRow[];
}

export interface MovementsVals {
  movInF: string;
  movOutF: string;
  groups: MovementGroup[];
  empty: boolean;
}

/** Replica la sezione Movimenti di `renderVals()` del prototipo. */
export function computeMovements(data: AppData, today: Date, filter: MovementFilter): MovementsVals {
  const todayDay = today.getDate();
  const monthFull = MESI_FULL_LOWER[today.getMonth()];

  const sorted = [...data.tx].sort((a, b) => b.day - a.day);
  const filtered = sorted.filter((t) => filter === 'all' || (filter === 'in' ? t.amt > 0 : t.amt < 0));
  const days = [...new Set(filtered.map((t) => t.day))];

  const groups: MovementGroup[] = days.map((d) => {
    const items = filtered.filter((t) => t.day === d);
    const tot = items.reduce((x, t) => x + t.amt, 0);
    return {
      label: d === todayDay ? 'Oggi' : d === todayDay - 1 ? 'Ieri' : `${d} ${monthFull}`,
      totF: (tot >= 0 ? '+ ' : '− ') + fmt(tot),
      items: items.map((t) => ({
        id: t.id,
        name: t.name,
        cat: t.cat,
        amtF: (t.amt > 0 ? '+ ' : '− ') + fmt(t.amt),
        color: signColor(t.amt),
        isInv: !!t.lotId,
      })),
    };
  });

  return {
    movInF: fmt(filtered.filter((t) => t.amt > 0).reduce((x, t) => x + t.amt, 0)),
    movOutF: fmt(-filtered.filter((t) => t.amt < 0).reduce((x, t) => x + t.amt, 0)),
    groups,
    empty: groups.length === 0,
  };
}
