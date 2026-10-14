import type { ChartPoint } from './marketData';

export interface ChartPoints {
  /** punti polyline SVG, viewBox 320x120 */
  pts: string;
  /** punti polygon per il riempimento (area sotto la linea) */
  area: string;
  min: number;
  max: number;
}

/** Converte una serie storica reale (prezzi di chiusura ~1 anno) nei punti SVG del grafico. */
export function computeChartFromSeries(series: ChartPoint[]): ChartPoints {
  const n = series.length;
  const min = Math.min(...series.map((p) => p.v));
  const max = Math.max(...series.map((p) => p.v));
  const pts = series
    .map((p, i) => `${((i / (n - 1)) * 320).toFixed(1)},${(112 - ((p.v - min) / (max - min || 1)) * 104).toFixed(1)}`)
    .join(' ');
  return { pts, area: `0,120 ${pts} 320,120`, min, max };
}
