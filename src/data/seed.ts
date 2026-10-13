import type { AppData } from '../lib/types';

/** Dati di esempio, per sviluppo e per "Ripristina dati di esempio". */
export function seed(): AppData {
  return {
    incomes: [
      { id: 'i1', name: 'Stipendio', amt: 1850, day: 1 },
      { id: 'i2', name: 'Freelance', amt: 320, day: 10 },
    ],
    fixed: [
      { id: 'f1', name: 'Affitto', amt: 650, day: 1 },
      { id: 'f2', name: 'Bollette luce e gas', amt: 85, day: 15 },
      { id: 'f3', name: 'Telefono', amt: 12.99, day: 18 },
      { id: 'f4', name: 'Palestra', amt: 35, day: 20 },
      { id: 'f5', name: 'Netflix', amt: 12.99, day: 22 },
      { id: 'f6', name: 'Assicurazione auto', amt: 48, day: 28 },
    ],
    tx: [
      { id: 't1', name: 'Esselunga', cat: 'Spesa', amt: -84.3, day: 3 },
      { id: 't2', name: 'Benzina', cat: 'Trasporti', amt: -60, day: 5 },
      { id: 't3', name: 'Cena fuori', cat: 'Ristoranti', amt: -46.5, day: 8 },
      { id: 't4', name: 'Spesa settimanale', cat: 'Spesa', amt: -72.4, day: 10 },
      { id: 't5', name: 'Cinema', cat: 'Svago', amt: -19, day: 11 },
      { id: 't6', name: 'Amazon', cat: 'Casa', amt: -38.9, day: 12 },
      { id: 't7', name: 'Treno Milano', cat: 'Trasporti', amt: -24.8, day: 13 },
      { id: 't8', name: 'Supermercato', cat: 'Spesa', amt: -66.5, day: 14 },
    ],
    piggies: [
      {
        id: 'p1', name: 'Fondo emergenza', goal: 5000, tm: 12, ty: 2027, quota: 100, base: 2350,
        hist: [
          { id: 'h1', date: '1 set', label: 'Quota mensile', amt: 100 },
          { id: 'h2', date: '1 ago', label: 'Quota mensile', amt: 100 },
          { id: 'h3', date: '20 lug', label: 'Prelievo', amt: -300 },
        ],
      },
      {
        id: 'p2', name: 'Vacanze Giappone', goal: 3000, tm: 6, ty: 2027, quota: 150, base: 900,
        hist: [
          { id: 'h4', date: '9 ott', label: 'Versamento', amt: 100, cur: true },
          { id: 'h5', date: '1 set', label: 'Quota mensile', amt: 150 },
        ],
      },
      {
        id: 'p3', name: 'Auto nuova', goal: 8000, tm: 12, ty: 2028, quota: 50, base: 1200,
        hist: [{ id: 'h6', date: '1 set', label: 'Quota mensile', amt: 50 }],
      },
    ],
    lots: [
      { id: 'l1', sym: 'VWCE', qty: 18, price: 108.4, fee: 2.95, date: '5 mar 2025' },
      { id: 'l2', sym: 'AAPL', qty: 5, price: 190, fee: 9, date: '12 nov 2024' },
      { id: 'l3', sym: 'ENI', qty: 120, price: 13.8, fee: 5, date: '3 feb 2026' },
      { id: 'l4', sym: 'BTC', qty: 0.015, price: 55000, fee: 1.5, date: '20 giu 2025' },
      { id: 'l5', sym: 'BTPV28', qty: 20, price: 99.5, fee: 4, date: '8 gen 2026' },
    ],
    pacs: [{ id: 'c1', sym: 'VWCE', amt: 150, day: 5 }],
    payday: 1,
    alert: 0,
    perDay: true,
    extra: true,
  };
}
