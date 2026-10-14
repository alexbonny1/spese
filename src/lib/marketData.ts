import { useEffect, useState } from 'react';
import { CATALOG_STATIC_BY_SYM } from '../data/catalog';
import type { FeedRef, Security } from './types';

const TD_API_KEY = import.meta.env.VITE_TD_API_KEY as string | undefined;

const QUOTE_CACHE_KEY = 'saldo-market-quote-v1';
const YIELD_CACHE_KEY = 'saldo-market-yield-v1';
const QUOTE_TTL = 12 * 60 * 60 * 1000; // 12h: dati delayed comunque, non serve più spesso
const YIELD_TTL = 7 * 24 * 60 * 60 * 1000; // 7gg: il dividend yield cambia di rado
const RETRY_COOLDOWN = 60 * 1000; // non ritentare un fetch fallito prima di 1 minuto

export interface ChartPoint {
  t: number;
  v: number;
}

export interface QuoteCacheEntry {
  price: number;
  r1y: number;
  ytd: number;
  min: number;
  max: number;
  series: ChartPoint[];
  fetchedAt: number;
}

interface YieldCacheEntry {
  yld: number;
  fetchedAt: number;
}

function loadJson<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage pieno/non disponibile: si continua solo in memoria
  }
}

const quoteCache: Record<string, QuoteCacheEntry> = loadJson(QUOTE_CACHE_KEY);
const yieldCache: Record<string, YieldCacheEntry> = loadJson(YIELD_CACHE_KEY);
const quoteError: Record<string, boolean> = {};
const lastAttempt: Record<string, number> = {};
const inFlight = new Set<string>();

const subscribers = new Set<() => void>();
function notify() {
  subscribers.forEach((fn) => fn());
}
export function subscribeMarket(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Coda seriale con intervallo minimo tra le chiamate, per restare sotto i limiti del piano gratuito. */
function makeQueue(intervalMs: number) {
  const tasks: Array<() => Promise<void>> = [];
  let running = false;
  async function run() {
    if (running) return;
    running = true;
    while (tasks.length) {
      const task = tasks.shift()!;
      await task().catch(() => {});
      if (tasks.length) await new Promise((r) => setTimeout(r, intervalMs));
    }
    running = false;
  }
  return (task: () => Promise<void>) => {
    tasks.push(task);
    run();
  };
}
const enqueueTd = makeQueue(8000);
const enqueueCg = makeQueue(1500);

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  const data = await res.json();
  if (data?.status === 'error' || data?.code >= 400) throw new Error(data?.message || 'market data error');
  return data;
}

function seriesStats(series: ChartPoint[]) {
  const price = series[series.length - 1].v;
  const oneYearAgo = series[0].v;
  const r1y = oneYearAgo ? ((price - oneYearAgo) / oneYearAgo) * 100 : 0;
  const thisYear = new Date().getFullYear();
  const ytdStart = series.find((p) => new Date(p.t).getFullYear() === thisYear)?.v ?? oneYearAgo;
  const ytd = ytdStart ? ((price - ytdStart) / ytdStart) * 100 : 0;
  const min = Math.min(...series.map((p) => p.v));
  const max = Math.max(...series.map((p) => p.v));
  return { price, r1y, ytd, min, max };
}

async function fetchTdSeries(symbol: string, mic?: string): Promise<QuoteCacheEntry> {
  const micParam = mic ? `&mic_code=${mic}` : '';
  const data = await fetchJson(
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}${micParam}&interval=1day&outputsize=260&apikey=${TD_API_KEY}`,
  );
  const values: Array<{ datetime: string; close: string }> = data.values ?? [];
  if (!values.length) throw new Error('no data');
  const series: ChartPoint[] = values
    .slice()
    .reverse()
    .map((v) => ({ t: new Date(v.datetime).getTime(), v: parseFloat(v.close) }));
  return { ...seriesStats(series), series, fetchedAt: Date.now() };
}

async function fetchTdYield(symbol: string, mic?: string): Promise<number> {
  const micParam = mic ? `&mic_code=${mic}` : '';
  const data = await fetchJson(`https://api.twelvedata.com/statistics?symbol=${encodeURIComponent(symbol)}${micParam}&apikey=${TD_API_KEY}`);
  const y = data?.statistics?.dividends_and_splits?.forward_annual_dividend_yield;
  return typeof y === 'number' ? y * 100 : 0;
}

