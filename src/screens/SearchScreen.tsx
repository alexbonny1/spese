import { ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FullScreenOverlay } from '../components/FullScreenOverlay';
import { CATALOG_STATIC } from '../data/catalog';
import { fmt } from '../lib/format';
import { useMarketTick } from '../lib/marketData';
import { searchSecurities, TYPE_CHIPS, type TypeFilter } from '../lib/search';
import { useAppState } from '../state/AppStateContext';
import './SearchScreen.css';

const ALL_SYMS = CATALOG_STATIC.map((c) => c.sym);

interface SearchScreenProps {
  prefill: number | null;
  onBack: () => void;
  onOpenAsset: (sym: string) => void;
}

export function SearchScreen({ prefill, onBack, onOpenAsset }: SearchScreenProps) {
  const { data } = useAppState();
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeFilter>('Tutti');

  const marketTick = useMarketTick(ALL_SYMS);
  const results = useMemo(() => searchSecurities(data, q, type), [data, q, type, marketTick]);

  return (
    <FullScreenOverlay>
      <div className="search-top">
        <button type="button" className="btn btn-icon btn-ghost" onClick={onBack}>
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <input
          className="input search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca titolo, ticker o ISIN"
        />
      </div>

      {prefill != null && <div className="search-prefill">Scegli dove investire € {fmt(prefill)}</div>}

      <div className="search-chips">
        {TYPE_CHIPS.map((t) => (
          <button
            key={t}
            type="button"
            className="search-chip"
            style={{
              borderColor: type === t ? 'var(--color-accent)' : 'var(--color-divider)',
              background: type === t ? 'var(--color-accent-100)' : 'transparent',
              color: type === t ? 'var(--color-accent-800)' : 'var(--color-text)',
            }}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="search-results">
        {results.map((r) => (
          <button key={r.sym} type="button" className="search-row" onClick={() => onOpenAsset(r.sym)}>
            <div className="search-row-ticker">{r.sym}</div>
            <div className="search-row-text">
              <span className="search-row-name">{r.name}</span>
              <span className="search-row-sub">
                {r.type} · {r.ex}
                {r.ownedLabel}
              </span>
            </div>
            <div className="search-row-amounts">
              {r.errored ? (
                <span className="search-row-price search-row-error">dati non disponibili</span>
              ) : (
                <>
                  <span className="search-row-price">{r.priceF}</span>
                  <span className="search-row-r1y" style={{ color: r.ready ? r.color : 'var(--color-neutral-700)' }}>
                    {r.r1yF} 1 anno
                  </span>
                </>
              )}
            </div>
          </button>
        ))}
        {results.length === 0 && <p className="search-empty">Nessun titolo trovato.</p>}
      </div>
    </FullScreenOverlay>
  );
}
