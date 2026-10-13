export interface ChartPoints {
  /** punti polyline SVG, viewBox 320x120 */
  pts: string;
  /** punti polygon per il riempimento (area sotto la linea) */
  area: string;
  min: number;
  max: number;
}

/**
 * Replica `chart()` del prototipo: andamento a 1 anno pseudo-casuale ma
 * deterministico (seed derivato dal ticker), dal prezzo di un anno fa
 * (dedotto da r1y) al prezzo attuale.
 */
export function computeChart(sym: string, price: number, r1y: number): ChartPoints {
  const n = 30;
  let seed = 0;
  for (const ch of sym) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;

  const start = price / (1 + r1y / 100);
  const v: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const noise = Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 0.6 + seed * 0.3) * 0.5;
    v.push(start + (price - start) * t + noise * price * 0.035);
  }
  v[0] = start;
  v[n - 1] = price;

  const min = Math.min(...v);
  const max = Math.max(...v);
  const pts = v
    .map((x, i) => `${((i / (n - 1)) * 320).toFixed(1)},${(112 - ((x - min) / (max - min || 1)) * 104).toFixed(1)}`)
    .join(' ');
  return { pts, area: `0,120 ${pts} 320,120`, min, max };
}