async function fetchCgSeries(id: string): Promise<QuoteCacheEntry> {
  const data = await fetchJson(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=365&interval=daily`);
  const prices: Array<[number, number]> = data.prices ?? [];
  if (!prices.length) throw new Error('no data');
  const series: ChartPoint[] = prices.map(([t, v]) => ({ t, v }));
  return { ...seriesStats(series), series, fetchedAt: Date.now() };
}

export function getCachedQuote(sym: string): QuoteCacheEntry | undefined {
  return quoteCache[sym];
}
export function getCachedYield(sym: string): number {
  return yieldCache[sym]?.yld ?? 0;
}
export function hasQuoteError(sym: string): boolean {
  return !!quoteError[sym] && !quoteCache[sym];
}

function canAttempt(key: string): boolean {
  const last = lastAttempt[key];
  return !last || Date.now() - last > RETRY_COOLDOWN;
}

/** Avvia (se serve) il recupero di prezzo/rendimenti per un titolo. Non bloccante: aggiorna la cache quando arriva. */
export function ensureQuote(sym: string, feed: FeedRef): void {
  const cached = quoteCache[sym];
  if (cached && Date.now() - cached.fetchedAt < QUOTE_TTL) return;
  const key = `q:${sym}`;
  if (inFlight.has(key) || !canAttempt(key)) return;
  inFlight.add(key);
  lastAttempt[key] = Date.now();

  const task = async () => {
    try {
      const entry = feed.provider === 'cg' ? await fetchCgSeries(feed.id) : await fetchTdSeries(feed.symbol, feed.mic);
      quoteCache[sym] = entry;
      quoteError[sym] = false;
      saveJson(QUOTE_CACHE_KEY, quoteCache);
    } catch {
      quoteError[sym] = true;
    } finally {
      inFlight.delete(key);
      notify();
    }
  };
  if (feed.provider === 'cg') enqueueCg(task);
  else enqueueTd(task);
}

/** Avvia (se serve) il recupero del dividend yield. Solo per titoli Twelve Data (azioni/ETF); la crypto non paga dividendi. */
export function ensureYield(sym: string, feed: FeedRef): void {
  if (feed.provider === 'cg') return;
  const cached = yieldCache[sym];
  if (cached && Date.now() - cached.fetchedAt < YIELD_TTL) return;
  const key = `y:${sym}`;
  if (inFlight.has(key) || !canAttempt(key)) return;
  inFlight.add(key);
  lastAttempt[key] = Date.now();

  enqueueTd(async () => {
    try {
      const yld = await fetchTdYield(feed.symbol, feed.mic);
      yieldCache[sym] = { yld, fetchedAt: Date.now() };
      saveJson(YIELD_CACHE_KEY, yieldCache);
    } catch {
      // yield secondario: se fallisce resta 0, nessun errore mostrato
    } finally {
      inFlight.delete(key);
      notify();
    }
  });
}

/** Catalogo "vivo": metadati statici + ultimi dati di mercato noti (0 finché non ancora arrivati). */
export function liveCatalogBySym(): Record<string, Security> {
  const out: Record<string, Security> = {};
  for (const sym in CATALOG_STATIC_BY_SYM) {
    const s = CATALOG_STATIC_BY_SYM[sym];
    const q = quoteCache[sym];
    out[sym] = {
      ...s,
      price: q?.price ?? 0,
      r1y: q?.r1y ?? 0,
      ytd: q?.ytd ?? 0,
      yld: getCachedYield(sym),
    };
  }
  return out;
}

/**
 * Avvia il caricamento live per i simboli indicati e fa ri-renderizzare il componente
 * quando arrivano nuovi dati. Da usare insieme a `liveCatalogBySym()` nei `useMemo` a valle
 * (aggiungendo il valore restituito qui alle dipendenze).
 */
export function useMarketTick(symbols: string[], opts?: { withYield?: boolean }): number {
  const [tick, setTick] = useState(0);
  const key = symbols.join(',');
  const withYield = !!opts?.withYield;

  useEffect(() => subscribeMarket(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    for (const sym of key ? key.split(',') : []) {
      const s = CATALOG_STATIC_BY_SYM[sym];
      if (!s) continue;
      ensureQuote(sym, s.feed);
      if (withYield) ensureYield(sym, s.feed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, withYield]);

  return tick;
}
