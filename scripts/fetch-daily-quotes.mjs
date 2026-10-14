// Aggiorna src/data/dailyQuotes.json con l'ultimo prezzo reale per i titoli a feed
// "manual" che hanno un equivalente su Yahoo Finance. Gira server-side (GitHub Actions),
// non nel browser: Yahoo Finance non manda header CORS, quindi da lì non è raggiungibile,
// ma una richiesta server-side non ha questo limite.
//
// Se una richiesta fallisce, il prezzo precedente per quel simbolo resta invariato nel
// JSON (nessun azzeramento accidentale per un errore temporaneo di Yahoo).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../src/data/dailyQuotes.json');

// sym Saldo -> ticker Yahoo Finance
const SYMBOLS = {
  IWDA: 'IWDA.AS',
  QDVE: 'QDVE.DE',
};

async function fetchPrice(yahooTicker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?range=1d&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (typeof price !== 'number') throw new Error('prezzo non trovato nella risposta');
  return price;
}

function loadExisting() {
  try {
    return JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function main() {
  const quotes = loadExisting();
  const today = new Date().toISOString().slice(0, 10);

  for (const [sym, yahooTicker] of Object.entries(SYMBOLS)) {
    try {
      const price = await fetchPrice(yahooTicker);
      quotes[sym] = { price: Math.round(price * 100) / 100, updatedAt: today };
      console.log(`${sym} (${yahooTicker}): € ${price}`);
    } catch (e) {
      console.error(`${sym} (${yahooTicker}): errore, valore precedente mantenuto — ${e.message}`);
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(quotes, null, 2) + '\n');
}

main();
